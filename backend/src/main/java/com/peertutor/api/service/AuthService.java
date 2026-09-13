package com.peertutor.api.service;

import com.peertutor.api.dto.AuthResponse;
import com.peertutor.api.dto.ForgotPasswordRequest;
import com.peertutor.api.dto.LoginRequest;
import com.peertutor.api.dto.MessageResponse;
import com.peertutor.api.dto.OtpVerifyRequest;
import com.peertutor.api.dto.RegisterRequest;
import com.peertutor.api.dto.ResetPasswordRequest;
import com.peertutor.api.entity.Role;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.UserRepository;
import com.peertutor.api.security.JwtService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    // =========================================================================
    // STEP 1: Register — save unverified user, generate & send OTP
    // =========================================================================

    public MessageResponse register(RegisterRequest request) {
        var existingUser = userRepository.findByEmail(request.getEmail());

        if (existingUser.isPresent()) {
            User existing = existingUser.get();
            if (existing.isEmailVerified()) {
                // Fully registered account — reject
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
            }
            // Unverified account — overwrite details and resend OTP
            String otp = generateOtp();
            existing.setName(request.getName());
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
            existing.setOtpCode(otp);
            existing.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10));
            userRepository.save(existing);

            try {
                emailService.sendOtpEmail(existing.getEmail(), otp);
            } catch (Exception e) {
                log.warn("Failed to send OTP email to {}: {}", existing.getEmail(), e.getMessage());
            }

            return MessageResponse.builder().message("OTP sent to email").build();
        }

        // Brand-new account
        String otp = generateOtp();

        var user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.USER)
                .isEmailVerified(false)
                .otpCode(otp)
                .otpExpiryTime(LocalDateTime.now().plusMinutes(10))
                .build();

        userRepository.save(user);

        try {
            emailService.sendOtpEmail(request.getEmail(), otp);
        } catch (Exception e) {
            log.warn("Failed to send OTP email to {}: {}", request.getEmail(), e.getMessage());
        }

        return MessageResponse.builder()
                .message("OTP sent to email")
                .build();
    }

    // =========================================================================
    // STEP 2: Verify OTP — validate code, mark verified, return JWT
    // =========================================================================

    public AuthResponse verifyOtp(OtpVerifyRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found for this email"));

        if (user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already verified");
        }

        if (user.getOtpCode() == null || !user.getOtpCode().equals(request.getOtp())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP code");
        }

        if (user.getOtpExpiryTime() == null || LocalDateTime.now().isAfter(user.getOtpExpiryTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP has expired — please request a new one");
        }

        // Mark verified and clear OTP fields
        user.setEmailVerified(true);
        user.setOtpCode(null);
        user.setOtpExpiryTime(null);
        userRepository.save(user);

        log.info("User {} verified their email successfully", user.getEmail());

        String jwtToken = jwtService.generateToken(user);

        return buildAuthResponse(user, jwtToken);
    }

    // =========================================================================
    // RESEND OTP — regenerate and resend without re-creating the user
    // =========================================================================

    public MessageResponse resendOtp(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No account found for this email"));

        if (user.isEmailVerified()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Email is already verified");
        }

        String newOtp = generateOtp();
        user.setOtpCode(newOtp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        try {
            emailService.sendOtpEmail(user.getEmail(), newOtp);
        } catch (Exception e) {
            log.warn("Failed to resend OTP to {}: {}", user.getEmail(), e.getMessage());
        }

        return MessageResponse.builder().message("New OTP sent to email.").build();
    }

    // =========================================================================
    // LOGIN — blocks unverified accounts
    // =========================================================================

    public AuthResponse login(LoginRequest request) {
        // Check for unverified account BEFORE Spring Security runs,
        // so we surface a specific sentinel error rather than the generic "User is disabled".
        userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
            if (!u.isEmailVerified()) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "UNVERIFIED_ACCOUNT");
            }
        });

        // Authenticate credentials (throws BadCredentialsException if wrong)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        var jwtToken = jwtService.generateToken(user);

        return buildAuthResponse(user, jwtToken);
    }

    // =========================================================================
    // FORGOT PASSWORD — generate reset token, send email
    // =========================================================================

    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        // Silently ignore unknown emails to prevent email enumeration
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            String resetToken = UUID.randomUUID().toString();
            user.setResetToken(resetToken);
            user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));
            userRepository.save(user);

            try {
                emailService.sendPasswordResetEmail(user.getEmail(), resetToken);
            } catch (Exception e) {
                log.warn("Failed to send password reset email to {}: {}", user.getEmail(), e.getMessage());
            }
        });

        return MessageResponse.builder()
                .message("If that email is registered, a password reset link has been sent")
                .build();
    }

    // =========================================================================
    // RESET PASSWORD — validate token, update password, clear token
    // =========================================================================

    public MessageResponse resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid or expired reset token"));

        if (user.getResetTokenExpiry() == null || LocalDateTime.now().isAfter(user.getResetTokenExpiry())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Reset token has expired — please request a new one");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        userRepository.save(user);

        log.info("Password reset successfully for user {}", user.getEmail());

        return MessageResponse.builder()
                .message("Password reset successfully. You can now log in with your new password.")
                .build();
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    /**
     * Generates a 6-digit numeric OTP using a cryptographically secure RNG.
     */
    private String generateOtp() {
        int otp = 100_000 + SECURE_RANDOM.nextInt(900_000);
        return String.valueOf(otp);
    }

    private AuthResponse buildAuthResponse(User user, String jwtToken) {
        return AuthResponse.builder()
                .token(jwtToken)
                .userId(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .profileImage(user.getProfileImage())
                .avatarUrl(user.getProfileImage())
                .bio(user.getBio())
                .fieldOfStudy(user.getFieldOfStudy())
                .portfolioUrl(user.getPortfolioUrl())
                .repositoryUrl(user.getRepositoryUrl())
                .build();
    }
}
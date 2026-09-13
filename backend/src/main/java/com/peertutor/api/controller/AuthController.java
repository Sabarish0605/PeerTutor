package com.peertutor.api.controller;

import com.peertutor.api.dto.AuthResponse;
import com.peertutor.api.dto.ForgotPasswordRequest;
import com.peertutor.api.dto.LoginRequest;
import com.peertutor.api.dto.MessageResponse;
import com.peertutor.api.dto.OtpVerifyRequest;
import com.peertutor.api.dto.RegisterRequest;
import com.peertutor.api.dto.ResetPasswordRequest;
import com.peertutor.api.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * STEP 1 of registration. Saves the user (unverified) and sends a 6-digit OTP.
     * Returns { "message": "OTP sent to email" } — NO JWT yet.
     */
    @PostMapping("/register")
    public ResponseEntity<MessageResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        return ResponseEntity.ok(authService.register(request));
    }

    /**
     * STEP 2 of registration. Validates the OTP and returns a full AuthResponse with JWT.
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<AuthResponse> verifyOtp(
            @Valid @RequestBody OtpVerifyRequest request
    ) {
        return ResponseEntity.ok(authService.verifyOtp(request));
    }

    /**
     * Resends a fresh OTP to an unverified account. Does NOT recreate the user.
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<MessageResponse> resendOtp(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        return ResponseEntity.ok(authService.resendOtp(request));
    }

    /**
     * Authenticates credentials and returns JWT. Blocks unverified accounts (HTTP 403).
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        return ResponseEntity.ok(authService.login(request));
    }

    /**
     * Accepts an email and sends a 15-minute password reset link if the account exists.
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request
    ) {
        return ResponseEntity.ok(authService.forgotPassword(request));
    }

    /**
     * Validates the reset token and updates the user's password.
     */
    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request
    ) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}
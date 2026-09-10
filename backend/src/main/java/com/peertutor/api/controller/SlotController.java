package com.peertutor.api.controller;

import com.peertutor.api.entity.CourseSlot;
import com.peertutor.api.entity.User;
import com.peertutor.api.repository.CourseSlotRepository;
import com.peertutor.api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/slots")
@RequiredArgsConstructor
public class SlotController {

    private final CourseSlotRepository courseSlotRepository;
    private final UserRepository userRepository;

    /**
     * PUT /api/slots/{slotId}/start
     * Tutor starts a session — transitions SCHEDULED → LIVE.
     * Only allowed within 15 minutes before startTime.
     */
    @PutMapping("/{slotId}/start")
    public ResponseEntity<Map<String, String>> startSession(
            @PathVariable Long slotId,
            Principal principal
    ) {
        CourseSlot slot = getSlotAndVerifyOwner(slotId, principal);

        if (!"SCHEDULED".equals(slot.getSessionStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Session can only be started from SCHEDULED status. Current: " + slot.getSessionStatus());
        }

        // Must be within 15 minutes of startTime
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime allowFrom = slot.getStartTime().minusMinutes(15);
        if (now.isBefore(allowFrom)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Session can only be started within 15 minutes of the scheduled start time.");
        }

        slot.setSessionStatus("LIVE");
        courseSlotRepository.save(slot);
        return ResponseEntity.ok(Map.of("status", "LIVE", "message", "Session is now LIVE."));
    }

    /**
     * PUT /api/slots/{slotId}/close
     * Tutor closes an active session — transitions LIVE → CLOSED.
     * After closing, the meet link is hidden and reviews are unlocked for enrolled students.
     */
    @PutMapping("/{slotId}/close")
    public ResponseEntity<Map<String, String>> closeSession(
            @PathVariable Long slotId,
            Principal principal
    ) {
        CourseSlot slot = getSlotAndVerifyOwner(slotId, principal);

        if (!"LIVE".equals(slot.getSessionStatus())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Session can only be closed from LIVE status. Current: " + slot.getSessionStatus());
        }

        slot.setSessionStatus("CLOSED");
        courseSlotRepository.save(slot);
        return ResponseEntity.ok(Map.of("status", "CLOSED", "message", "Session closed. Students may now leave reviews."));
    }

    // ── Helper ────────────────────────────────────────────────────────────────

    private CourseSlot getSlotAndVerifyOwner(Long slotId, Principal principal) {
        if (principal == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Authentication required.");
        }

        CourseSlot slot = courseSlotRepository.findById(slotId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Slot not found: " + slotId));

        User caller = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found."));

        // Verify the caller owns the course this slot belongs to
        Long courseAuthorId = slot.getCourse().getAuthor().getId();
        if (!courseAuthorId.equals(caller.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,
                    "You do not own the course this slot belongs to.");
        }

        return slot;
    }
}

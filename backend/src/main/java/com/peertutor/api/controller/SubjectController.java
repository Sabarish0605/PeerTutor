package com.peertutor.api.controller;

import com.peertutor.api.dto.SubjectRequest;
import com.peertutor.api.entity.Subject;
import com.peertutor.api.service.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
@RequiredArgsConstructor
public class SubjectController {

    private final SubjectService subjectService;

    // Anyone can view the subjects
    @GetMapping
    public ResponseEntity<List<Subject>> getAllSubjects() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    // Normally we'd secure this with @PreAuthorize("hasRole('ADMIN')"), but we'll keep it simple for testing
    @PostMapping
    public ResponseEntity<Subject> createSubject(
            @Valid @RequestBody SubjectRequest request
    ) {
        return ResponseEntity.ok(subjectService.createSubject(request));
    }
}
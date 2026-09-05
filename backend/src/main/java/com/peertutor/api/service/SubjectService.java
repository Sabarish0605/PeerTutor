package com.peertutor.api.service;

import com.peertutor.api.dto.SubjectRequest;
import com.peertutor.api.entity.Subject;
import com.peertutor.api.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final SubjectRepository subjectRepository;

    // Fetch all subjects for the frontend dropdowns
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    // Admin endpoint to add a new master subject
    public Subject createSubject(SubjectRequest request) {
        Subject subject = Subject.builder()
                .name(request.getName())
                .category(request.getCategory())
                .build();

        return subjectRepository.save(subject);
    }
}
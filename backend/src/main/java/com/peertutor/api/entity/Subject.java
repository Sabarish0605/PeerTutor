package com.peertutor.api.entity;

import java.util.List;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name = "subjects")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Subject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name; // e.g., "Java", "Calculus"

    @Column(nullable = false)
    private String category; // e.g., "Programming", "Mathematics"

    @JsonIgnore // <--- Added to prevent infinite JSON recursion
    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL)
    private List<Course> courses;
}
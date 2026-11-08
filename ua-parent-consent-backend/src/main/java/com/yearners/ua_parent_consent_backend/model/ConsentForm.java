package com.yearners.ua_parent_consent_backend.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "consent_forms")
@Data
public class ConsentForm {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String className;

    @Column(nullable = false)
    private LocalDate activityDate;

    @Column(nullable = false)
    private String location;

    @Column(nullable = false)
    private LocalDate deadline;

    @Column(columnDefinition = "TEXT")
    private String instructions;

    @Column(nullable = false)
    private String status = "Published";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

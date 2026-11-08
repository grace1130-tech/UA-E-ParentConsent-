package com.yearners.ua_parent_consent_backend.model;

import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "parent_consent_responses",
        uniqueConstraints = {
                @UniqueConstraint(
                        columnNames = {"parent_id", "consent_form_id"}
                )
        }
)
@Data
public class ParentConsentResponse {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = false)
    private User parent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consent_form_id", nullable = false)
    private ConsentForm consentForm;

    @Column(nullable = false)
    private String decision;

    @Column(nullable = false, length = 120)
    private String printedName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String signature;

    @Column(nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();
}

package com.yearners.ua_parent_consent_backend.repository;

import com.yearners.ua_parent_consent_backend.model.ParentConsentResponse;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParentConsentResponseRepository
        extends JpaRepository<ParentConsentResponse, Long> {

    // Get all responses submitted by a specific parent
    List<ParentConsentResponse> findByParentId(Long parentId);

    // Get all responses for a specific consent form
    List<ParentConsentResponse> findByConsentFormId(Long consentFormId);

    // Check whether a parent already submitted a response
    Optional<ParentConsentResponse> findByParentIdAndConsentFormId(
            Long parentId,
            Long consentFormId
    );

    // Get responses belonging to a specific teacher
    List<ParentConsentResponse> findByConsentForm_Teacher_Id(Long teacherId);
}

package com.yearners.ua_parent_consent_backend.repository;

import com.yearners.ua_parent_consent_backend.model.ConsentForm;
import com.yearners.ua_parent_consent_backend.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ConsentFormRepository extends JpaRepository<ConsentForm, Long> {

    List<ConsentForm> findByTeacher(User teacher);

    List<ConsentForm> findByTeacherId(Long teacherId);

    List<ConsentForm> findByStatus(String status);

    // Count submitted responses for each consent form
    @Query("""
        SELECT COUNT(r)
        FROM ParentConsentResponse r
        WHERE r.consentForm.id = :formId
    """)
    Long countResponsesByFormId(@Param("formId") Long formId);

    // Count Agree responses for each consent form
    @Query("""
        SELECT COUNT(r)
        FROM ParentConsentResponse r
        WHERE r.consentForm.id = :formId
        AND LOWER(r.decision) = 'agree'
    """)
    Long countAgreedByFormId(@Param("formId") Long formId);

    // Count Disagree responses for each consent form
    @Query("""
        SELECT COUNT(r)
        FROM ParentConsentResponse r
        WHERE r.consentForm.id = :formId
        AND LOWER(r.decision) = 'disagree'
    """)
    Long countDisagreedByFormId(@Param("formId") Long formId);
}

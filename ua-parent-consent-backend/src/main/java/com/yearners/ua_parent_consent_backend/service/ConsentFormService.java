
package com.yearners.ua_parent_consent_backend.service;

import com.yearners.ua_parent_consent_backend.dto.CreateConsentFormRequest;
import com.yearners.ua_parent_consent_backend.dto.ConsentFormResponse;
import com.yearners.ua_parent_consent_backend.model.ConsentForm;
import com.yearners.ua_parent_consent_backend.model.User;
import com.yearners.ua_parent_consent_backend.repository.ConsentFormRepository;
import com.yearners.ua_parent_consent_backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Locale;

@Service
public class ConsentFormService {

    private final ConsentFormRepository consentFormRepository;
    private final UserRepository userRepository;

    public ConsentFormService(
            ConsentFormRepository consentFormRepository,
            UserRepository userRepository) {
        this.consentFormRepository = consentFormRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ConsentFormResponse createForm(
            CreateConsentFormRequest request,
            String teacherEmail,
            String status) {

        if (teacherEmail == null || teacherEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated teacher email is missing."
            );
        }

        String normalizedEmail =
                teacherEmail.trim().toLowerCase(Locale.ROOT);

        User teacher = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Teacher account not found.")
                );

        if (!"TEACHER".equalsIgnoreCase(teacher.getRole())) {
            throw new IllegalArgumentException(
                    "Only teachers can create consent forms."
            );
        }

        if (!"Draft".equals(status) && !"Published".equals(status)) {
            throw new IllegalArgumentException(
                    "Invalid consent form status."
            );
        }

        if (request.getDeadline().isAfter(request.getActivityDate())) {
            throw new IllegalArgumentException(
                    "The submission deadline cannot be after the activity date."
            );
        }

        if (request.getActivityDate().isBefore(LocalDate.now())
                || request.getDeadline().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException(
                    "Activity date and deadline cannot be in the past."
            );
        }

        ConsentForm form = new ConsentForm();

        form.setTitle(request.getTitle());
        form.setDescription(request.getDescription());
        form.setClassName(request.getClassName());
        form.setActivityDate(request.getActivityDate());
        form.setLocation(request.getLocation());
        form.setDeadline(request.getDeadline());
        form.setInstructions(request.getInstructions());
        form.setStatus(status);
        form.setTeacher(teacher);

        ConsentForm savedForm = consentFormRepository.save(form);

        return ConsentFormResponse.from(savedForm);
    }

    @Transactional(readOnly = true)
    public List<ConsentFormResponse> getMyForms(String teacherEmail) {

        if (teacherEmail == null || teacherEmail.isBlank()) {
            throw new IllegalArgumentException(
                    "Authenticated teacher email is missing."
            );
        }

        String normalizedEmail =
                teacherEmail.trim().toLowerCase(Locale.ROOT);

        User teacher = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() ->
                        new IllegalArgumentException("Teacher account not found.")
                );

        return consentFormRepository.findByTeacher(teacher)
                .stream()
                .map(ConsentFormResponse::from)
                .toList();
    }
}

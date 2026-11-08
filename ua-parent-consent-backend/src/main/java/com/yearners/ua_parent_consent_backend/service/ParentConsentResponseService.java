
package com.yearners.ua_parent_consent_backend.service;

import com.yearners.ua_parent_consent_backend.dto.SubmitConsentRequest;
import com.yearners.ua_parent_consent_backend.dto.ParentConsentResponseDto;
import com.yearners.ua_parent_consent_backend.model.ConsentForm;
import com.yearners.ua_parent_consent_backend.model.ParentConsentResponse;
import com.yearners.ua_parent_consent_backend.model.User;
import com.yearners.ua_parent_consent_backend.repository.ConsentFormRepository;
import com.yearners.ua_parent_consent_backend.repository.ParentConsentResponseRepository;
import com.yearners.ua_parent_consent_backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class ParentConsentResponseService {

    private static final String ENCRYPTED_PREFIX = "ENC:";

    private final ParentConsentResponseRepository responseRepository;
    private final ConsentFormRepository consentFormRepository;
    private final UserRepository userRepository;
    private final AesEncryptionService aesEncryptionService;

    public ParentConsentResponseService(
            ParentConsentResponseRepository responseRepository,
            ConsentFormRepository consentFormRepository,
            UserRepository userRepository,
            AesEncryptionService aesEncryptionService
    ) {
        this.responseRepository = responseRepository;
        this.consentFormRepository = consentFormRepository;
        this.userRepository = userRepository;
        this.aesEncryptionService = aesEncryptionService;
    }

    @Transactional
    public ParentConsentResponse submitResponse(
            Long formId,
            SubmitConsentRequest request,
            String parentEmail
    ) {
        String email = parentEmail.trim().toLowerCase(Locale.ROOT);

        User parent = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Parent account not found.")
                );

        if (!"parent".equalsIgnoreCase(parent.getRole())) {
            throw new IllegalArgumentException(
                    "Only parent accounts can submit consent."
            );
        }

        ConsentForm form = consentFormRepository.findById(formId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Consent form not found.")
                );

        if (!"Published".equalsIgnoreCase(form.getStatus())) {
            throw new IllegalArgumentException(
                    "This consent form is not available."
            );
        }

        if (responseRepository
                .findByParentIdAndConsentFormId(parent.getId(), formId)
                .isPresent()) {
            throw new IllegalArgumentException(
                    "You have already submitted a response for this form."
            );
        }

        ParentConsentResponse response = new ParentConsentResponse();

        response.setParent(parent);
        response.setConsentForm(form);
        response.setDecision(request.getDecision());

        // Encrypt sensitive information before saving.
        response.setPrintedName(
                encryptValue(request.getPrintedName().trim())
        );

        response.setSignature(
                encryptValue(request.getSignature())
        );

        response.setSubmittedAt(LocalDateTime.now());

        return responseRepository.save(response);
    }

    @Transactional(readOnly = true)
    public List<ParentConsentResponseDto> getMyResponses(
            String parentEmail
    ) {
        String email = parentEmail.trim().toLowerCase(Locale.ROOT);

        User parent = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Parent account not found.")
                );

        if (!"parent".equalsIgnoreCase(parent.getRole())) {
            throw new IllegalArgumentException(
                    "Only parent accounts can view their responses."
            );
        }

        return responseRepository.findByParentId(parent.getId())
                .stream()
                .map(response -> {
                    ParentConsentResponseDto dto =
                            ParentConsentResponseDto.from(response);

                    // Decrypt printed name.
                    dto.setPrintedName(
                            decryptValue(response.getPrintedName())
                    );

                    // Decrypt signature.
                    dto.setSignature(
                            decryptValue(response.getSignature())
                    );

                    return dto;
                })
                .toList();
    }

    private String encryptValue(String value) {
        if (value == null) {
            return null;
        }

        return ENCRYPTED_PREFIX + aesEncryptionService.encrypt(value);
    }

    private String decryptValue(String value) {
        if (value == null) {
            return null;
        }

        // Keep older, unencrypted records readable.
        if (!value.startsWith(ENCRYPTED_PREFIX)) {
            return value;
        }

        String encryptedValue =
                value.substring(ENCRYPTED_PREFIX.length());

        return aesEncryptionService.decrypt(encryptedValue);
    }
}

package com.yearners.ua_parent_consent_backend.service;

import com.yearners.ua_parent_consent_backend.dto.TeacherConsentResponseDto;
import com.yearners.ua_parent_consent_backend.model.User;
import com.yearners.ua_parent_consent_backend.repository.ParentConsentResponseRepository;
import com.yearners.ua_parent_consent_backend.repository.UserRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
public class TeacherConsentResponseService {

    private static final String ENCRYPTED_PREFIX = "ENC:";

    private final ParentConsentResponseRepository responseRepository;
    private final UserRepository userRepository;
    private final AesEncryptionService aesEncryptionService;

    public TeacherConsentResponseService(
            ParentConsentResponseRepository responseRepository,
            UserRepository userRepository,
            AesEncryptionService aesEncryptionService
    ) {
        this.responseRepository = responseRepository;
        this.userRepository = userRepository;
        this.aesEncryptionService = aesEncryptionService;
    }

    @Transactional(readOnly = true)
    public List<TeacherConsentResponseDto> getMyResponses(
            String teacherEmail
    ) {

        String email = teacherEmail.trim().toLowerCase(Locale.ROOT);

        User teacher = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new IllegalArgumentException("Teacher account not found.")
                );

        if (!"teacher".equalsIgnoreCase(teacher.getRole())) {
            throw new IllegalArgumentException(
                    "Only teacher accounts can view these responses."
            );
        }

        return responseRepository
                .findByConsentForm_Teacher_Id(teacher.getId())
                .stream()
                .map(response -> {
                    TeacherConsentResponseDto dto =
                            TeacherConsentResponseDto.from(response);

                    // Decrypt sensitive fields for authorized teacher viewing.
                    dto.setPrintedName(
                            decryptValue(response.getPrintedName())
                    );

                    dto.setSignature(
                            decryptValue(response.getSignature())
                    );

                    return dto;
                })
                .toList();
    }

    private String decryptValue(String value) {
        if (value == null) {
            return null;
        }

        // Preserve compatibility with older plaintext records.
        if (!value.startsWith(ENCRYPTED_PREFIX)) {
            return value;
        }

        String encryptedValue =
                value.substring(ENCRYPTED_PREFIX.length());

        return aesEncryptionService.decrypt(encryptedValue);
    }
}

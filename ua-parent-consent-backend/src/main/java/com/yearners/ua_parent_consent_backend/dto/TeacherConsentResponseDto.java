package com.yearners.ua_parent_consent_backend.dto;

import com.yearners.ua_parent_consent_backend.model.ParentConsentResponse;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class TeacherConsentResponseDto {

    private Long id;
    private Long formId;
    private String formTitle;
    private String className;

    private Long parentId;
    private String parentName;

    private String decision;
    private String printedName;
    private String signature;
    private LocalDateTime submittedAt;

    public static TeacherConsentResponseDto from(
            ParentConsentResponse response
    ) {
        TeacherConsentResponseDto dto = new TeacherConsentResponseDto();

        dto.setId(response.getId());

        dto.setFormId(response.getConsentForm().getId());
        dto.setFormTitle(response.getConsentForm().getTitle());
        dto.setClassName(response.getConsentForm().getClassName());

        dto.setParentId(response.getParent().getId());
        dto.setParentName(response.getParent().getFullName());

        dto.setDecision(response.getDecision());
        dto.setPrintedName(response.getPrintedName());
        dto.setSignature(response.getSignature());
        dto.setSubmittedAt(response.getSubmittedAt());

        return dto;
    }
}

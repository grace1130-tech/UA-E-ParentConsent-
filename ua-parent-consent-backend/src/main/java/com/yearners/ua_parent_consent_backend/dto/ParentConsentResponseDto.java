
package com.yearners.ua_parent_consent_backend.dto;

import com.yearners.ua_parent_consent_backend.model.ParentConsentResponse;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ParentConsentResponseDto {

    private Long id;
    private Long formId;
    private String formTitle;
    private String decision;
    private String printedName;
    private String signature;
    private LocalDateTime submittedAt;

    public static ParentConsentResponseDto from(
            ParentConsentResponse response
    ) {
        ParentConsentResponseDto dto = new ParentConsentResponseDto();

        dto.setId(response.getId());
        dto.setFormId(response.getConsentForm().getId());
        dto.setFormTitle(response.getConsentForm().getTitle());
        dto.setDecision(response.getDecision());
        dto.setPrintedName(response.getPrintedName());
        dto.setSignature(response.getSignature());
        dto.setSubmittedAt(response.getSubmittedAt());

        return dto;
    }
}

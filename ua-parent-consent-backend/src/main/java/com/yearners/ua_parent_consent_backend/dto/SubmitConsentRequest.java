
package com.yearners.ua_parent_consent_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SubmitConsentRequest {

    @NotBlank(message = "Please select Agree or Disagree.")
    @Pattern(
            regexp = "Agree|Disagree",
            message = "Decision must be Agree or Disagree."
    )
    private String decision;

    @NotBlank(message = "Printed name is required.")
    @Size(
            min = 2,
            max = 120,
            message = "Printed name must be between 2 and 120 characters."
    )
    @Pattern(
            regexp = "^[\\p{L}\\p{M} .'-]+$",
            message = "Printed name contains invalid characters."
    )
    private String printedName;

    @NotBlank(message = "Signature is required.")
    @Size(
            max = 1000000,
            message = "Signature is too large."
    )
    private String signature;
}

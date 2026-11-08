package com.yearners.ua_parent_consent_backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.FutureOrPresent;
import lombok.Data;

import java.time.LocalDate;

@Data
public class CreateConsentFormRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @NotBlank
    private String className;

    @NotNull
    @FutureOrPresent
    private LocalDate activityDate;

    @NotBlank
    private String location;

    @NotNull
    @FutureOrPresent
    private LocalDate deadline;

    private String instructions;
}

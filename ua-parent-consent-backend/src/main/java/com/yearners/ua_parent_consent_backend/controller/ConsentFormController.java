package com.yearners.ua_parent_consent_backend.controller;

import com.yearners.ua_parent_consent_backend.dto.CreateConsentFormRequest;
import com.yearners.ua_parent_consent_backend.dto.ConsentFormResponse;
import com.yearners.ua_parent_consent_backend.service.ConsentFormService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/consent-forms")
public class ConsentFormController {

    private final ConsentFormService consentFormService;

    public ConsentFormController(
            ConsentFormService consentFormService) {
        this.consentFormService = consentFormService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ConsentFormResponse createForm(
            @Valid @RequestBody CreateConsentFormRequest request,
            @RequestParam(defaultValue = "Published") String status,
            Authentication authentication) {

        return consentFormService.createForm(
                request,
                authentication.getName(),
                status
        );
    }

    @GetMapping
    public List<ConsentFormResponse> getMyForms(
            Authentication authentication) {

        return consentFormService.getMyForms(
                authentication.getName()
        );
    }
}

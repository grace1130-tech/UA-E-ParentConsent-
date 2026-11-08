package com.yearners.ua_parent_consent_backend.controller;

import com.yearners.ua_parent_consent_backend.dto.ConsentFormResponse;
import com.yearners.ua_parent_consent_backend.repository.ConsentFormRepository;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/parent/consent-forms")
public class ParentConsentFormController {

    private final ConsentFormRepository consentFormRepository;

    public ParentConsentFormController(
            ConsentFormRepository consentFormRepository) {
        this.consentFormRepository = consentFormRepository;
    }

    @GetMapping
    public List<ConsentFormResponse> getPublishedForms() {

        return consentFormRepository.findByStatus("Published")
                .stream()
                .map(ConsentFormResponse::from)
                .toList();
    }
}

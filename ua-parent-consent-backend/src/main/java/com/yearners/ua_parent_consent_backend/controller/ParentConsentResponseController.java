package com.yearners.ua_parent_consent_backend.controller;

import com.yearners.ua_parent_consent_backend.dto.SubmitConsentRequest;
import com.yearners.ua_parent_consent_backend.dto.ParentConsentResponseDto;
import com.yearners.ua_parent_consent_backend.model.ParentConsentResponse;
import com.yearners.ua_parent_consent_backend.service.ParentConsentResponseService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/parent/consent-responses")
public class ParentConsentResponseController {

    private final ParentConsentResponseService responseService;

    public ParentConsentResponseController(
            ParentConsentResponseService responseService
    ) {
        this.responseService = responseService;
    }

    // Submit a consent response
    @PostMapping("/{formId}")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> submitResponse(
            @PathVariable Long formId,
            @Valid @RequestBody SubmitConsentRequest request,
            Authentication authentication
    ) {

        try {
            ParentConsentResponse response =
                    responseService.submitResponse(
                            formId,
                            request,
                            authentication.getName()
                    );

            return Map.of(
                    "message", "Consent response submitted successfully!",
                    "id", response.getId(),
                    "decision", response.getDecision()
            );

        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    e.getMessage()
            );
        }
    }

    // Get the logged-in parent's response history
    @GetMapping
    public List<ParentConsentResponseDto> getMyResponses(
            Authentication authentication
    ) {

        try {
            return responseService.getMyResponses(
                    authentication.getName()
            );

        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    e.getMessage()
            );
        }
    }
}

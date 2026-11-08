package com.yearners.ua_parent_consent_backend.controller;

import com.yearners.ua_parent_consent_backend.dto.TeacherConsentResponseDto;
import com.yearners.ua_parent_consent_backend.service.TeacherConsentResponseService;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/consent-responses")
public class TeacherConsentResponseController {

    private final TeacherConsentResponseService responseService;

    public TeacherConsentResponseController(
            TeacherConsentResponseService responseService
    ) {
        this.responseService = responseService;
    }

    @GetMapping
    public List<TeacherConsentResponseDto> getMyResponses(
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

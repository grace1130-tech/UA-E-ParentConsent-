package com.yearners.ua_parent_consent_backend.controller;

import com.yearners.ua_parent_consent_backend.dto.LoginRequest;
import com.yearners.ua_parent_consent_backend.dto.RegisterRequest;
import com.yearners.ua_parent_consent_backend.model.User;
import com.yearners.ua_parent_consent_backend.service.AuthService;
import com.yearners.ua_parent_consent_backend.service.JwtService;
import com.yearners.ua_parent_consent_backend.service.IpRateLimitService;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtService jwtService;
    private final IpRateLimitService ipRateLimitService;

    public AuthController(
            AuthService authService,
            JwtService jwtService,
            IpRateLimitService ipRateLimitService) {

        this.authService = authService;
        this.jwtService = jwtService;
        this.ipRateLimitService = ipRateLimitService;
    }

    // REGISTER PARENT
    @PostMapping("/register")
    public ResponseEntity<?> register(
            @Valid @RequestBody RegisterRequest request) {

        try {
            User user = authService.register(request);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "message", "Registration successful!",
                            "id", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail(),
                            "role", user.getRole()
                    ));

        } catch (IllegalArgumentException e) {

            return ResponseEntity.badRequest()
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // LOGIN USER AND GENERATE JWT
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpRequest) {

        // Get the client's IP address
        String ipAddress = httpRequest.getRemoteAddr();

        // Check IP request limit
        if (!ipRateLimitService.isAllowed(ipAddress)) {

            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of(
                            "message",
                            "Too many login requests. Please try again after 15 minutes."
                    ));
        }

        try {
            User user = authService.login(
                    request.getEmail(),
                    request.getPassword()
            );

            // Generate JWT token
            String token = jwtService.generateToken(
                    user.getEmail(),
                    user.getRole()
            );

            return ResponseEntity.ok(
                    Map.of(
                            "message", "Login successful!",
                            "token", token,
                            "id", user.getId(),
                            "fullName", user.getFullName(),
                            "email", user.getEmail(),
                            "role", user.getRole()
                    )
            );

        } catch (IllegalArgumentException e) {

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }
}
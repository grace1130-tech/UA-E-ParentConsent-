package com.yearners.ua_parent_consent_backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class TestController {

    @GetMapping("/test/protected")
    public Map<String, String> protectedEndpoint() {
        return Map.of(
                "message",
                "JWT authentication successful!"
        );
    }

    @GetMapping("/parent/test")
    public Map<String, String> parentEndpoint() {
        return Map.of(
                "message",
                "Welcome, Parent! You have Parent access."
        );
    }

    @GetMapping("/teacher/test")
    public Map<String, String> teacherEndpoint() {
        return Map.of(
                "message",
                "Welcome, Teacher! You have Teacher access."
        );
    }

    @GetMapping("/admin/test")
    public Map<String, String> adminEndpoint() {
        return Map.of(
                "message",
                "Welcome, Admin! You have Admin access."
        );
    }
}

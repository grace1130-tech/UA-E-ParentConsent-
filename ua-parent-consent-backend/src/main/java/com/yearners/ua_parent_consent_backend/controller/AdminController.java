
package com.yearners.ua_parent_consent_backend.controller;

import com.yearners.ua_parent_consent_backend.dto.CreateUserRequest;
import com.yearners.ua_parent_consent_backend.dto.UserResponse;
import com.yearners.ua_parent_consent_backend.dto.AdminConsentMonitoringDto;

import com.yearners.ua_parent_consent_backend.model.User;
import com.yearners.ua_parent_consent_backend.service.AdminService;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // Create Teacher or Admin account
    @PostMapping("/users")
    public ResponseEntity<?> createUser(
            @Valid @RequestBody CreateUserRequest request) {

        try {
            User user = adminService.createUser(request);

            return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
                    "message", "User account created successfully!",
                    "id", user.getId(),
                    "fullName", user.getFullName(),
                    "email", user.getEmail(),
                    "role", user.getRole(),
                    "status", user.getStatus()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // View all users
    @GetMapping("/users")
    public ResponseEntity<List<UserResponse>> getAllUsers() {

        return ResponseEntity.ok(adminService.getAllUsers());
    }

    // Search users by name or email
    @GetMapping("/users/search")
    public ResponseEntity<List<UserResponse>> searchUsers(
            @RequestParam String keyword) {

        return ResponseEntity.ok(
                adminService.searchUsers(keyword)
        );
    }

    // Activate or deactivate user account
    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {

        try {
            String status = request.get("status");

            if (status == null) {
                throw new IllegalArgumentException(
                        "Status is required."
                );
            }

            UserResponse updatedUser =
                    adminService.updateUserStatus(id, status);

            return ResponseEntity.ok(Map.of(
                    "message", "User status updated successfully!",
                    "user", updatedUser
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", e.getMessage())
            );
        }
    }

    // View consent monitoring statistics
    @GetMapping("/consent-statistics")
    public ResponseEntity<Map<String, Long>> getConsentStatistics() {

        return ResponseEntity.ok(
                adminService.getConsentStatistics()
        );
    }

    // View individual consent form monitoring records
    @GetMapping("/consent-monitoring")
    public ResponseEntity<List<AdminConsentMonitoringDto>>
    getConsentMonitoring() {

        return ResponseEntity.ok(
                adminService.getConsentMonitoring()
        );
    }
}

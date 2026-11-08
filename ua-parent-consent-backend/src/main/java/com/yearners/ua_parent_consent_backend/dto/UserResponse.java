package com.yearners.ua_parent_consent_backend.dto;

import com.yearners.ua_parent_consent_backend.model.User;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {

    private Long id;
    private String fullName;
    private String email;
    private String role;
    private String status;
    private LocalDateTime createdAt;

    public static UserResponse from(User user) {

        UserResponse response = new UserResponse();

        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setStatus(user.getStatus());
        response.setCreatedAt(user.getCreatedAt());

        return response;
    }
}
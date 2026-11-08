
package com.yearners.ua_parent_consent_backend.service;

import com.yearners.ua_parent_consent_backend.dto.CreateUserRequest;
import com.yearners.ua_parent_consent_backend.dto.UserResponse;
import com.yearners.ua_parent_consent_backend.dto.AdminConsentMonitoringDto;

import com.yearners.ua_parent_consent_backend.model.User;
import com.yearners.ua_parent_consent_backend.model.ConsentForm;

import com.yearners.ua_parent_consent_backend.repository.UserRepository;
import com.yearners.ua_parent_consent_backend.repository.ConsentFormRepository;
import com.yearners.ua_parent_consent_backend.repository.ParentConsentResponseRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final ConsentFormRepository consentFormRepository;
    private final ParentConsentResponseRepository responseRepository;

    public AdminService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            ConsentFormRepository consentFormRepository,
            ParentConsentResponseRepository responseRepository
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.consentFormRepository = consentFormRepository;
        this.responseRepository = responseRepository;
    }

    // Create Teacher or Admin account
    public User createUser(CreateUserRequest request) {

        String email = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException(
                    "Email is already registered."
            );
        }

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(email);
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );
        user.setRole(request.getRole().toLowerCase(Locale.ROOT));
        user.setStatus("Active");

        return userRepository.save(user);
    }

    // View all users
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(UserResponse::from)
                .toList();
    }

    // Search users by name or email
    public List<UserResponse> searchUsers(String keyword) {

        String search = keyword.trim().toLowerCase(Locale.ROOT);

        return userRepository.findAll()
                .stream()
                .filter(user ->
                        user.getFullName().toLowerCase(Locale.ROOT)
                                .contains(search)
                                ||
                                user.getEmail().toLowerCase(Locale.ROOT)
                                        .contains(search)
                )
                .map(UserResponse::from)
                .toList();
    }

    // Activate or deactivate an account
    public UserResponse updateUserStatus(Long id, String status) {

        User user = userRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found.")
                );

        String normalizedStatus = status.trim();

        if (!normalizedStatus.equalsIgnoreCase("Active")
                && !normalizedStatus.equalsIgnoreCase("Inactive")) {
            throw new IllegalArgumentException(
                    "Status must be Active or Inactive."
            );
        }

        user.setStatus(normalizedStatus.equalsIgnoreCase("Active")
                ? "Active" : "Inactive");

        User updatedUser = userRepository.save(user);

        return UserResponse.from(updatedUser);
    }

    // Get consent monitoring statistics
    @Transactional(readOnly = true)
    public Map<String, Long> getConsentStatistics() {

        long totalForms = consentFormRepository.count();
        long totalResponses = responseRepository.count();

        long agreed = responseRepository.findAll()
                .stream()
                .filter(response ->
                        "Agree".equalsIgnoreCase(response.getDecision())
                )
                .count();

        long disagreed = responseRepository.findAll()
                .stream()
                .filter(response ->
                        "Disagree".equalsIgnoreCase(response.getDecision())
                )
                .count();

        return Map.of(
                "totalForms", totalForms,
                "totalResponses", totalResponses,
                "agreed", agreed,
                "disagreed", disagreed
        );
    }

    // Get individual consent form monitoring records
    @Transactional(readOnly = true)
    public List<AdminConsentMonitoringDto> getConsentMonitoring() {

        List<ConsentForm> forms = consentFormRepository.findAll();

        long totalParents = userRepository.findAll()
                .stream()
                .filter(user ->
                        "parent".equalsIgnoreCase(user.getRole())
                )
                .count();

        return forms.stream().map(form -> {

            Long totalResponses =
                    consentFormRepository.countResponsesByFormId(form.getId());

            Long agreed =
                    consentFormRepository.countAgreedByFormId(form.getId());

            Long disagreed =
                    consentFormRepository.countDisagreedByFormId(form.getId());

            AdminConsentMonitoringDto dto =
                    new AdminConsentMonitoringDto();

            dto.setFormId(form.getId());
            dto.setTitle(form.getTitle());
            dto.setClassName(form.getClassName());
            dto.setActivityDate(form.getActivityDate());
            dto.setDeadline(form.getDeadline());
            dto.setLocation(form.getLocation());
            dto.setStatus(form.getStatus());
            dto.setTeacherName(form.getTeacher().getFullName());

            dto.setTotalResponses(totalResponses);
            dto.setAgreed(agreed);
            dto.setDisagreed(disagreed);

            // Assumes every registered parent is expected to respond
            dto.setPending(
                    Math.max(0L, totalParents - totalResponses)
            );

            return dto;

        }).toList();
    }
}

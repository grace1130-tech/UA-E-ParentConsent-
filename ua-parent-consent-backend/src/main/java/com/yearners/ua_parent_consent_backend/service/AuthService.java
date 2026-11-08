
package com.yearners.ua_parent_consent_backend.service;

import com.yearners.ua_parent_consent_backend.dto.RegisterRequest;
import com.yearners.ua_parent_consent_backend.model.User;
import com.yearners.ua_parent_consent_backend.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final LoginAttemptService loginAttemptService;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            LoginAttemptService loginAttemptService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.loginAttemptService = loginAttemptService;
    }

    // REGISTER PARENT ACCOUNT
    public User register(RegisterRequest request) {

        String normalizedEmail = request.getEmail()
                .trim()
                .toLowerCase(Locale.ROOT);

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "Email is already registered."
            );
        }

        User user = new User();

        user.setFullName(request.getFullName().trim());
        user.setEmail(normalizedEmail);

        // Hash password using BCrypt
        user.setPassword(
                passwordEncoder.encode(request.getPassword())
        );

        user.setRole("parent");
        user.setStatus("Active");

        return userRepository.save(user);
    }

    // LOGIN USER ACCOUNT
    public User login(String email, String password) {

        String normalizedEmail = email.trim()
                .toLowerCase(Locale.ROOT);

        // Check temporary login lockout
        if (loginAttemptService.isLocked(normalizedEmail)) {
            throw new IllegalArgumentException(
                    "Too many failed login attempts. Please try again after 15 minutes."
            );
        }

        User user = userRepository.findByEmail(normalizedEmail)
                .orElse(null);

        // Handle nonexistent account
        if (user == null) {

            loginAttemptService.recordFailedAttempt(normalizedEmail);

            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        // Verify password using BCrypt
        if (!passwordEncoder.matches(
                password,
                user.getPassword())) {

            loginAttemptService.recordFailedAttempt(normalizedEmail);

            throw new IllegalArgumentException(
                    "Invalid email or password."
            );
        }

        // Check account status
        if (!"Active".equalsIgnoreCase(user.getStatus())) {

            throw new IllegalArgumentException(
                    "Your account is inactive."
            );
        }

        // Reset failed attempts after successful login
        loginAttemptService.resetAttempts(normalizedEmail);

        return user;
    }
}

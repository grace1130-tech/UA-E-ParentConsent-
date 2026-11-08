package com.yearners.ua_parent_consent_backend.config;

import com.yearners.ua_parent_consent_backend.model.User;
import com.yearners.ua_parent_consent_backend.repository.UserRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AdminSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.bootstrap-admin.name:}")
    private String adminName;

    @Value("${app.bootstrap-admin.email:}")
    private String adminEmail;

    @Value("${app.bootstrap-admin.password:}")
    private String adminPassword;

    public AdminSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (adminName.isBlank()
                || adminEmail.isBlank()
                || adminPassword.isBlank()) {

            System.out.println(
                    "Initial Admin setup skipped: configuration missing."
            );
            return;
        }

        if (adminPassword.length() < 12) {
            throw new IllegalStateException(
                    "Initial Admin password must be at least 12 characters."
            );
        }

        String normalizedEmail = adminEmail.trim().toLowerCase();

        if (userRepository.existsByEmail(normalizedEmail)) {
            System.out.println("Initial Admin account already exists.");
            return;
        }

        User admin = new User();

        admin.setFullName(adminName.trim());
        admin.setEmail(normalizedEmail);
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setRole("admin");
        admin.setStatus("Active");

        userRepository.save(admin);

        System.out.println("Initial Admin account created successfully.");
    }
}

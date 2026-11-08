package com.yearners.ua_parent_consent_backend.service;

import com.yearners.ua_parent_consent_backend.model.LoginAttempt;
import com.yearners.ua_parent_consent_backend.repository.LoginAttemptRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class LoginAttemptService {

    private static final int MAX_ATTEMPTS = 5;
    private static final int LOCKOUT_MINUTES = 15;
    private static final int ATTEMPT_WINDOW_MINUTES = 15;

    private final LoginAttemptRepository loginAttemptRepository;

    public LoginAttemptService(
            LoginAttemptRepository loginAttemptRepository) {

        this.loginAttemptRepository = loginAttemptRepository;
    }

    // Check whether the account is temporarily locked
    @Transactional
    public boolean isLocked(String email) {

        String normalizedEmail = normalizeEmail(email);

        LoginAttempt attempt = loginAttemptRepository
                .findByEmail(normalizedEmail)
                .orElse(null);

        if (attempt == null || attempt.getLockedUntil() == null) {
            return false;
        }

        LocalDateTime now = LocalDateTime.now();

        if (attempt.getLockedUntil().isAfter(now)) {
            return true;
        }

        // Reset expired lockout
        attempt.setFailedAttempts(0);
        attempt.setLastFailedAttempt(null);
        attempt.setLockedUntil(null);

        loginAttemptRepository.save(attempt);

        return false;
    }

    // Record a failed login attempt
    @Transactional
    public void recordFailedAttempt(String email) {

        String normalizedEmail = normalizeEmail(email);
        LocalDateTime now = LocalDateTime.now();

        LoginAttempt attempt = loginAttemptRepository
                .findByEmail(normalizedEmail)
                .orElseGet(() -> {
                    LoginAttempt newAttempt = new LoginAttempt();
                    newAttempt.setEmail(normalizedEmail);
                    return newAttempt;
                });

        // Reset attempts if the tracking window has expired
        if (attempt.getLastFailedAttempt() == null ||
                attempt.getLastFailedAttempt().isBefore(
                        now.minusMinutes(ATTEMPT_WINDOW_MINUTES))) {

            attempt.setFailedAttempts(0);
        }

        attempt.setFailedAttempts(attempt.getFailedAttempts() + 1);
        attempt.setLastFailedAttempt(now);

        // Lock account after reaching the maximum attempts
        if (attempt.getFailedAttempts() >= MAX_ATTEMPTS) {
            attempt.setLockedUntil(
                    now.plusMinutes(LOCKOUT_MINUTES)
            );
        }

        loginAttemptRepository.save(attempt);
    }

    // Reset attempts after successful login
    @Transactional
    public void resetAttempts(String email) {

        loginAttemptRepository.deleteByEmail(normalizeEmail(email));
    }

    private String normalizeEmail(String email) {

        return email.trim().toLowerCase(Locale.ROOT);
    }
}
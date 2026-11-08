package com.yearners.ua_parent_consent_backend.repository;

import com.yearners.ua_parent_consent_backend.model.LoginAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LoginAttemptRepository
        extends JpaRepository<LoginAttempt, Long> {

    Optional<LoginAttempt> findByEmail(String email);

    void deleteByEmail(String email);
}
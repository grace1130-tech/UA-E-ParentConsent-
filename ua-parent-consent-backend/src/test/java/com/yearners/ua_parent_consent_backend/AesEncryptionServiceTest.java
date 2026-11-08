package com.yearners.ua_parent_consent_backend;

import com.yearners.ua_parent_consent_backend.service.AesEncryptionService;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class AesEncryptionServiceTest {

    @Test
    void shouldEncryptAndDecryptSuccessfully() {

        String testSecret = "d3R3/sLdyJGsR8yZ1ozXwTXmZUjcMO3aX9zDnUFYDQI=";

        AesEncryptionService aesService =
                new AesEncryptionService(testSecret);

        String originalText = "Parent consent information";

        String encryptedText = aesService.encrypt(originalText);

        String decryptedText = aesService.decrypt(encryptedText);

        assertNotEquals(originalText, encryptedText);
        assertEquals(originalText, decryptedText);

        System.out.println("Original: " + originalText);
        System.out.println("Encrypted: " + encryptedText);
        System.out.println("Decrypted: " + decryptedText);
    }
}


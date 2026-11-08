package com.yearners.ua_parent_consent_backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;

@Service
public class AesEncryptionService {

    private static final String ALGORITHM = "AES";
    private static final String TRANSFORMATION = "AES/GCM/NoPadding";

    private static final int IV_LENGTH = 12;
    private static final int TAG_LENGTH = 128;
    private static final int KEY_LENGTH = 32;

    private final SecretKeySpec secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    public AesEncryptionService(
            @Value("${APP_AES_SECRET}") String encodedSecret
    ) {
        byte[] keyBytes = Base64.getDecoder().decode(encodedSecret);

        if (keyBytes.length != KEY_LENGTH) {
            throw new IllegalArgumentException(
                    "AES secret must contain exactly 32 bytes."
            );
        }

        this.secretKey = new SecretKeySpec(keyBytes, ALGORITHM);
    }

    public String encrypt(String plainText) {
        if (plainText == null) {
            return null;
        }

        try {
            byte[] iv = new byte[IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            GCMParameterSpec parameterSpec =
                    new GCMParameterSpec(TAG_LENGTH, iv);

            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] encryptedData = cipher.doFinal(
                    plainText.getBytes(StandardCharsets.UTF_8)
            );

            ByteBuffer buffer = ByteBuffer.allocate(
                    iv.length + encryptedData.length
            );

            buffer.put(iv);
            buffer.put(encryptedData);

            return Base64.getEncoder().encodeToString(buffer.array());

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Unable to encrypt data.", e
            );
        }
    }

    public String decrypt(String encryptedText) {
        if (encryptedText == null) {
            return null;
        }

        try {
            byte[] decodedData =
                    Base64.getDecoder().decode(encryptedText);

            if (decodedData.length <= IV_LENGTH) {
                throw new IllegalArgumentException(
                        "Invalid encrypted data."
                );
            }

            ByteBuffer buffer = ByteBuffer.wrap(decodedData);

            byte[] iv = new byte[IV_LENGTH];
            buffer.get(iv);

            byte[] encryptedData = new byte[buffer.remaining()];
            buffer.get(encryptedData);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);

            GCMParameterSpec parameterSpec =
                    new GCMParameterSpec(TAG_LENGTH, iv);

            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            byte[] decryptedData = cipher.doFinal(encryptedData);

            return new String(
                    decryptedData,
                    StandardCharsets.UTF_8
            );

        } catch (Exception e) {
            throw new IllegalStateException(
                    "Unable to decrypt data. Check the key and encrypted value.",
                    e
            );
        }
    }
}

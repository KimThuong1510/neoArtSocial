package com.example.demo.service.impl;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

@Component
public class ChatCryptoService {
    private static final String AES_GCM = "AES/GCM/NoPadding";
    private static final int IV_LEN_BYTES = 12;
    private static final int TAG_LEN_BITS = 128;

    private final SecretKey key;
    private final SecureRandom secureRandom = new SecureRandom();

    public record Enc(String cipherTextB64, String ivB64) {}

    public ChatCryptoService(@Value("${chat.crypto.secret:change-me}") String secret) {
        this.key = new SecretKeySpec(sha256(secret), "AES");
    }

    public Enc encryptToBase64(String plaintext) {
        if (plaintext == null) plaintext = "";
        try {
            byte[] iv = new byte[IV_LEN_BYTES];
            secureRandom.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(AES_GCM);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_LEN_BITS, iv));
            byte[] cipherBytes = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            return new Enc(Base64.getEncoder().encodeToString(cipherBytes), Base64.getEncoder().encodeToString(iv));
        } catch (Exception e) {
            throw new IllegalStateException("Encrypt failed", e);
        }
    }

    public String decryptFromBase64(String cipherTextB64, String ivB64) {
        try {
            byte[] cipherBytes = Base64.getDecoder().decode(cipherTextB64);
            byte[] iv = Base64.getDecoder().decode(ivB64);
            Cipher cipher = Cipher.getInstance(AES_GCM);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_LEN_BITS, iv));
            byte[] plainBytes = cipher.doFinal(cipherBytes);
            return new String(plainBytes, StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new IllegalStateException("Decrypt failed", e);
        }
    }

    private static byte[] sha256(String s) {
        try {
            MessageDigest d = MessageDigest.getInstance("SHA-256");
            return d.digest((s == null ? "" : s).getBytes(StandardCharsets.UTF_8));
        } catch (Exception e) {
            throw new IllegalStateException(e);
        }
    }
}


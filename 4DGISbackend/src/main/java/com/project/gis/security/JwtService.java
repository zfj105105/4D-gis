package com.project.gis.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {
    private final SecretKey key;
    private final long expirationMs;

    public JwtService(@Value("${app.jwt-secret:}") String secret,
                      @Value("${app.jwt-expiration-ms:3600000}") long expirationMs) {
        // use provided secret bytes (must be long enough). If missing or too short, generate a random key for demo.
        SecretKey k;
        try {
            if (secret == null || secret.trim().isEmpty() || secret.length() < 32) {
                k = Keys.secretKeyFor(SignatureAlgorithm.HS256);
            } else {
                k = Keys.hmacShaKeyFor(secret.getBytes());
            }
        } catch (Exception ex) {
            k = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        }
        this.key = k;
        this.expirationMs = expirationMs;
    }

    public String generateToken(String userId) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .setSubject(userId)
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder().setSigningKey(key).build().parseClaimsJws(token).getBody();
    }

    public boolean validate(String token) {
        try {
            parseToken(token);
            return true;
        } catch (Exception ex) {
            return false;
        }
    }

    public long getExpirationSeconds() {
        return expirationMs / 1000L;
    }
}

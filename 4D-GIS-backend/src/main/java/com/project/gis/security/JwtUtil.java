package com.project.gis.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
public class JwtUtil
{
    private final JwtProperties properties;
    private Key key;

    public JwtUtil(JwtProperties properties)
    {
        this.properties = properties;
    }

    @PostConstruct
    public void init()
    {
        this.key = Keys.hmacShaKeyFor(properties.getSecret().getBytes());
    }

    public String generateToken(Long userId)
    {
        Date now = new Date();
        Date expire = new Date(now.getTime() + properties.getExpiration());

        return Jwts.builder()
                   .setSubject(String.valueOf(userId))
                   .setIssuedAt(now)
                   .setExpiration(expire)
                   .signWith(key, SignatureAlgorithm.HS256)
                   .compact();
    }

    public Long getUserIdFromToken(String token)
    {
        Claims claims = Jwts.parserBuilder()
                            .setSigningKey(key)
                            .build()
                            .parseClaimsJws(token)
                            .getBody();

        return Long.valueOf(claims.getSubject());
    }

    public boolean validateToken(String token)
    {
        try
        {
            Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token);
            return true;
        }
        catch (Exception ignored)
        {
            return false;
        }
    }
}

package com.project.gis.dto;

import com.project.gis.entity.User;

/**
 * LoginResponse
 */
@lombok.Data
public class LoginResponse {
    /**
     * 过期时间
     */
    private Long expiresIn;
    /**
     * JWT Token
     */
    private String token;

    private User user;
}
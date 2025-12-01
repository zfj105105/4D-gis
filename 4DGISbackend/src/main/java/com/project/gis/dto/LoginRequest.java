package com.project.gis.dto;

/**
 * LoginRequest
 */
@lombok.Data
public class LoginRequest {
    /**
     * 手机号/用户名/邮箱
     */
    private String identity;

    private String password;
}
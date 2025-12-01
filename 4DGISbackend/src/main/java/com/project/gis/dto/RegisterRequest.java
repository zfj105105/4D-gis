package com.project.gis.dto;

/**
 * RegisterRequest
 */
@lombok.Data
public class RegisterRequest {
    /**
     * 邮箱
     */
    private String email;

    private String password;
    /**
     * 手机号
     */
    private String phone;
    /**
     * 用户名
     */
    private String username;
}
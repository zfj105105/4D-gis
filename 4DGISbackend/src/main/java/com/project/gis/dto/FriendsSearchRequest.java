package com.project.gis.dto;

/**
 * FriendsSearchRequest
 */
@lombok.Data
public class FriendsSearchRequest {
    /**
     * 搜索关键词（用户名、邮箱或手机号）
     */
    private String query;
}
package com.project.gis.dto;

/**
 * FriendRequest
 */
@lombok.Data
public class FriendRequest {
    /**
     * 附带消息（可选）
     */
    private String message;
    /**
     * 目标用户ID
     */
    private String targetUserId;
}
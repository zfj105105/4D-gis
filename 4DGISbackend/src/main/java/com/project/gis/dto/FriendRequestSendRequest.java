package com.project.gis.dto;

/**
 * FriendRequestSendRequest
 */
@lombok.Data
public class FriendRequestSendRequest {
    /**
     * 附带消息（可选）
     */
    private String message;
    /**
     * 目标用户ID
     */
    private String targetUserId;
}
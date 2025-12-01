package com.project.gis.dto;

/**
 * FriendRequestHandleRequest
 */
@lombok.Data
public class FriendRequestHandleRequest {
    /**
     * true为接受，false为拒绝
     */
    private boolean accept;
    /**
     * 好友请求ID
     */
    private String requestId;
}
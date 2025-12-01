package com.project.gis.dto;

import java.time.OffsetDateTime;

/**
 * FriendsRequestsGetResponse
 */
@lombok.Data
public class FriendsRequestsGetResponse {
    /**
     * 请求ID
     */
    private String id;
    /**
     * 附带消息
     */
    private String message;
    /**
     * 共同好友数量
     */
    private long mutualFriends;
    /**
     * 发送者姓名
     */
    private String name;
    /**
     * 请求发送时间
     */
    private OffsetDateTime requestDate;
    /**
     * 发送者用户ID
     */
    private String senderId;
}
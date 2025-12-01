package com.project.gis.dto;

import java.time.OffsetDateTime;

/**
 * FriendResponse
 */
@lombok.Data
public class FriendResponse {
    /**
     * 成为好友的时间
     */
    private OffsetDateTime createdAt;
    /**
     * 好友邮箱
     */
    private String email;
    /**
     * 好友ID
     */
    private String id;
    /**
     * 共同好友数量
     */
    private Long mutualFriends;
    /**
     * 好友姓名
     */
    private String name;
    /**
     * 好友手机号
     */
    private String phone;
}
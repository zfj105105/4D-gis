package com.project.gis.dto;

/**
 * FriendsSearchResponses
 */
@lombok.Data
public class FriendsSearchResponse {
    /**
     * 用户ID
     */
    private String id;
    /**
     * 是否已经是好友
     */
    private boolean isFriend;
    /**
     * 是否有待处理的好友请求
     */
    private boolean isPending;
    /**
     * 共同好友数量
     */
    private long mutualFriends;
    /**
     * 用户姓名
     */
    private String name;
}
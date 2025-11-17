package com.project.gis.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "friendships")
@IdClass(FriendshipId.class)
public class Friendship
{
    @Id
    @Column(name = "user_id")
    private Long userId;

    @Id
    @Column(name = "friend_id")
    private Long friendId;

    @Enumerated(EnumType.STRING)
    private Status status;

    public enum Status
    {
        pending, accepted, declined, blocked
    }

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}

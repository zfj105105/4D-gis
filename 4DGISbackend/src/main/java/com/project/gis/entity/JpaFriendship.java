package com.project.gis.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Entity
@Table(name = "friendships")
@Data
public class JpaFriendship {
    @EmbeddedId
    private FriendshipId id;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = OffsetDateTime.now();
    }

    @Data
    @Embeddable
    public static class FriendshipId {
        @Column(name = "user1_id")
        private Long user1Id;

        @Column(name = "user2_id")
        private Long user2Id;
    }
}

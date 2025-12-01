package com.project.gis.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.OffsetDateTime;

@Entity
@Table(name = "marker_collaborators")
@Data
public class JpaMarkerCollaborator {
    @EmbeddedId
    private MarkerCollaboratorId id;

    @Column(nullable = false)
    private String permission = "viewer";

    @Column(name = "granted_at", nullable = false)
    private OffsetDateTime grantedAt;

    @PrePersist
    public void prePersist() {
        this.grantedAt = OffsetDateTime.now();
    }

    @Data
    @Embeddable
    public static class MarkerCollaboratorId {
        @Column(name = "marker_id")
        private Long markerId;

        @Column(name = "user_id")
        private Long userId;
    }
}

package com.project.gis.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "marker_collaborators")
@IdClass(MarkerCollaboratorId.class)
public class MarkerCollaborator
{
    @Id
    @Column(name = "marker_id")
    private Long markerId;

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Enumerated(EnumType.STRING)
    private Permission permission;

    public enum Permission
    {
        viewer,
        editor
    }

    @Column(name = "granted_at")
    private LocalDateTime grantedAt;
}

package com.project.gis.model.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "marker_types")
public class MarkerType
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "type_name", nullable = false, unique = true)
    private String typeName;

    private String iconUrl;

    @Column(name = "default_color")
    private String defaultColor;

    @Column(name = "creator_id", nullable = false)
    private Long creatorId;

    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

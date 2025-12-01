package com.project.gis.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "marker_tags")
@Data
public class JpaMarkerTag {
    @EmbeddedId
    private MarkerTagId id;

    @Data
    @Embeddable
    public static class MarkerTagId {
        @Column(name = "marker_id")
        private Long markerId;

        @Column(name = "tag_id")
        private Long tagId;
    }
}

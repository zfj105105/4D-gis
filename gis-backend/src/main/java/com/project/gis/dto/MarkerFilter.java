package com.project.gis.dto;

import lombok.Data;

@Data
public class MarkerFilter {
    private String timeStart; // ISO_LOCAL_DATE_TIME
    private String timeEnd;
    private Double minHeight;
    private Double maxHeight;
    private Long type; // markerTypeId
    private String keyword;
}

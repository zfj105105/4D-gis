package com.project.gis.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateMarkerRequest
{
    private Double longitude;
    private Double latitude;

    private BigDecimal altitude;

    private String title;
    private String description;

    private String startTime;
    private String endTime;

    private Long markerTypeId;
}

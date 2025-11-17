package com.project.gis.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MarkerResponse
{
    private Long id;
    private String title;
    private String description;

    private Double longitude;
    private Double latitude;
    private BigDecimal altitude;

    private String startTime;
    private String endTime;

    private Long markerTypeId;
    private Long creatorId;
    private Long ownerId;

    private String visibility;
}

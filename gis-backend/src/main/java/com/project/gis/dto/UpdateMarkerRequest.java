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

    @com.fasterxml.jackson.annotation.JsonProperty("time_start")
    private String startTime;

    @com.fasterxml.jackson.annotation.JsonProperty("time_end")
    private String endTime;

    @com.fasterxml.jackson.annotation.JsonProperty("typeId")
    private Long markerTypeId;
}

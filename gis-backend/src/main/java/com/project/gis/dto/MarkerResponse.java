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

    @com.fasterxml.jackson.annotation.JsonProperty("time_start")
    private String startTime;

    @com.fasterxml.jackson.annotation.JsonProperty("time_end")
    private String endTime;

    @com.fasterxml.jackson.annotation.JsonProperty("typeId")
    private Long markerTypeId;

    private CreatedBy createdBy;
    private Long ownerId;

    private String visibility;

    @Data
    public static class CreatedBy {
        private Long userId;
        private String username;
    }
}

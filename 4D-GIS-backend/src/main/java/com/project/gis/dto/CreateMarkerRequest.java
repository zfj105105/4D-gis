package com.project.gis.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CreateMarkerRequest
{
    @NotNull(message = "经度不能为 null")
    private Double longitude;

    @NotNull(message = "纬度不能为 null")
    private Double latitude;

    private BigDecimal altitude;

    @NotBlank(message = "标题不能为空")
    private String title;

    private String description;

    @NotBlank(message = "开始时间不能为空")
    private String startTime;

    private String endTime;

    @NotNull(message = "markerTypeId 不能为空")
    private Long markerTypeId;
}

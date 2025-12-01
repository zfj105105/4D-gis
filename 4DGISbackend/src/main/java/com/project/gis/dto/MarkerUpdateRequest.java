package com.project.gis.dto;

import java.time.OffsetDateTime;

/**
 * MarkerUpdateRequest
 */
@lombok.Data
public class MarkerUpdateRequest {
    private Double altitude;
    /**
     * 描述
     */
    private String description;

    private Double latitude;

    private Double longitude;
    /**
     * 结束时间
     */
    private OffsetDateTime timeEnd;
    /**
     * 起始时间
     */
    private OffsetDateTime timeStart;
    /**
     * 标题
     */
    private String title;
    /**
     * 标记类型的 ID
     */
    private String typeId;
    /**
     * 标记的可见性
     */
    private Visibility visibility;
}
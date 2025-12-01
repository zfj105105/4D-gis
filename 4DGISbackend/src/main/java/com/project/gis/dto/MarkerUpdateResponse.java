package com.project.gis.dto;

import com.project.gis.entity.CreatedBy;
import com.project.gis.entity.MarkerType;

import java.time.OffsetDateTime;

/**
 * MarkerUpdateResponse
 */
@lombok.Data
public class MarkerUpdateResponse {
    /**
     * 高度
     */
    private Double altitude;
    /**
     * 创建时间
     */
    private OffsetDateTime createdAt;
    /**
     * 创建者
     */
    private CreatedBy createdBy;
    /**
     * 标记描述
     */
    private String description;
    private String id;
    /**
     * 纬度
     */
    private double latitude;
    /**
     * 经度
     */
    private double longitude;
    /**
     * 结束时间
     */
    private OffsetDateTime timeEnd;
    /**
     * 开始时间
     */
    private OffsetDateTime timeStart;
    /**
     * 标记标题
     */
    private String title;
    /**
     * 标记类型
     */
    private MarkerType type;
    /**
     * 更新时间
     */
    private OffsetDateTime updatedAt;
    /**
     * 标记可见性
     */
    private Visibility visibility;
}
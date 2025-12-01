package com.project.gis.dto;

import java.time.OffsetDateTime;

/**
 * GetMarkersRequest
 */
@lombok.Data
public class MarkersGetRequest {
    /**
     * 关键词搜索（匹配标题、描述）
     */
    private String keyword;
    /**
     * 最大高度（米）
     */
    private Double maxHeight;
    /**
     * 最小高度（米）
     */
    private Double minHeight;
    /**
     * ISO 8601 格式，筛选时间范围结束点。
     */
    private OffsetDateTime timeEnd;
    /**
     * ISO 8601 格式，筛选时间范围开始点。
     */
    private OffsetDateTime timeStart;
    /**
     * 标记类型 ID
     */
    private String type;
}
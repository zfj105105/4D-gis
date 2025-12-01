package com.project.gis.dto;

/**
 * MarkerTypeGetResponse
 */
@lombok.Data
public class MarkerTypeGetResponse{
    private String color;
    /**
     * 图标名
     */
    private String icon;

    private String name;

    private String typeId;
}
package com.project.gis.entity;

/**
 * 标记类型
 */
@lombok.Data
public class MarkerType
{
    private String color;
    /**
     * 图标名
     */
    private String icon;

    private String name;

    private String typeId;
}
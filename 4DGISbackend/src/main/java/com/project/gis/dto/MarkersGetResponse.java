package com.project.gis.dto;

import com.project.gis.entity.Marker;

@lombok.Data
public class MarkersGetResponse{
    private Marker[] data;

    private Long total;
}
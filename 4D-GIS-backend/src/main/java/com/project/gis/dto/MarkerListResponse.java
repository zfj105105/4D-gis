package com.project.gis.dto;

import lombok.Data;

import java.util.List;

@Data
public class MarkerListResponse
{
    private List<MarkerResponse> markers;
}

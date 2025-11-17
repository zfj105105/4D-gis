package com.project.gis.service;

import com.project.gis.dto.CreateMarkerRequest;
import com.project.gis.dto.MarkerResponse;
import com.project.gis.dto.UpdateMarkerRequest;
import com.project.gis.model.entity.Marker;
import com.project.gis.model.entity.User;

import java.util.List;

public interface MarkerService
{
    MarkerResponse createMarker(CreateMarkerRequest request, Long userId);

    List<MarkerResponse> listVisibleMarkers(Long userId);

    MarkerResponse getMarkerById(Long markerId, Long userId);

    MarkerResponse updateMarker(Long markerId, User user, UpdateMarkerRequest req);

    void deleteMarker(Long markerId, Long userId);
}

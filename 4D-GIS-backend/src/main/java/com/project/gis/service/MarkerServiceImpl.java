package com.project.gis.service;

import com.project.gis.dto.CreateMarkerRequest;
import com.project.gis.dto.MarkerResponse;
import com.project.gis.dto.UpdateMarkerRequest;
import com.project.gis.model.entity.Marker;
import com.project.gis.model.entity.MarkerType;
import com.project.gis.model.entity.User;
import com.project.gis.repository.MarkerRepository;
import com.project.gis.repository.MarkerTypeRepository;
import com.project.gis.repository.UserRepository;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Objects;

@Service
public class MarkerServiceImpl implements MarkerService
{
    private final MarkerRepository markerRepository;
    private final GeometryFactory geometryFactory;
    private final DateTimeFormatter fmt = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private final UserRepository userRepository;
    private final MarkerTypeRepository markerTypeRepository;

    public MarkerServiceImpl(MarkerRepository markerRepository, UserRepository userRepository, MarkerTypeRepository markerTypeRepository, GeometryFactory geometryFactory)
    {
        this.markerRepository = markerRepository;
        this.userRepository = userRepository;
        this.markerTypeRepository = markerTypeRepository;
        this.geometryFactory = geometryFactory;
    }

    @Override
    public MarkerResponse createMarker(CreateMarkerRequest req, Long userId)
    {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new RuntimeException("User not found!"));
        Long typeId = req.getMarkerTypeId() != null ? req.getMarkerTypeId() : 1;
        MarkerType type = markerTypeRepository.findById(typeId)
                                               .orElseThrow(() -> new RuntimeException("MarkerType not found!"));

        Marker marker = new Marker();

        marker.setTitle(req.getTitle());
        marker.setDescription(req.getDescription());

        if (req.getStartTime() != null && !req.getStartTime().isBlank())
        {
            marker.setStartTime(LocalDateTime.parse(req.getStartTime(), fmt));
        }
        else
        {
            marker.setStartTime(LocalDateTime.now());
        }

        if (req.getEndTime() != null && !req.getEndTime().isBlank())
        {
            marker.setEndTime(LocalDateTime.parse(req.getEndTime(), fmt));
        }
        else
        {
            marker.setEndTime(null);
        }

        Point point = geometryFactory.createPoint(new Coordinate(req.getLongitude(), req.getLatitude()));
        point.setSRID(4326);
        marker.setLocation(point);

        marker.setAltitude(req.getAltitude());

        marker.setMarkerType(type);
        marker.setCreator(user);
        marker.setOwner(user);
        marker.setVisibility(Marker.Visibility.valueOf("personal"));

        Marker saved = markerRepository.save(marker);

        return toResponse(saved);
    }
    
    @Override
    public List<MarkerResponse> listVisibleMarkers(Long userId)
    {
        return markerRepository.findVisibleMarkers(userId)
                               .stream()
                               .map(this::toResponse)
                               .toList();
    }

    @Override
    public MarkerResponse getMarkerById(Long markerId, Long userId)
    {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        Marker marker = markerRepository.findById(markerId)
                                        .orElseThrow(() -> new RuntimeException("MARKER_NOT_FOUND"));

        // --- 权限判断 ---
        boolean isOwner = (marker.getCreator() != null && Objects.equals(marker.getCreator().getId(), user.getId()))
                       || (marker.getOwner() != null && Objects.equals(marker.getOwner().getId(), user.getId()));
        boolean isPublic = "all_can_see".equals(marker.getVisibility());

        if (!isPublic && !isOwner)
        {
            throw new RuntimeException("FORBIDDEN");
        }

        return toResponse(marker);
    }

    @Override
    public MarkerResponse updateMarker(Long markerId, User user, UpdateMarkerRequest req)
    {
        MarkerType type = null;

        if (req.getMarkerTypeId() != null)
        {
            type = markerTypeRepository.findById(req.getMarkerTypeId())
                                        .orElseThrow(() -> new RuntimeException("MarkerType not found!"));
        }

        Marker marker = markerRepository.findById(markerId)
                                        .orElseThrow(() -> new RuntimeException("MARKER_NOT_FOUND"));

        boolean isOwner = (marker.getCreator() != null && Objects.equals(marker.getCreator().getId(), user.getId()))
                       || (marker.getOwner() != null && Objects.equals(marker.getOwner().getId(), user.getId()));
        if (!isOwner)
        {
            throw new RuntimeException("FORBIDDEN");
        }

        // 更新字段（非空才更新）

        if (req.getLongitude() != null && req.getLatitude() != null)
        {
            Point point = geometryFactory.createPoint(new Coordinate(req.getLongitude(), req.getLatitude()));
            point.setSRID(4326);
            marker.setLocation(point);
        }

        if (req.getAltitude() != null)
            marker.setAltitude(req.getAltitude());

        if (req.getTitle() != null)
            marker.setTitle(req.getTitle());

        if (req.getDescription() != null)
            marker.setDescription(req.getDescription());

        if (req.getStartTime() != null)
            marker.setStartTime(LocalDateTime.parse(req.getStartTime(), fmt));

        if (req.getEndTime() != null)
            marker.setEndTime(LocalDateTime.parse(req.getEndTime(), fmt));

        if (req.getMarkerTypeId() != null)
            marker.setMarkerType(type);

        Marker saved = markerRepository.save(marker);

        return toResponse(saved);
    }

    @Override
    public void deleteMarker(Long markerId, Long userId)
    {
        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        Marker marker = markerRepository.findById(markerId)
                                        .orElseThrow(() -> new RuntimeException("MARKER_NOT_FOUND"));

        boolean isOwner = (marker.getCreator() != null && Objects.equals(marker.getCreator().getId(), user.getId()))
                       || (marker.getOwner() != null && Objects.equals(marker.getOwner().getId(), user.getId()));
        if (!isOwner)
        {
            throw new RuntimeException("FORBIDDEN");
        }

        markerRepository.delete(marker);
    }

    private MarkerResponse toResponse(Marker m)
    {
        MarkerResponse r = new MarkerResponse();
        r.setId(m.getId());
        r.setTitle(m.getTitle());
        r.setDescription(m.getDescription());

        if (m.getLocation() != null)
        {
            r.setLongitude(m.getLocation().getX());
            r.setLatitude(m.getLocation().getY());
        }

        r.setAltitude(m.getAltitude());
        r.setStartTime(m.getStartTime() != null ? m.getStartTime().toString() : null);
        r.setEndTime(m.getEndTime() != null ? m.getEndTime().toString() : null);

        r.setMarkerTypeId(m.getMarkerType().getId());
        r.setCreatorId(m.getCreator().getId());
        r.setOwnerId(m.getOwner().getId());
        r.setVisibility(String.valueOf(m.getVisibility()));

        return r;
    }
}

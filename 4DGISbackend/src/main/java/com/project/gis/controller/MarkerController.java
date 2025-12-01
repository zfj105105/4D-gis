package com.project.gis.controller;

import com.project.gis.dto.MarkerCreateRequest;
import com.project.gis.dto.MarkerCreateResponse;
import com.project.gis.entity.JpaMarker;
import com.project.gis.entity.MarkerType;
import com.project.gis.entity.CreatedBy;
import com.project.gis.service.MarkerService;
import com.project.gis.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

@RestController
@RequestMapping("/markers")
public class MarkerController {
    private final MarkerService markerService;
    private final UserService userService;

    public MarkerController(MarkerService markerService, UserService userService) {
        this.markerService = markerService;
        this.userService = userService;
    }

    private static final DateTimeFormatter DTF = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private OffsetDateTime parseToOffset(String s) {
        if (s == null)
            return null;
        try {
            LocalDateTime ldt = LocalDateTime.parse(s, DTF);
            return ldt.atOffset(ZoneOffset.UTC);
        } catch (Exception ex) {
            try {
                return OffsetDateTime.parse(s);
            } catch (Exception ex2) {
                return null;
            }
        }
    }

    private OffsetDateTime parseToOffset(OffsetDateTime odt) {
        return odt;
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody MarkerCreateRequest req) {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        if (a != null && a.getPrincipal() instanceof String) {
            userId = Long.parseLong((String) a.getPrincipal());
        }
        if (userId == null) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.UNAUTHENTICATED, "未认证");
            return ResponseEntity.status(401).body(er);
        }
        JpaMarker m = new JpaMarker();
        m.setTitle(req.getTitle());
        m.setDescription(req.getDescription());
        m.setAltitude(req.getAltitude());
        OffsetDateTime st = parseToOffset(req.getTimeStart());
        if (st == null) {
            st = OffsetDateTime.now(ZoneOffset.UTC);
        }
        OffsetDateTime et = parseToOffset(req.getTimeEnd());
        m.setStartTime(st);
        m.setEndTime(et);
        m.setMarkerTypeId(req.getTypeId() == null ? 0L : Long.parseLong(req.getTypeId()));
        m.setCreatorId(userId);
        m.setOwnerId(userId);
        m.setVisibility(req.getVisibility() == null ? com.project.gis.dto.Visibility.PRIVATE.toValue()
                : req.getVisibility().toValue());
        // WKT POINT(lon lat)
        Double lon = req.getLongitude();
        Double lat = req.getLatitude();
        if (lon == null || lat == null) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.VALIDATION_ERROR, "经纬度未提供");
            return ResponseEntity.badRequest().body(er);
        }
        if (Double.isNaN(lon) || Double.isInfinite(lon) || Double.isNaN(lat) || Double.isInfinite(lat)) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.VALIDATION_ERROR, "经纬度无效");
            return ResponseEntity.badRequest().body(er);
        }
        if (lon < -180.0 || lon > 180.0 || lat < -90.0 || lat > 90.0) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.VALIDATION_ERROR, "经纬度超出范围");
            return ResponseEntity.badRequest().body(er);
        }
        m.setLocation(String.format("POINT(%f %f)", req.getLongitude(), req.getLatitude()));
        try {
            JpaMarker saved = markerService.create(m);
            MarkerCreateResponse resp = new MarkerCreateResponse();
            resp.setId(String.valueOf(saved.getId()));
            resp.setTitle(saved.getTitle());
            resp.setDescription(saved.getDescription());
            resp.setAltitude(saved.getAltitude());
            resp.setTimeStart(saved.getStartTime());
            resp.setTimeEnd(saved.getEndTime());
            try {
                resp.setVisibility(com.project.gis.dto.Visibility.forValue(saved.getVisibility()));
            } catch (java.io.IOException ex) {
                resp.setVisibility(com.project.gis.dto.Visibility.PRIVATE);
            }
            CreatedBy cb = new CreatedBy();
            cb.setUserId(String.valueOf(saved.getCreatorId()));
            cb.setUsername(null);
            resp.setCreatedBy(cb);
            return ResponseEntity.ok(resp);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.VALIDATION_ERROR, "数据验证失败");
            return ResponseEntity.badRequest().body(er);
        } catch (Exception ex) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.INTERNAL_ERROR, "无法创建标注");
            return ResponseEntity.status(500).body(er);
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> get(@PathVariable Long id) {
        return markerService.get(id).map(m -> {
            MarkerCreateResponse resp = new MarkerCreateResponse();
            resp.setId(String.valueOf(m.getId()));
            resp.setTitle(m.getTitle());
            resp.setDescription(m.getDescription());
            resp.setAltitude(m.getAltitude());
            resp.setTimeStart(m.getStartTime());
            resp.setTimeEnd(m.getEndTime());
            try {
                resp.setVisibility(com.project.gis.dto.Visibility.forValue(m.getVisibility()));
            } catch (java.io.IOException ex) {
                resp.setVisibility(com.project.gis.dto.Visibility.PRIVATE);
            }
            return ResponseEntity.ok(resp);
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public ResponseEntity<List<MarkerCreateResponse>> listByOwner() {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        if (a != null && a.getPrincipal() instanceof String) {
            userId = Long.parseLong((String) a.getPrincipal());
        }
        if (userId == null) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.UNAUTHENTICATED, "未认证");
            return ResponseEntity.status(401).body(java.util.Collections.emptyList());
        }
        List<JpaMarker> l = markerService.listByOwner(userId);
        List<MarkerCreateResponse> out = l.stream().map(m -> {
            MarkerCreateResponse r = new MarkerCreateResponse();
            r.setId(String.valueOf(m.getId()));
            r.setTitle(m.getTitle());
            r.setDescription(m.getDescription());
            r.setAltitude(m.getAltitude());
            r.setTimeStart(m.getStartTime());
            r.setTimeEnd(m.getEndTime());
            try {
                r.setVisibility(com.project.gis.dto.Visibility.forValue(m.getVisibility()));
            } catch (java.io.IOException ex) {
                r.setVisibility(com.project.gis.dto.Visibility.PRIVATE);
            }
            return r;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody MarkerCreateRequest req) {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        if (a != null && a.getPrincipal() instanceof String)
            userId = Long.parseLong((String) a.getPrincipal());
        JpaMarker existing = markerService.get(id).orElse(null);
        if (existing == null)
            return ResponseEntity.status(404)
                    .body(com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.NOT_FOUND, "标注未找到"));
        if (userId == null || !existing.getOwnerId().equals(userId))
            return ResponseEntity.status(403)
                    .body(com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.FORBIDDEN, "没有权限修改此标注"));
        if (req.getTitle() != null)
            existing.setTitle(req.getTitle());
        if (req.getDescription() != null)
            existing.setDescription(req.getDescription());
        if (req.getAltitude() != null)
            existing.setAltitude(req.getAltitude());
        if (req.getTimeStart() != null) {
            OffsetDateTime st = parseToOffset(req.getTimeStart());
            if (st != null)
                existing.setStartTime(st);
        }
        if (req.getTimeEnd() != null) {
            OffsetDateTime et = parseToOffset(req.getTimeEnd());
            if (et != null)
                existing.setEndTime(et);
        }
        existing.setVisibility(req.getVisibility() == null ? existing.getVisibility() : req.getVisibility().toValue());
        // update location only when values are provided
        Double lon = req.getLongitude();
        Double lat = req.getLatitude();
        if (lon != null && lat != null) {
            existing.setLocation(String.format("POINT(%f %f)", lon, lat));
        }
        JpaMarker saved = markerService.create(existing);
        MarkerCreateResponse resp = new MarkerCreateResponse();
        resp.setId(String.valueOf(saved.getId()));
        resp.setTitle(saved.getTitle());
        resp.setDescription(saved.getDescription());
        resp.setAltitude(saved.getAltitude());
        resp.setTimeStart(saved.getStartTime());
        resp.setTimeEnd(saved.getEndTime());
        try {
            resp.setVisibility(com.project.gis.dto.Visibility.forValue(saved.getVisibility()));
        } catch (java.io.IOException ex) {
            resp.setVisibility(com.project.gis.dto.Visibility.PRIVATE);
        }
        return ResponseEntity.ok(resp);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        Authentication a = SecurityContextHolder.getContext().getAuthentication();
        Long userId = null;
        if (a != null && a.getPrincipal() instanceof String)
            userId = Long.parseLong((String) a.getPrincipal());
        JpaMarker existing = markerService.get(id).orElse(null);
        if (existing == null)
            return ResponseEntity.status(404)
                    .body(com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.NOT_FOUND, "标注未找到"));
        if (!existing.getOwnerId().equals(userId))
            return ResponseEntity.status(403)
                    .body(com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.FORBIDDEN, "没有权限删除此标注"));
        markerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}

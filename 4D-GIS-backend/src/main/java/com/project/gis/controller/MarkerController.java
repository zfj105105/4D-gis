package com.project.gis.controller;

import com.project.gis.dto.*;
import com.project.gis.model.entity.Marker;
import com.project.gis.model.entity.User;
import com.project.gis.repository.MarkerRepository;
import com.project.gis.repository.UserRepository;
import com.project.gis.service.MarkerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.yaml.snakeyaml.error.Mark;

import java.util.List;

@RestController
@RequestMapping("/api/marker")
public class MarkerController
{
    private final MarkerService markerService;
    private final UserRepository userRepository;
    private final MarkerRepository markerRepository;

    public MarkerController(MarkerService markerService, UserRepository userRepository, MarkerRepository markerRepository)
    {
        this.markerService = markerService;
        this.userRepository = userRepository;
        this.markerRepository = markerRepository;
    }

    // 创建标记
    @PostMapping("/create")
    public ResponseEntity<?> createMarker(@Valid @RequestBody CreateMarkerRequest req)
    {
        Long userId = (Long) SecurityContextHolder.getContext()
                                                  .getAuthentication()
                                                  .getPrincipal();

        MarkerResponse res = markerService.createMarker(req, userId);
        return ResponseEntity.ok(res);
    }

    // 列表
    @GetMapping("/list")
    public ResponseEntity<?> list()
    {
        Long userId = (Long) SecurityContextHolder.getContext()
                                                  .getAuthentication()
                                                  .getPrincipal();

        try
        {
            List<MarkerResponse> list = markerService.listVisibleMarkers(userId);

            MarkerListResponse resp = new MarkerListResponse();
            resp.setMarkers(list);

            return ResponseEntity.ok(resp);
        }
        catch (Exception ex)
        {
            return ResponseEntity.status(500)
                                 .body(new ErrorResponse("INTERNAL_ERROR", "服务器错误", null));
        }
    }

    // 标记查询
    @GetMapping("/{id}")
    public ResponseEntity<?> getDetail(@PathVariable("id") Long id)
    {
        Long userId = (Long) SecurityContextHolder.getContext()
                                                  .getAuthentication()
                                                  .getPrincipal();

        try
        {
            MarkerResponse res = markerService.getMarkerById(id, userId);
            return ResponseEntity.ok(res);
        }
        catch (RuntimeException ex)
        {
            switch (ex.getMessage())
            {
                case "MARKER_NOT_FOUND":
                    return ResponseEntity.status(404)
                                         .body(new ErrorResponse("MARKER_NOT_FOUND", "标记不存在", null));

                case "FORBIDDEN":
                    return ResponseEntity.status(403)
                                         .body(new ErrorResponse("FORBIDDEN", "无访问权限", null));

                default:
                    return ResponseEntity.status(500)
                                         .body(new ErrorResponse("INTERNAL_ERROR", "服务器内部错误", null));
            }
        }
    }

    // 更新标记
    @PutMapping("/{id}/update")
    public ResponseEntity<?> updateMarker(@PathVariable("id") Long markerId, @RequestBody UpdateMarkerRequest req)
    {
        Long userId = (Long) SecurityContextHolder.getContext()
                                                  .getAuthentication()
                                                  .getPrincipal();

        Marker marker = markerRepository.findById(markerId)
                                        .orElseThrow(() -> new RuntimeException("Marker not found!"));

        User user = userRepository.findById(userId)
                                  .orElseThrow(() -> new RuntimeException("User not found!"));

        try
        {
            MarkerResponse res = markerService.updateMarker(markerId, user, req);
            return ResponseEntity.ok(res);
        }
        catch (RuntimeException ex)
        {
            switch (ex.getMessage())
            {
                case "MARKER_NOT_FOUND":
                    return ResponseEntity.status(404)
                                         .body(new ErrorResponse("MARKER_NOT_FOUND", "标记不存在", null));

                case "FORBIDDEN":
                    return ResponseEntity.status(403)
                                         .body(new ErrorResponse("FORBIDDEN", "无权限修改此标记", null));

                default:
                    return ResponseEntity.status(500)
                                         .body(new ErrorResponse("INTERNAL_ERROR", "服务器错误", null));
            }
        }
    }

    // 删除标记
    @DeleteMapping("/{id}/delete")
    public ResponseEntity<?> deleteMarker(@PathVariable("id") Long id)
    {
        Long userId = (Long) SecurityContextHolder.getContext()
                                                  .getAuthentication()
                                                  .getPrincipal();

        try
        {
            markerService.deleteMarker(id, userId);
            return ResponseEntity.ok(java.util.Map.of("message", "删除成功"));
        }
        catch (RuntimeException ex)
        {
            switch (ex.getMessage())
            {
                case "MARKER_NOT_FOUND":
                    return ResponseEntity.status(404)
                                         .body(new ErrorResponse("MARKER_NOT_FOUND", "标记不存在", null));

                case "FORBIDDEN":
                    return ResponseEntity.status(403)
                                         .body(new ErrorResponse("FORBIDDEN", "无权限删除此标记", null));

                default:
                    return ResponseEntity.status(500)
                                         .body(new ErrorResponse("INTERNAL_ERROR", "服务器错误", null));
            }
        }
    }


    // 参数校验
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(MethodArgumentNotValidException e)
    {
        List<ErrorResponse.FieldErrorItem> items = e.getBindingResult()
                                                    .getFieldErrors()
                                                    .stream()
                                                    .map(err -> new ErrorResponse.FieldErrorItem(err.getField(), err.getDefaultMessage()))
                                                    .toList();

        return ResponseEntity.badRequest()
                             .body(new ErrorResponse("VALIDATION_ERROR", "输入参数无效", items));
    }
}

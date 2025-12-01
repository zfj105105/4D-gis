package com.project.gis.controller;

import com.project.gis.entity.JpaMarkerType;
import com.project.gis.repository.MarkerTypeRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/marker-types")
public class MarkerTypeController {
    private final MarkerTypeRepository repo;

    public MarkerTypeController(MarkerTypeRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public ResponseEntity<List<JpaMarkerType>> list() {
        return ResponseEntity.ok(repo.findAll());
    }
}

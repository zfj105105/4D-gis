package com.project.gis.service;

import com.project.gis.entity.JpaMarker;
import com.project.gis.repository.MarkerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class MarkerService {
    private final MarkerRepository markerRepository;

    public MarkerService(MarkerRepository markerRepository) {
        this.markerRepository = markerRepository;
    }

    public JpaMarker create(JpaMarker marker) {
        return markerRepository.save(marker);
    }

    public Optional<JpaMarker> get(Long id) {
        return markerRepository.findById(id);
    }

    public List<JpaMarker> listByOwner(Long ownerId) {
        return markerRepository.findByOwnerId(ownerId);
    }

    public List<JpaMarker> search(String q) {
        return markerRepository.search(q);
    }

    public void delete(Long id) {
        markerRepository.deleteById(id);
    }
}

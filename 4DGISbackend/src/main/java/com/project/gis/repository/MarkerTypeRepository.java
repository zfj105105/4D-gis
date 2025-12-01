package com.project.gis.repository;

import com.project.gis.entity.JpaMarkerType;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarkerTypeRepository extends JpaRepository<JpaMarkerType, Long> {
}

package com.project.gis.repository;

import com.project.gis.entity.JpaMarkerTag;
import com.project.gis.entity.JpaMarkerTag.MarkerTagId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarkerTagRepository extends JpaRepository<JpaMarkerTag, MarkerTagId> {
}

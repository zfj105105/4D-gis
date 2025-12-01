package com.project.gis.repository;

import com.project.gis.entity.JpaMarkerCollaborator;
import com.project.gis.entity.JpaMarkerCollaborator.MarkerCollaboratorId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarkerCollaboratorRepository extends JpaRepository<JpaMarkerCollaborator, MarkerCollaboratorId> {
}

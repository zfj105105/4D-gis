package com.project.gis.repository;

import com.project.gis.model.entity.MarkerCollaborator;
import com.project.gis.model.entity.MarkerCollaboratorId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MarkerCollaboratorRepository extends JpaRepository<MarkerCollaborator, MarkerCollaboratorId>
{
    List<MarkerCollaborator> findByMarkerId(Long markerId);

    List<MarkerCollaborator> findByUserId(Long userId);
}

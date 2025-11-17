package com.project.gis.repository;

import com.project.gis.model.entity.MarkerType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MarkerTypeRepository extends JpaRepository<MarkerType, Long>
{
    Optional<MarkerType> findByTypeName(String typeName);
}

package com.project.gis.repository;

import com.project.gis.model.entity.Marker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MarkerRepository extends JpaRepository<Marker, Long>
{
    // 仅 public / owner / creator 可见
    @Query("""
        SELECT m FROM Marker m
        WHERE
            m.visibility = 'public'
            OR m.creator.id = :userId
            OR m.owner.id = :userId
    """)
    List<Marker> findVisibleMarkers(Long userId);
}

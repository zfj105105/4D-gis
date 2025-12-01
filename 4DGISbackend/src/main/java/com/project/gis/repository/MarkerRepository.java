package com.project.gis.repository;

import com.project.gis.entity.JpaMarker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface MarkerRepository extends JpaRepository<JpaMarker, Long> {
    List<JpaMarker> findByOwnerId(Long ownerId);

    @Query("select m from JpaMarker m where m.title like %:q% or m.description like %:q%")
    List<JpaMarker> search(@Param("q") String q);
}

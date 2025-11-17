package com.project.gis.repository;

import com.project.gis.model.entity.Attachment;
import com.project.gis.model.entity.Marker;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<Attachment, Long>
{
    List<Attachment> findByMarker(Marker marker);
}

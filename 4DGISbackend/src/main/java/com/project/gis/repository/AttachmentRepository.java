package com.project.gis.repository;

import com.project.gis.entity.JpaAttachment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AttachmentRepository extends JpaRepository<JpaAttachment, Long> {
    List<JpaAttachment> findByMarkerId(Long markerId);
}

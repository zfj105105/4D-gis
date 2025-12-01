package com.project.gis.repository;

import com.project.gis.entity.JpaTag;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TagRepository extends JpaRepository<JpaTag, Long> {
    Optional<JpaTag> findByTagName(String tagName);
}

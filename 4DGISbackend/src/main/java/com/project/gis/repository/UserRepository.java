package com.project.gis.repository;

import com.project.gis.entity.JpaUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<JpaUser, Long> {
    Optional<JpaUser> findByUsername(String username);
    Optional<JpaUser> findByEmail(String email);
    Optional<JpaUser> findByPhone(String phone);
}

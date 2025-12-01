package com.project.gis.repository;

import com.project.gis.entity.JpaFriendship;
import com.project.gis.entity.JpaFriendship.FriendshipId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FriendshipRepository extends JpaRepository<JpaFriendship, FriendshipId> {
    @Query("select f from JpaFriendship f where f.id.user1Id = :uid or f.id.user2Id = :uid")
    List<JpaFriendship> findByUserId(@Param("uid") Long userId);
}

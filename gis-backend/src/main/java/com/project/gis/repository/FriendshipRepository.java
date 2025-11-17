package com.project.gis.repository;

import com.project.gis.model.entity.Friendship;
import com.project.gis.model.entity.FriendshipId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FriendshipRepository extends JpaRepository<Friendship, FriendshipId>
{
    List<Friendship> findByUserId(Long userId);

    List<Friendship> findByFriendId(Long friendId);
}

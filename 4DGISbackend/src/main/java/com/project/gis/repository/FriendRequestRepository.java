package com.project.gis.repository;

import com.project.gis.entity.JpaFriendRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FriendRequestRepository extends JpaRepository<JpaFriendRequest, Long> {
    List<JpaFriendRequest> findByRecipientId(Long recipientId);
    List<JpaFriendRequest> findByRequesterId(Long requesterId);
    boolean existsByRequesterIdAndRecipientId(Long requesterId, Long recipientId);
}

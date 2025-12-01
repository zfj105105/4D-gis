package com.project.gis.service;

import com.project.gis.entity.JpaFriendRequest;
import com.project.gis.entity.JpaFriendship;
import com.project.gis.entity.JpaFriendship.FriendshipId;
import com.project.gis.repository.FriendRequestRepository;
import com.project.gis.repository.FriendshipRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FriendService {
    private final FriendRequestRepository requestRepository;
    private final FriendshipRepository friendshipRepository;

    public FriendService(FriendRequestRepository requestRepository, FriendshipRepository friendshipRepository) {
        this.requestRepository = requestRepository;
        this.friendshipRepository = friendshipRepository;
    }

    public JpaFriendRequest sendRequest(Long requesterId, Long recipientId) {
        if (requestRepository.existsByRequesterIdAndRecipientId(requesterId, recipientId)) {
            throw new IllegalStateException("Request already exists");
        }
        JpaFriendRequest req = new JpaFriendRequest();
        req.setRequesterId(requesterId);
        req.setRecipientId(recipientId);
        return requestRepository.save(req);
    }

    public void handleRequest(Long requestId, boolean accept) {
        JpaFriendRequest req = requestRepository.findById(requestId).orElseThrow();
        if (accept) {
            Long a = req.getRequesterId();
            Long b = req.getRecipientId();
            FriendshipId id = new FriendshipId();
            if (a < b) { id.setUser1Id(a); id.setUser2Id(b);} else { id.setUser1Id(b); id.setUser2Id(a);} 
            JpaFriendship f = new JpaFriendship();
            f.setId(id);
            friendshipRepository.save(f);
        }
        requestRepository.delete(req);
    }

    public void addFriendDirect(Long userA, Long userB) {
        FriendshipId id = new FriendshipId();
        if (userA < userB) { id.setUser1Id(userA); id.setUser2Id(userB);} else { id.setUser1Id(userB); id.setUser2Id(userA);} 
        JpaFriendship f = new JpaFriendship();
        f.setId(id);
        friendshipRepository.save(f);
    }

    public java.util.List<com.project.gis.dto.FriendResponse> listFriends(Long userId, com.project.gis.repository.UserRepository userRepository) {
        java.util.List<JpaFriendship> l = friendshipRepository.findByUserId(userId);
        java.util.List<com.project.gis.dto.FriendResponse> out = new java.util.ArrayList<>();
        for (JpaFriendship f : l) {
            Long other = f.getId().getUser1Id().equals(userId) ? f.getId().getUser2Id() : f.getId().getUser1Id();
            com.project.gis.dto.FriendResponse r = new com.project.gis.dto.FriendResponse();
            r.setId(String.valueOf(other));
            r.setCreatedAt(f.getCreatedAt());
            userRepository.findById(other).ifPresent(u -> { r.setEmail(u.getEmail()); r.setName(u.getUsername()); r.setPhone(u.getPhone()); });
            r.setMutualFriends(0L);
            out.add(r);
        }
        return out;
    }

    public List<JpaFriendRequest> getReceived(Long recipientId) {
        return requestRepository.findByRecipientId(recipientId);
    }

    public void acceptRequest(Long requestId) {
        JpaFriendRequest req = requestRepository.findById(requestId).orElseThrow();
        Long a = req.getRequesterId();
        Long b = req.getRecipientId();
        FriendshipId id = new FriendshipId();
        if (a < b) { id.setUser1Id(a); id.setUser2Id(b);} else { id.setUser1Id(b); id.setUser2Id(a);} 
        JpaFriendship f = new JpaFriendship();
        f.setId(id);
        friendshipRepository.save(f);
        requestRepository.delete(req);
    }

    public void removeFriend(Long userA, Long userB) {
        FriendshipId id = new FriendshipId();
        if (userA < userB) { id.setUser1Id(userA); id.setUser2Id(userB);} else { id.setUser1Id(userB); id.setUser2Id(userA);} 
        friendshipRepository.deleteById(id);
    }

    public List<Long> listFriendIds(Long userId) {
        List<JpaFriendship> l = friendshipRepository.findByUserId(userId);
        return l.stream().map(f -> f.getId().getUser1Id().equals(userId) ? f.getId().getUser2Id() : f.getId().getUser1Id()).collect(Collectors.toList());
    }
}

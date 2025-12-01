package com.project.gis.controller;

import com.project.gis.dto.FriendRequestSendRequest;
import com.project.gis.dto.FriendRequestSendResponse;
import com.project.gis.dto.FriendsRequestsGetResponse;
import com.project.gis.entity.JpaFriendRequest;
import com.project.gis.service.FriendService;
import com.project.gis.service.UserService;
import com.project.gis.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/friends")
public class FriendController {
    private final FriendService friendService;
    private final UserService userService;
    private final UserRepository userRepository;

    public FriendController(FriendService friendService, UserService userService, UserRepository userRepository) {
        this.friendService = friendService;
        this.userService = userService;
        this.userRepository = userRepository;
    }

    @PostMapping("/requests")
    public ResponseEntity<?> sendRequest(@RequestHeader(name = "X-User-Id", required = false) Long userId,
            @RequestBody FriendRequestSendRequest req) {
        if (userId == null)
            userId = 1L;
        try {
            Long target = Long.parseLong(req.getTargetUserId());
            friendService.sendRequest(userId, target);
            FriendRequestSendResponse r = new FriendRequestSendResponse();
            r.setMessage("ok");
            return ResponseEntity.ok(r);
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(
                    com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.VALIDATION_ERROR, "目标用户ID无效"));
        } catch (IllegalStateException ex) {
            return ResponseEntity.status(409).body(com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.ALREADY_FRIENDS, ex.getMessage()));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(
                    com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.INTERNAL_ERROR, "发送好友请求失败"));
        }
    }

    @GetMapping("/requests")
    public ResponseEntity<List<FriendsRequestsGetResponse>> getReceived(
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        if (userId == null)
            userId = 1L;
        List<JpaFriendRequest> l = friendService.getReceived(userId);
        List<FriendsRequestsGetResponse> out = l.stream().map(fr -> {
            FriendsRequestsGetResponse r = new FriendsRequestsGetResponse();
            r.setId(String.valueOf(fr.getId()));
            r.setSenderId(String.valueOf(fr.getRequesterId()));
            r.setRequestDate(fr.getCreatedAt());
            r.setMessage(null);
            r.setName(null);
            r.setMutualFriends(0);
            return r;
        }).collect(Collectors.toList());
        return ResponseEntity.ok(out);
    }

    @PostMapping("/requests/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable Long id) {
        try {
            friendService.acceptRequest(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException ex) {
            return ResponseEntity.status(404)
                    .body(com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.NOT_FOUND, "好友请求未找到"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(
                    com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.INTERNAL_ERROR, "处理好友请求失败"));
        }
    }

    @PostMapping
    public ResponseEntity<?> addFriend(@RequestHeader(name = "X-User-Id", required = false) Long userId,
            @RequestBody FriendRequestSendRequest req) {
        if (userId == null)
            userId = 1L;
        try {
            Long target = Long.parseLong(req.getTargetUserId());
            friendService.addFriendDirect(userId, target);
            return ResponseEntity.ok().build();
        } catch (NumberFormatException ex) {
            return ResponseEntity.badRequest().body(
                    com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.VALIDATION_ERROR, "目标用户ID无效"));
        } catch (Exception ex) {
            return ResponseEntity.status(500).body(
                    com.project.gis.dto.ErrorResponse.of(com.project.gis.error.ErrorCode.INTERNAL_ERROR, "添加好友失败"));
        }
    }

    @GetMapping
    public ResponseEntity<List<com.project.gis.dto.FriendResponse>> listFriends(
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        if (userId == null)
            userId = 1L;
        List<com.project.gis.dto.FriendResponse> out = friendService.listFriends(userId, userRepository);
        return ResponseEntity.ok(out);
    }

    @GetMapping("/{friendId}")
    public ResponseEntity<com.project.gis.dto.FriendResponse> getFriend(@PathVariable Long friendId) {
        com.project.gis.dto.FriendResponse r = new com.project.gis.dto.FriendResponse();
        userRepository.findById(friendId).ifPresent(u -> {
            r.setId(String.valueOf(u.getId()));
            r.setEmail(u.getEmail());
            r.setName(u.getUsername());
            r.setPhone(u.getPhone());
        });
        return ResponseEntity.ok(r);
    }

    @DeleteMapping("/{friendId}")
    public ResponseEntity<Void> deleteFriend(@PathVariable Long friendId,
            @RequestHeader(name = "X-User-Id", required = false) Long userId) {
        if (userId == null)
            userId = 1L;
        friendService.removeFriend(userId, friendId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/request")
    public ResponseEntity<?> sendRequestAlt(
            @RequestHeader(name = "X-User-Id", required = false) Long userId,
            @RequestBody FriendRequestSendRequest req) {
        return sendRequest(userId, req);
    }

    @PostMapping("/request/handle")
    public ResponseEntity<Void> handleRequest(@RequestBody com.project.gis.dto.FriendRequestHandleRequest req) {
        friendService.handleRequest(Long.parseLong(req.getRequestId()), req.isAccept());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/search")
    public ResponseEntity<java.util.List<com.project.gis.dto.FriendsSearchResponse>> searchUsers(
            @RequestParam(name = "q") String q) {
        java.util.List<com.project.gis.entity.JpaUser> found = userService.searchByUsername(q);
        java.util.List<com.project.gis.dto.FriendsSearchResponse> out = found.stream().map(u -> {
            com.project.gis.dto.FriendsSearchResponse r = new com.project.gis.dto.FriendsSearchResponse();
            r.setId(String.valueOf(u.getId()));
            r.setName(u.getUsername());
            r.setFriend(false);
            r.setPending(false);
            r.setMutualFriends(0);
            return r;
        }).toList();
        return ResponseEntity.ok(out);
    }
}

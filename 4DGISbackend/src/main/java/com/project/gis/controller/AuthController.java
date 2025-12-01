package com.project.gis.controller;

import com.project.gis.dto.LoginRequest;
import com.project.gis.dto.LoginResponse;
import com.project.gis.dto.RegisterRequest;
import com.project.gis.dto.RegisterResponse;
import com.project.gis.entity.JpaUser;
import com.project.gis.entity.User;
import com.project.gis.service.UserService;
import com.project.gis.security.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest req) {
        try {
            JpaUser u = userService.register(req.getUsername(), req.getPassword(), req.getEmail(), req.getPhone());
            RegisterResponse resp = new RegisterResponse();
            resp.setMessage("ok");
            resp.setUserId(String.valueOf(u.getId()));
            return ResponseEntity.ok(resp);
        } catch (org.springframework.dao.DataIntegrityViolationException ex) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.USER_ALREADY_EXISTS, "用户名或邮箱已存在");
            return ResponseEntity.status(409).body(er);
        } catch (Exception ex) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.INTERNAL_ERROR, "注册失败");
            return ResponseEntity.status(500).body(er);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest req) {
        String identity = req.getIdentity();
        JpaUser found = userService.findByUsername(identity).orElse(null);
        if (found == null) {
            found = userService.findByEmail(identity).orElse(null);
        }
        if (found == null) {
            found = userService.findByPhone(identity).orElse(null);
        }
        if (found == null) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.INVALID_CREDENTIALS, "用户名或密码错误");
            return ResponseEntity.status(401).body(er);
        }
        if (!userService.checkPassword(found, req.getPassword())) {
            com.project.gis.dto.ErrorResponse er = com.project.gis.dto.ErrorResponse
                    .of(com.project.gis.error.ErrorCode.INVALID_CREDENTIALS, "用户名或密码错误");
            return ResponseEntity.status(401).body(er);
        }
        String token = jwtService.generateToken(String.valueOf(found.getId()));
        LoginResponse resp = new LoginResponse();
        resp.setExpiresIn(jwtService.getExpirationSeconds());
        resp.setToken(token);
        User u = new User();
        u.setUserId(String.valueOf(found.getId()));
        u.setUsername(found.getUsername());
        resp.setUser(u);
        return ResponseEntity.ok(resp);
    }
}

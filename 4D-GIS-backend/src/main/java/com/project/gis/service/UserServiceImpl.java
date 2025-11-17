package com.project.gis.service;

import com.project.gis.dto.LoginRequest;
import com.project.gis.dto.LoginResponse;
import com.project.gis.dto.RegisterRequest;
import com.project.gis.dto.RegisterResponse;
import com.project.gis.model.entity.User;
import com.project.gis.repository.UserRepository;
import com.project.gis.security.JwtUtil;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService
{
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    public UserServiceImpl(UserRepository userRepository, JwtUtil jwtUtil)
    {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public RegisterResponse register(RegisterRequest req)
    {
        if (userRepository.existsByEmail(req.getEmail()))
        {
            throw new RuntimeException("USER_ALREADY_EXISTS");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole(User.Role.valueOf("user"));

        userRepository.save(user);
        return new RegisterResponse(user.getId().toString(), "注册成功");
    }

    @Override
    public LoginResponse login(LoginRequest req)
    {
        User user = userRepository.findByEmail(req.getEmail())
                                  .orElseThrow(() -> new RuntimeException("USER_NOT_FOUND"));

        if (!encoder.matches(req.getPassword(), user.getPasswordHash()))
        {
            throw new RuntimeException("INVALID_CREDENTIALS");
        }

        String token = jwtUtil.generateToken(user.getId());
        return new LoginResponse(token, "登录成功");
    }
}

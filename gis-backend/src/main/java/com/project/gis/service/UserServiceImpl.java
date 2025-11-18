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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;

@Service
public class UserServiceImpl implements UserService
{
    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);
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
        // Check by username/email/phone to provide a friendly error before hitting DB constraint
        if (req.getUsername() != null && userRepository.existsByUsername(req.getUsername()))
        {
            throw new RuntimeException("USER_ALREADY_EXISTS");
        }

        if (req.getEmail() != null && userRepository.existsByEmail(req.getEmail()))
        {
            throw new RuntimeException("USER_ALREADY_EXISTS");
        }

        if (req.getPhone() != null && userRepository.existsByPhone(req.getPhone()))
        {
            throw new RuntimeException("USER_ALREADY_EXISTS");
        }

        User user = new User();
        user.setUsername(req.getUsername());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        user.setPasswordHash(encoder.encode(req.getPassword()));
        user.setRole(User.Role.valueOf("user"));

        try
        {
            userRepository.save(user);
        }
        catch (DataIntegrityViolationException e)
        {
            // In case of race condition or unexpected unique constraint violation,
            // translate to a known runtime exception so controller can return a friendly response.
            throw new RuntimeException("USER_ALREADY_EXISTS");
        }

        return new RegisterResponse(user.getId().toString(), "注册成功");
    }

    @Override
    public LoginResponse login(LoginRequest req)
    {
        String identity = req.getIdentity();
        if (identity == null)
        {
            throw new RuntimeException("USER_NOT_FOUND");
        }

        identity = identity.trim();
        log.debug("Attempting login for identity='{}'", identity);

        // Try to find user by email, then phone, then username — explicit checks help debugging
        User user = userRepository.findByEmail(identity).orElse(null);
        if (user != null)
        {
            log.debug("Found user by email: id={}", user.getId());
        }

        if (user == null)
        {
            user = userRepository.findByPhone(identity).orElse(null);
            if (user != null)
            {
                log.debug("Found user by phone: id={}", user.getId());
            }
        }

        if (user == null)
        {
            user = userRepository.findByUsername(identity).orElse(null);
            if (user != null)
            {
                log.debug("Found user by username: id={}", user.getId());
            }
        }

        if (user == null)
        {
            log.debug("User not found for identity='{}'", identity);
            throw new RuntimeException("USER_NOT_FOUND");
        }

        if (!encoder.matches(req.getPassword(), user.getPasswordHash()))
        {
            throw new RuntimeException("INVALID_CREDENTIALS");
        }

        String token = jwtUtil.generateToken(user.getId());
        return new LoginResponse(token, "登录成功");
    }
}

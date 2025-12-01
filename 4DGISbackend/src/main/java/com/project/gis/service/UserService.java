package com.project.gis.service;

import com.project.gis.entity.JpaUser;
import com.project.gis.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public JpaUser register(String username, String rawPassword, String email, String phone) {
        JpaUser u = new JpaUser();
        u.setUsername(username);
        u.setPasswordHash(passwordEncoder.encode(rawPassword));
        u.setEmail(email);
        u.setPhone(phone);
        return userRepository.save(u);
    }

    public Optional<JpaUser> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public Optional<JpaUser> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public Optional<JpaUser> findByPhone(String phone) {
        return userRepository.findByPhone(phone);
    }

    public java.util.List<JpaUser> searchByUsername(String q) {
        // simple implementation using repository method by username like
        return userRepository.findAll().stream().filter(u -> u.getUsername() != null && u.getUsername().toLowerCase().contains(q.toLowerCase())).toList();
    }

    public boolean checkPassword(JpaUser user, String rawPassword) {
        return passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }
}

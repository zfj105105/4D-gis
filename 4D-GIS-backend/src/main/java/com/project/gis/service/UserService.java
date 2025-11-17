package com.project.gis.service;

import com.project.gis.dto.LoginRequest;
import com.project.gis.dto.LoginResponse;
import com.project.gis.dto.RegisterRequest;
import com.project.gis.dto.RegisterResponse;

public interface UserService {

    RegisterResponse register(RegisterRequest request);

    LoginResponse login(LoginRequest request);
}

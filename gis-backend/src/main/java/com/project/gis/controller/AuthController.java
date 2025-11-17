package com.project.gis.controller;

import com.project.gis.dto.ErrorResponse;
import com.project.gis.dto.RegisterRequest;
import com.project.gis.dto.RegisterResponse;
import com.project.gis.service.UserService;
import com.project.gis.dto.*;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/auth")
public class AuthController
{
    private final UserService userService;

    public AuthController(UserService userService)
    {
        this.userService = userService;
    }

    // 注册
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req)
    {
        try
        {
            RegisterResponse response = userService.register(req);
            return ResponseEntity.ok(response);

        }
        catch (RuntimeException ex)
        {
            if ("USER_ALREADY_EXISTS".equals(ex.getMessage()))
            {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                                     .body(new ErrorResponse("USER_ALREADY_EXISTS", "该邮箱已被注册", null));
            }

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                 .body(new ErrorResponse("INTERNAL_ERROR", "服务器发生未知错误", null));
        }
    }

    // 登录
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req)
    {
        try
        {
            LoginResponse resp = userService.login(req);
            return ResponseEntity.ok(resp);

        }
        catch (RuntimeException ex)
        {
            ex.printStackTrace();

            String msg = ex.getMessage();
            if (msg == null) msg = "";

            switch (ex.getMessage())
            {
                case "USER_NOT_FOUND":
                    return ResponseEntity.status(HttpStatus.NOT_FOUND)
                                         .body(new ErrorResponse("USER_NOT_FOUND", "用户不存在", null));

                case "INVALID_CREDENTIALS":
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                         .body(new ErrorResponse("INVALID_CREDENTIALS", "邮箱或密码错误", null));

                default:
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                                         .body(new ErrorResponse("INTERNAL_ERROR", "服务器错误", null));
            }
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<?> handleValidationError(MethodArgumentNotValidException e)
    {
        List<ErrorResponse.FieldErrorItem> details = e.getBindingResult()
                                                      .getFieldErrors()
                                                      .stream()
                                                      .map(f -> new ErrorResponse.FieldErrorItem(f.getField(), f.getDefaultMessage()))
                                                      .toList();

        return ResponseEntity.badRequest()
                             .body(new ErrorResponse("VALIDATION_ERROR", "输入参数无效", details));
    }
}

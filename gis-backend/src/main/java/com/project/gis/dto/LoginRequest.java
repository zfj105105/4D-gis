package com.project.gis.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest
{
    @NotBlank(message = "账号不能为空")
    @JsonAlias({"email", "username", "phone"})
    private String identity;

    @NotBlank(message = "密码不能为空")
    private String password;
}

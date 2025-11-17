package com.project.gis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class RegisterResponse
{
    private String userId;
    private String message;
}

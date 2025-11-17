package com.project.gis.security;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Data
@ConfigurationProperties(prefix = "jwt")
public class JwtProperties
{
    private String secret;
    private Long expiration; // 毫秒
}

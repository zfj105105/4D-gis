package com.project.gis.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;
import org.springframework.context.annotation.Configuration;

@OpenAPIDefinition(
    info = @Info(title = "GIS Backend API", version = "1.0", description = "管理用户与地理标记的后端 API")
)
@Configuration
public class OpenApiConfig {
}

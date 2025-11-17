// 用于统一时间格式
package com.project.gis.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import jakarta.annotation.PostConstruct;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DateTimeConfig
{
    private final ObjectMapper objectMapper;

    public DateTimeConfig(ObjectMapper objectMapper)
    {
        this.objectMapper = objectMapper;
    }

    @PostConstruct
    public void setup()
    {
        objectMapper.registerModule(new JavaTimeModule());
    }
}

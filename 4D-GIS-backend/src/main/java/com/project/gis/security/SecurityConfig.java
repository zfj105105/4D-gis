package com.project.gis.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig
{
    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter)
    {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception
    {
        http.csrf(csrf -> csrf.disable());
        http.sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));

        http.authorizeHttpRequests(auth -> auth.requestMatchers(
                "/auth/login",
                "/auth/register",
                "/v3/api-docs/**",
                "/v3/api-docs.yaml",
                "/swagger-ui/**",
                "/swagger-ui.html",
                "/swagger-ui/index.html"
            )
            .permitAll()
            .anyRequest()
            .authenticated()
        );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}

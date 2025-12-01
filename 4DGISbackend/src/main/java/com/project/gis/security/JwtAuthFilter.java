package com.project.gis.security;

import io.jsonwebtoken.Claims;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Collections;

public class JwtAuthFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private static final Logger log = LoggerFactory.getLogger(JwtAuthFilter.class);

    public JwtAuthFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        log.debug("Incoming request {} {} - Authorization header present: {}", request.getMethod(),
                request.getRequestURI(), header != null);
        log.info("[JwtAuthFilter] Incoming {} {} - Authorization header present: {}", request.getMethod(),
                request.getRequestURI(), header != null);
        if (!StringUtils.hasText(header)) {
            log.debug("No Authorization header present");
            log.info("[JwtAuthFilter] No Authorization header present");
        } else if (!header.startsWith("Bearer ")) {
            log.debug("Authorization header does not start with 'Bearer '");
            log.info("[JwtAuthFilter] Authorization header does not start with 'Bearer '");
        } else {
            String token = header.substring(7);
            log.debug("Found Bearer token, length={}", token == null ? 0 : token.length());
            log.info("[JwtAuthFilter] Found Bearer token, length={}", token == null ? 0 : token.length());
            try {
                if (jwtService.validate(token)) {
                    Claims c = jwtService.parseToken(token);
                    String uid = c.getSubject();
                    log.debug("Token valid, subject={}", uid);
                    log.info("[JwtAuthFilter] Token valid, subject={}", uid);
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(uid, null,
                            Collections.emptyList());
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                } else {
                    log.debug("Token validation returned false");
                    log.info("[JwtAuthFilter] Token validation returned false");
                }
            } catch (Exception ex) {
                log.debug("Exception while validating/parsing token: {}", ex.getMessage());
                log.info("[JwtAuthFilter] Exception while validating/parsing token: {}", ex.getMessage());
            }
        }
        filterChain.doFilter(request, response);
    }
}

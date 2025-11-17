package com.project.gis;

import com.project.gis.security.JwtProperties;
import org.locationtech.jts.geom.GeometryFactory;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.NoSuchBeanDefinitionException;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.ApplicationContext;
import org.springframework.core.env.Environment;

@SpringBootApplication
@EnableConfigurationProperties(JwtProperties.class)
public class GisBackendApplication
{
    private static final Logger log = LoggerFactory.getLogger(GisBackendApplication.class);

    public static void main(String[] args)
    {
        ApplicationContext ctx = SpringApplication.run(GisBackendApplication.class, args);

        Environment env = ctx.getEnvironment();
        String port = env.getProperty("server.port", "8080");
        String profile = String.join(",", env.getActiveProfiles());
        if (profile.isEmpty())
            profile = env.getProperty("spring.profiles.active", "default");

        log.info("----------------------------------------------------------");
        log.info("  GIS Backend started");
        log.info("  Active profile: {}", profile);
        log.info("  Server port   : {}", port);

        try
        {
            JwtProperties jwt = ctx.getBean(JwtProperties.class);
            if (jwt.getSecret() == null || jwt.getSecret().trim().length() < 32)
            {
                log.warn("JWT secret is not configured or is too short. Set 'jwt.secret' in application.yml and use a secure key.");
            }
            else
            {
                log.info("JWT configured: expiration={}ms", jwt.getExpiration());
            }
        }
        catch (NoSuchBeanDefinitionException ex)
        {
            log.warn("JwtProperties bean not found. JWT may not be configured.");
        }

        try
        {
            GeometryFactory gf = ctx.getBean(GeometryFactory.class);
            log.info("GeometryFactory found. SRID = {}", gf.getSRID());
        }
        catch (NoSuchBeanDefinitionException ex)
        {
            log.warn("GeometryFactory bean not found. POINT/Spatial operations may fail. Add GeometryConfig with a GeometryFactory bean.");
        }

        log.info("----------------------------------------------------------");
    }
}

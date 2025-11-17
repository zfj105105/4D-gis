package com.project.gis.config;

import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class GeometryConfig
{
    @Bean
    public GeometryFactory geometryFactory()
    {
        // SRID = 4326 → GPS 坐标系（WGS84）
        return new GeometryFactory(new PrecisionModel(), 4326);
    }
}

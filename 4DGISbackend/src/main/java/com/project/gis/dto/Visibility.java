package com.project.gis.dto;

import java.io.IOException;

/**
 * 标记可见性
 */
public enum Visibility {
    PRIVATE, PUBLIC, SHARED;

    public String toValue() {
        switch (this) {
            case PRIVATE:
                return "private";
            case PUBLIC:
                return "public";
            case SHARED:
                return "shared";
            default:
                return null;
        }
    }

    public static Visibility forValue(String value) throws IOException {
        if ("private".equals(value)) return PRIVATE;
        if ("public".equals(value)) return PUBLIC;
        if ("shared".equals(value)) return SHARED;
        throw new IOException("Cannot deserialize Visibility");
    }
}
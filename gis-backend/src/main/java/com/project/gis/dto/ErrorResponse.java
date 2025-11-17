package com.project.gis.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class ErrorResponse 
{
    private String code;
    private String message;
    private List<FieldErrorItem> details;

    @Data
    @AllArgsConstructor
    public static class FieldErrorItem
    {
        private String field;
        private String issue;
    }
}

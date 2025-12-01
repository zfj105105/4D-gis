package com.project.gis.dto;

import java.util.List;

/**
 * Standard error response used by APIs.
 */
@lombok.Data
public class ErrorResponse {
    /**
     * 业务错误码，便于前端处理
     */
    private String code;

    /**
     * 人类可读的错误信息
     */
    private String message;

    /**
     * 详细的验证错误列表，每项包含 field 与 issue
     */
    private List<Detail> details;

    public ErrorResponse() {
    }

    public ErrorResponse(String code, String message) {
        this.code = code;
        this.message = message;
    }

    public ErrorResponse(com.project.gis.error.ErrorCode errorCode, String message) {
        this.code = errorCode == null ? null : errorCode.name();
        this.message = message;
    }

    public static ErrorResponse validationError(String message, List<Detail> details) {
        ErrorResponse e = new ErrorResponse(com.project.gis.error.ErrorCode.VALIDATION_ERROR, message);
        e.setDetails(details);
        return e;
    }

    public static ErrorResponse of(com.project.gis.error.ErrorCode code, String message) {
        return new ErrorResponse(code, message);
    }
}
package com.project.gis.error;

/**
 * 集中定义后端使用的业务错误码（源自 OpenAPI 示例）。
 */
public enum ErrorCode {
  VALIDATION_ERROR,
  USER_ALREADY_EXISTS,
  INVALID_CREDENTIALS,
  UNAUTHENTICATED,
  FORBIDDEN,
  NOT_FOUND,
  INTERNAL_ERROR,
  ALREADY_FRIENDS
}

// 认证相关的类型定义

export interface RegisterRequest {
    username: string;
    email: string;
    phone: string;
    password: string;
}

export interface RegisterResponse {
    userId: string;
    message: string;
}

export interface LoginRequest {
    identity: string; // 手机号/用户名/邮箱
    password: string;
}

export interface LoginResponse {
    token: string;
    expiresIn: number;
    user: {
        userId: string;
        username: string;
    };
}

export interface ErrorResponse {
    code: string;
    message: string;
    details?: Array<{
        field: string;
        issue: string;
    }>;
}

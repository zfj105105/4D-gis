import apiClient from './api';
import { RegisterRequest, RegisterResponse, LoginRequest, LoginResponse } from './authTypes';

/**
 * 用户注册
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register', data);
    return response.data;
};

/**
 * 用户登录
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login', data);
    return response.data;
};

// 认证工具函数（非 API 调用）
export const authUtils = {
    /**
     * 登出（清除本地存储的 token）
     */
    logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    },

    /**
     * 保存登录信息到本地存储
     */
    saveAuthData: (loginResponse: LoginResponse) => {
        localStorage.setItem('token', loginResponse.token);
        localStorage.setItem('user', JSON.stringify(loginResponse.user));
    },

    /**
     * 获取当前用户信息
     */
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },

    /**
     * 检查是否已登录
     */
    isAuthenticated: (): boolean => {
        const token = localStorage.getItem('token');
        return !!token;
    }
};

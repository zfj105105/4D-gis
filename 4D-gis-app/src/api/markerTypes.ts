import apiClient from "./api";
import { DEFAULT_MARKER_TYPES } from '../utils/defaultMarkerTypes';

export const fetchMarkerTypes = async (): Promise<MarkerType[]> => {
    const response = await apiClient.get<MarkerType[]>('/marker-types');
    return response.data || [];
};


/**
 * 增强版的fetchMarkerTypes，支持离线/API失败时使用预设类别
 * 优先使用云端数据，失败时自动降级到本地预设类别
 */
export const fetchMarkerTypesWithFallback = async (): Promise<MarkerType[]> => {
    try {
        // 尝试从云端获取
        const response = await apiClient.get<MarkerType[]>('/marker-types');
        const cloudTypes = response.data || [];

        // 如果云端有数据，使用云端数据
        if (cloudTypes.length > 0) {
            return cloudTypes;
        }

        // 云端没有数据，使用预设类别
        console.log('云端类别为空，使用本地预设类别');
        return DEFAULT_MARKER_TYPES;
    } catch (error) {
        // API调用失败（离线或网络错误），使用预设类别
        console.log('获取云端类别失败，使用本地预设类别:', error);
        return DEFAULT_MARKER_TYPES;
    }
}

/**
 * MarkerType，标记类型模板
 */
export interface MarkerType {
    color?: string;
    icon?: string;
    name?: string;
    typeId?: string;
    [property: string]: any;
}

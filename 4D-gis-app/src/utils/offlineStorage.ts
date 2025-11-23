// 离线标记存储管理
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { MarkerCreateRequest } from '../api/marker';

const OFFLINE_MARKERS_KEY = 'offline_markers';

export interface OfflineMarker extends MarkerCreateRequest {
    localId: string;
    createdAt: Date;
}

// 检查是否在移动端
export const isMobile = () => {
    return Capacitor.isNativePlatform();
};

// 获取所有离线标记
export const getOfflineMarkers = async (): Promise<OfflineMarker[]> => {
    if (!isMobile()) {
        return [];
    }

    try {
        const { value } = await Preferences.get({ key: OFFLINE_MARKERS_KEY });
        if (!value) {
            return [];
        }

        const markers = JSON.parse(value);
        // 转换日期字符串回Date对象
        return markers.map((marker: any) => ({
            ...marker,
            createdAt: new Date(marker.createdAt),
            time_start: new Date(marker.time_start),
            time_end: marker.time_end ? new Date(marker.time_end) : undefined,
        }));
    } catch (error) {
        console.error('获取离线标记失败:', error);
        return [];
    }
};

// 保存离线标记
export const saveOfflineMarker = async (markerData: MarkerCreateRequest): Promise<OfflineMarker> => {
    if (!isMobile()) {
        throw new Error('离线存储仅在移动端可用');
    }

    const offlineMarker: OfflineMarker = {
        ...markerData,
        localId: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date(),
    };

    const existingMarkers = await getOfflineMarkers();
    const updatedMarkers = [...existingMarkers, offlineMarker];

    await Preferences.set({
        key: OFFLINE_MARKERS_KEY,
        value: JSON.stringify(updatedMarkers),
    });

    return offlineMarker;
};

// 删除已上传的离线标记
export const removeOfflineMarker = async (localId: string): Promise<void> => {
    if (!isMobile()) {
        return;
    }

    const existingMarkers = await getOfflineMarkers();
    const updatedMarkers = existingMarkers.filter(marker => marker.localId !== localId);

    await Preferences.set({
        key: OFFLINE_MARKERS_KEY,
        value: JSON.stringify(updatedMarkers),
    });
};

// 清空所有离线标记
export const clearOfflineMarkers = async (): Promise<void> => {
    if (!isMobile()) {
        return;
    }

    await Preferences.remove({ key: OFFLINE_MARKERS_KEY });
};

// 批量删除多个离线标记
export const removeMultipleOfflineMarkers = async (localIds: string[]): Promise<void> => {
    if (!isMobile()) {
        return;
    }

    const existingMarkers = await getOfflineMarkers();
    const updatedMarkers = existingMarkers.filter(marker => !localIds.includes(marker.localId));

    await Preferences.set({
        key: OFFLINE_MARKERS_KEY,
        value: JSON.stringify(updatedMarkers),
    });
};

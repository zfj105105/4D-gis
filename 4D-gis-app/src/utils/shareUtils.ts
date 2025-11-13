import type {Marker} from '../api/marker';

/**
 * 从URL参数中解析分享的标记数据
 */
export function parseSharedMarkerFromUrl(): Marker | null {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const sharedData = urlParams.get('shared');

        if (!sharedData) {
            return null;
        }

        // 使用正确的UTF-8解码方法处理中文字符
        const decodedData = decodeURIComponent(escape(atob(sharedData)));
        const markerData = JSON.parse(decodedData);

        // 转换时间字符串为Date对象
        return {
            ...markerData,
            time_start: new Date(markerData.time_start),
            time_end: markerData.time_end ? new Date(markerData.time_end) : undefined,
            createdAt: markerData.createdAt ? new Date(markerData.createdAt) : undefined,
            updatedAt: markerData.updatedAt ? new Date(markerData.updatedAt) : undefined,
        } as Marker;
    } catch (error) {
        console.error('解析分享标记失败:', error);
        return null;
    }
}

/**
 * 清除URL中的分享参数
 */
export function clearSharedMarkerFromUrl() {
    const url = new URL(window.location.href);
    url.searchParams.delete('shared');
    window.history.replaceState({}, '', url.toString());
}

/**
 * 检查当前URL是否包含分享的标记
 */
export function hasSharedMarker(): boolean {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.has('shared');
}

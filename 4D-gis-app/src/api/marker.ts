import apiClient from "./api";

export const fetchMarkers = async (): Promise<Marker[]> => {
    const response = await apiClient.get<MarkerResponse>('/markers');
    const result = response.data;

    return (result.data || []).map(marker => ({
        ...marker,
        time_start: new Date(marker.time_start),
        time_end: marker.time_end ? new Date(marker.time_end) : undefined,
        createdAt: marker.createdAt ? new Date(marker.createdAt) : undefined,
        updatedAt: marker.updatedAt ? new Date(marker.updatedAt) : undefined,
    }));
};

export interface MarkerResponse {
    data?: Marker[];
    total?: number;
    [property: string]: any;
}

/**
 * Marker，4D 标记点核心数据模型
 */
export interface Marker {
    altitude?: number;
    createdAt?: Date;
    createdBy?: CreatedBy;
    description?: string;
    id: string;
    latitude: number;
    longitude: number;
    time_end?: Date;
    time_start: Date;
    title: string;
    type?: MarkerType;
    updatedAt?: Date;
    visibility?: Visibility;
    [property: string]: any;
}

/**
 * 创建者
 */
export interface CreatedBy {
    userId?: string;
    username?: string;
    [property: string]: any;
}

/**
 * 标记类型
 */
export interface MarkerType {
    color?: string; // CSS 颜色值，例如 '#FF0000'
    icon?: string;
    name?: string;
    typeId?: string;
    [property: string]: any;
}

/**
 * 标记可见性
 */
export enum Visibility {
    Friend = 'friend',
    Private = 'private',
    Public = 'public',
}


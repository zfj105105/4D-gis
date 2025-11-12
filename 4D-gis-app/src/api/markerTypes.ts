import apiClient from "./api";

export const fetchMarkerTypes = async (): Promise<MarkerType[]> => {
    const response = await apiClient.get<MarkerType[]>('/marker-types');
    return response.data || [];
};


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


export interface MarkerData {
    /**
     * 标记的唯一标识符。
     */
    id: string;

    /**
     * 标记所在的地理纬度。
     */
    latitude: number;

    /**
     * 标记所在的地理经度。
     */
    longitude: number;

    /**
     * 标记点的标题。
     */
    title: string;

    /**
     * 可选的详细描述信息。
     */
    description?: string;

    /**
     * 可选的海拔高度（单位：米）。
     */
    altitude?: number;

    /**
     * 起始时间。
     */
    startTime?: Date;

    /**
     * 可选的结束时间。
     */
    endTime?: Date;
}

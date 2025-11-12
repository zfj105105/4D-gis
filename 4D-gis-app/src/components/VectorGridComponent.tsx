// src/components/VectorGridComponent.tsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
// @ts-ignore
import vectorTileLayer from 'leaflet-vector-tile-layer';
import '@mapbox/vector-tile';
import 'pbf';

let hasLoggedTransportProperties = false;

interface VectorGridProps {
    url: string;
}

type PathOptions = L.PathOptions;

type StyleFunction = (
    feature: any,
    layerName: string,
    zoom: number
) => PathOptions;


export function VectorGridComponent({ url }: VectorGridProps) {
    const map = useMap();

    useEffect(() => {
        hasLoggedTransportProperties = false;
    }, [url]);

    useEffect(() => {
        if (!map) return;

        const styleFn: StyleFunction = (feature, layerName, zoom) => {

            const properties = feature.properties;

            switch (layerName) {
                // --- 1. 水域 (无变化) ---
                case 'water':
                case 'waterway':
                    return {
                        fill: true,
                        fillColor: '#a0cffc',
                        stroke: false,
                    };

                // --- 2. 土地利用 (无变化) ---
                case 'landuse': {
                    const style: PathOptions = { fill: true, stroke: false, fillOpacity: 0.7 };
                    switch (properties.class) {
                        case 'park': case 'grass': case 'meadow':
                            style.fillColor = '#d8e8c8'; break;
                        case 'wood': case 'forest':
                            style.fillColor = '#b0d3b0'; break;
                        case 'residential':
                            style.fillColor = '#eaeaea'; break;
                        default:
                            style.fillColor = '#f2f2f2';
                    }
                    return style;
                }

                // --- 3. 建筑物 ( [!!] 更改 ) ---
                case 'building': {
                    // 之前是 > 14，现在我们让它在 13 级以上（即 13 和 14）显示
                    if (zoom > 13) {
                        return {
                            fill: true,
                            fillColor: '#d9d3c1',
                            fillOpacity: 0.8,
                            stroke: true,
                            color: '#c0b8a3',
                            weight: 1
                        };
                    }
                    return { stroke: false, fill: false }; // 低级别隐藏
                }

                // --- 4. 道路 ( [!!] 更改 ) ---
                case 'transportation': {
                    if (!hasLoggedTransportProperties && zoom > 13) { // 只在高级别记录一次
                        console.log('--- L.VT: 侦测到 "transportation" 属性 ---');
                        console.log(properties);
                        hasLoggedTransportProperties = true;
                    }

                    const style: PathOptions = { stroke: true, fill: false };

                    // 颜色逻辑不变
                    switch (properties.class) {
                        case 'motorway': style.color = '#e79a9a'; break;
                        case 'primary': style.color = '#fcd98c'; break;
                        case 'secondary': case 'tertiary':
                            style.color = '#d9d9d9'; break;
                        default: style.color = '#ffffff';
                    }

                    // [!!] 更改：重新调整 10-14 级的粗细
                    let weight = 1;
                    if (zoom >= 14) { // 14 级 (最粗)
                        if (properties.class === 'motorway') weight = 3;
                        else if (properties.class === 'primary') weight = 2.5;
                        else if (properties.class === 'secondary') weight = 2;
                        else weight = 1.5; // 街道也变粗
                    } else if (zoom >= 12) { // 12-13 级 (中等)
                        if (properties.class === 'motorway') weight = 2;
                        else if (properties.class === 'primary') weight = 1.5;
                        else if (properties.class === 'secondary') weight = 1.5;
                    } else if (zoom >= 10) { // 10-11 级 (较细)
                        if (properties.class === 'motorway') weight = 1.5;
                        else if (properties.class === 'primary') weight = 1;
                    }
                    style.weight = weight;

                    // 隐藏逻辑不变 (这对于 10-12 级仍然重要)
                    if (zoom < 12 && (properties.class === 'street' || properties.class === 'path')) {
                        return { stroke: false, fill: false };
                    }
                    if (zoom < 10 && (properties.class === 'secondary' || properties.class === 'tertiary')) {
                        return { stroke: false, fill: false };
                    }
                    return style;
                }

                // --- 5. 边界 (无变化) ---
                case 'boundary':
                    return {
                        color: '#999',
                        weight: 1,
                        dashArray: '3, 2'
                    };

                default:
                    return { stroke: false, fill: false };
            }
        };

        const vectorTile = vectorTileLayer(url, {

            style: styleFn,
            maxDetailZoom: 14,

        });

        vectorTile.addTo(map);

        return () => {
            map.removeLayer(vectorTile);
        };
    }, [map, url]);

    return null;
}
// MapLibre
export const osmStyle = {
    version: 8,
    sources: {
        'osm-raster-tiles-proxy': {
            type: 'raster',
            tiles: [
                'https://xyz.sayaz.site/tile/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors via Proxy',
        }
    },
    layers: [
        {
            id: 'osm-raster-layer-proxy',
            type: 'raster',
            source: 'osm-raster-tiles-proxy',
            minzoom: 0,
            maxzoom: 19
        }
    ]
};

export const offlineStyle = {
    version: 8,
    "sprite": "asset://styles/sprite",
    "sources": {
        "openmaptiles": {
            "type": "vector",
            // 关键：URL 指向您在 App 中打包的 mbtiles 文件
            "url": "mbtiles://tile/china-vector.mbtiles"
        }
    },
};


// React Leaflet
export const osmTileUrlProxy = 'https://xyz.sayaz.site/tile/{z}/{x}/{y}.png';
export const osmAttributionProxy = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors via Proxy';
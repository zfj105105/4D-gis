// MapLibre
export const osmRasterStyleViaProxy = {
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

export const offlineMapStyle = {
    version: 8,
    sources: {},
    layers: [
        {
            id: 'background',
            type: 'background',
            paint: {
                'background-color': '#f0f0f0' // A light gray background
            }
        }
    ]
};

// React Leaflet
export const osmTileUrlProxy = 'https://xyz.sayaz.site/tile/{z}/{x}/{y}.png';
export const osmAttributionProxy = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors via Proxy';
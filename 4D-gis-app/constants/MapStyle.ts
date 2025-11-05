// MapLibre
export const getStyle = () => ({
    ...require('@/assets/styles/style-local.json'),
});


// React Leaflet
export const osmTileUrlProxy = 'https://xyz.sayaz.site/tile/{z}/{x}/{y}.png';
export const osmAttributionProxy = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors via Proxy';
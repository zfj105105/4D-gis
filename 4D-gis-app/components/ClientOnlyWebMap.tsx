import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLngExpression } from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: icon2x,
    iconUrl: icon,
    shadowUrl: iconShadow,
});


// 地图视图更新组件
function ChangeMapView({ center }: { center: LatLngExpression }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}

// 定义此组件接收的 props
type LocationState = { lat: number; lng: number; alt: number | null; }
type Props = { location: LocationState; }

// 这是我们的客户端地图组件
export default function ClientOnlyWebMap({ location }: Props) {
    const position: LatLngExpression = [location.lat, location.lng];

    return (
        <div style={styles.container}>
            <MapContainer center={position} zoom={15} style={styles.map}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        您的当前位置 <br />
                        高度: {location.alt ? `${location.alt.toFixed(2)} 米` : 'N/A'}
                    </Popup>
                </Marker>
                <ChangeMapView center={position} />
            </MapContainer>

            <div style={styles.infoBox}>
                <p style={styles.infoText}>--- GPS 可行性验证 (Web) ---</p>
                <p style={styles.infoText}>经度: {location.lng.toFixed(6)}</p>
                <p style={styles.infoText}>纬度: {location.lat.toFixed(6)}</p>
                <p style={styles.infoText}>
                    高度 (Altitude): {location.alt ? `${location.alt.toFixed(2)} 米` : '未提供'}
                </p>
            </div>
        </div>
    );
}

// --- 样式表 ---
const styles: { [key: string]: React.CSSProperties } = {
    container: { width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    map: { width: '100%', height: '100%' },
    infoBox: { position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', backgroundColor: 'rgba(255, 255, 255, 0.9)', padding: '10px 15px', borderRadius: '10px', border: '1px solid #ccc', zIndex: 1000, minWidth: '300px' },
    infoText: { fontSize: '14px', fontWeight: 'bold', textAlign: 'center', margin: '4px 0' },
};
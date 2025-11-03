import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LatLngExpression } from 'leaflet';
import { CompatibleLocationObject } from '@/hooks/useUserLocation.web';


function ChangeMapView({ center }: { center: LatLngExpression }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
}


type MyMapViewProps = {
    location: CompatibleLocationObject;
}

export default function MyMapView({ location }: MyMapViewProps) {
    const position: LatLngExpression = [location.coords.latitude, location.coords.longitude];
    const altitude = location.coords.altitude;

    return (
        <div style={styles.container}>
            <MapContainer center={position} zoom={15} style={styles.map}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://xyz.sayaz.site/tile/{z}/{x}/{y}.png"
                />
                <Marker position={position}>
                    <Popup>
                        您的当前位置 <br />
                        高度: {altitude ? `${altitude.toFixed(2)} 米` : 'N/A'}
                    </Popup>
                </Marker>
                <ChangeMapView center={position} />
            </MapContainer>
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: { width: '100vw', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    map: { width: '100%', height: '100%' },
};
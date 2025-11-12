// typescript
import React, {useEffect, useState} from 'react';
import {Geolocation} from '@capacitor/geolocation'; // <-- [新增] 导入 Capacitor 插件
import {MapPin, Navigation, Plus, User} from 'lucide-react';
import {Button} from './ui/button';
import type {Marker as MarkerType} from '../api/marker';
import {MapContainer, Marker, TileLayer, useMap} from 'react-leaflet';
import L from 'leaflet';
import ReactDOMServer from 'react-dom/server';
import {VectorGridComponent} from './VectorGridComponent';
import {useNetworkStatus} from '../hooks/useNetworkStatus'

L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

const ONLINE_URL = "https://xyz.sayaz.site/tile/{z}/{x}/{y}.png";
const ONLINE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
const OFFLINE_URL = "tile/{z}/{x}/{y}.pbf";

const CustomMarkerIcon = ({color}: { color: string }) => (
    <div className="relative">
        <div
            style={{backgroundColor: color}}
            className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white transition-transform group-hover:scale-110"
        >
            <MapPin className="h-5 w-5 text-white"/>
        </div>
        <div style={{backgroundColor: color}} className="absolute inset-0 rounded-full animate-ping opacity-50"/>
    </div>
);

const CustomZoomControl = ({map}: { map: L.Map | null }) => {
    return (
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-50">
            <Button size="icon" variant="secondary" className="h-10 w-10 shadow-md" onClick={() => map?.zoomIn()}>
                <span className="text-lg">+</span>
            </Button>
            <Button size="icon" variant="secondary" className="h-10 w-10 shadow-md" onClick={() => map?.zoomOut()}>
                <span className="text-lg">−</span>
            </Button>
        </div>
    );
};

const UserLocationIcon = () => (
    <div className="relative">
        <div
            className="h-10 w-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white bg-blue-500 transition-transform group-hover:scale-110">
            <User className="h-5 w-5 text-white"/>
        </div>
        <div className="absolute inset-0 rounded-full animate-pulse bg-blue-400 opacity-30"/>
        <div className="absolute -inset-2 rounded-full border-2 border-blue-500 opacity-50 animate-ping"/>
    </div>
);

const SetMap = ({setMap}: { setMap: React.Dispatch<React.SetStateAction<L.Map | null>> }) => {
    const map = useMap();
    useEffect(() => {
        setMap(map);
    }, [map, setMap]);
    return null;
};

interface MapViewProps {
    markers: MarkerType[],
    onMarkerClick: (marker: MarkerType) => void,
    currentTime: Date,
    activeFilters: string[],
    showBasemap?: boolean,
    showMarkers?: boolean,
    onCreateMarker?: (position: [number, number, number?]) => void,
}

export function MapView({
                            markers,
                            onMarkerClick,
                            currentTime,
                            activeFilters,
                            showBasemap,
                            showMarkers,
                            onCreateMarker
                        }: MapViewProps) {
    const [map, setMap] = useState<L.Map | null>(null);
    const [isLocating, setIsLocating] = useState(false);
    const [userLocation, setUserLocation] = useState<[number, number, number?] | null>(null);

    const {isOnline} = useNetworkStatus();

    const visibleMarkers = markers.filter(marker => {
        const timeMatch = marker.time_start <= currentTime &&
            (!marker.time_end || marker.time_end >= currentTime);

        const categoryName = marker.type?.name || 'Uncategorized';
        const filterMatch = activeFilters.length === 0 || activeFilters.includes(categoryName);

        return timeMatch && filterMatch;
    });

    const getColorForMarker = (marker: MarkerType) => {
        return marker.type?.color ?? '#6b7280';
    };

    const mapCenter: [number, number] = [0, 0];

    const getUserLocation = async () => {
        setIsLocating(true);
        try {
            let permStatus = await Geolocation.checkPermissions();
            if (permStatus.location !== 'granted') {
                const permissionResult = await Geolocation.requestPermissions();
                if (permissionResult.location !== 'granted') {
                    // 用户拒绝了
                    console.error('用户拒绝了定位权限');
                    alert('您需要开启定位权限才能使用此功能。');
                    return; // 提前退出
                }
            }

            // 获取当前位置
            const position = await Geolocation.getCurrentPosition({
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 300000 // 5分钟缓存
            });

            const {latitude, longitude, altitude} = position.coords;
            const location: [number, number, number?] = [latitude, longitude, altitude ?? undefined];
            setUserLocation(location);

            if (map) {
                map.setView(location, 13);
            }

        } catch (error) {
            console.error('获取位置失败:', error);
            const errorMsg = String(error);
            if (errorMsg.includes('Location services are not enabled') || errorMsg.includes('位置服务未启用')) {
                alert('无法获取您的位置，请确保您的设备已开启 GPS。');
            } else {
                alert('无法获取您的位置，请检查位置权限设置。');
            }
        } finally {
            setIsLocating(false);
        }
    };

    const handleCreateMarkerClick = () => {
        let defaultPosition: [number, number, number?];
        if (userLocation) {
            defaultPosition = userLocation;
        } else if (map) {
            const center = map.getCenter();
            defaultPosition = [center.lat, center.lng, undefined];
        } else {
            defaultPosition = [0, 0, undefined];
        }
        onCreateMarker?.(defaultPosition);
    };


    useEffect(() => {
        getUserLocation();
    }, []);

    return (
        <div className="w-full h-full relative bg-slate-100">
            <MapContainer
                center={mapCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="w-full h-full z-0"
                style={{zIndex: 0}}
                zoomControl={false}
            >
                {showBasemap && (
                    isOnline ? (
                        <TileLayer
                            key="online-raster"
                            url={ONLINE_URL}
                            attribution={ONLINE_ATTRIBUTION}
                        />
                    ) : (
                        <VectorGridComponent
                            key="offline-vector"
                            url={OFFLINE_URL}
                        />
                    )
                )}

                {showMarkers && visibleMarkers.map(marker => {
                    const color = getColorForMarker(marker);
                    const iconHtml = ReactDOMServer.renderToString(
                        <CustomMarkerIcon color={color}/>
                    );

                    const customIcon = L.divIcon({
                        html: iconHtml,
                        className: 'leaflet-custom-icon',
                        iconSize: [40, 40],
                        iconAnchor: [20, 40],
                        popupAnchor: [0, -40]
                    });

                    return (
                        <Marker
                            key={marker.id}
                            position={[marker.latitude, marker.longitude]}
                            icon={customIcon}
                            eventHandlers={{
                                click: () => {
                                    onMarkerClick(marker);
                                },
                            }}
                        >
                        </Marker>
                    );
                })}

                {userLocation && (
                    <Marker
                        position={[userLocation[0], userLocation[1]]} // 只使用经纬度
                        icon={L.divIcon({
                            html: ReactDOMServer.renderToString(<UserLocationIcon/>),
                            className: 'leaflet-user-location-icon',
                            iconSize: [40, 40],
                            iconAnchor: [20, 20],
                            popupAnchor: [0, -20]
                        })}
                    >
                    </Marker>
                )}

                <SetMap setMap={setMap}/>


            </MapContainer>

            <CustomZoomControl map={map}/>

            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                <p className="text-xs text-muted-foreground">Interactive Map View</p>
            </div>


            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                <Button
                    size="icon"
                    variant="default"
                    className="h-12 w-12 shadow-md rounded-full bg-green-500 hover:bg-green-600"
                    onClick={handleCreateMarkerClick}
                >
                    <Plus className="h-5 w-5"/>
                </Button>
                <Button
                    size="icon"
                    variant="secondary"
                    className="h-12 w-12 shadow-md rounded-full"
                    onClick={getUserLocation}
                    disabled={isLocating}
                >
                    <Navigation className={`h-5 w-5 ${isLocating ? 'animate-spin' : ''}`}/>
                </Button>
            </div>

            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-sm">
                <p className="text-xs text-muted-foreground">
                    {showMarkers ? `Showing ${visibleMarkers.length} of ${markers.length} markers` : 'Markers hidden'}
                    {!showBasemap && ' • Basemap hidden'}
                    {userLocation && ' • 已定位'}
                </p>
            </div>
        </div>
    );
}
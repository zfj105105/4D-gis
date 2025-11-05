import { useState, useEffect } from 'react';
import {LocationData} from "@/types/location";

export function useUserLocation() {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!navigator.geolocation) {
            setErrorMsg('抱歉，您的浏览器不支持GPS地理定位。');
            setIsLoading(false);
            return;
        }

        console.log('正在请求位置权限 (Web)...');

        navigator.geolocation.getCurrentPosition(
            (position: GeolocationPosition) => {
                console.log('获取到位置 (Web):', position);
                setLocation({
                    coords: {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        altitude: position.coords.altitude,
                        accuracy: position.coords.accuracy,
                        altitudeAccuracy: position.coords.altitudeAccuracy,
                        heading: position.coords.heading,
                        speed: position.coords.speed,
                    },
                    timestamp: position.timestamp,
                });
                setIsLoading(false);
            },
            (error: GeolocationPositionError) => {
                console.error('获取位置失败 (Web):', error);
                let msg = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        msg = '用户拒绝了位置请求。请检查浏览器站点设置 (必须为 HTTPS)。';
                        break;
                }
                setErrorMsg(msg);
                setIsLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    return { location, errorMsg, isLoading };
}
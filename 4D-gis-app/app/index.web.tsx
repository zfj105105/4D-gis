import React, { useState, useEffect, Suspense, lazy } from 'react';

const ClientOnlyWebMap = lazy(() => import('../components/ClientOnlyWebMap'));

type LocationState = { lat: number; lng: number; alt: number | null; }

export default function App() {
    const [location, setLocation] = useState<LocationState | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // 1. 标记我们现在在客户端
        setIsClient(true);

        // 2. 开始GPS逻辑
        if (!navigator.geolocation) {
            setErrorMsg('抱歉，您的浏览器不支持GPS地理定位。');
            return;
        }

        console.log('正在请求位置权限...');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude, altitude } = position.coords;
                setLocation({
                    lat: latitude,
                    lng: longitude,
                    alt: altitude,
                });
            },
            (error) => {
                let msg = '';
                switch (error.code) {
                    case error.PERMISSION_DENIED: msg = '用户拒绝了位置请求。'; break;
                    case error.POSITION_UNAVAILABLE: msg = '位置信息不可用。'; break;
                    case error.TIMEOUT: msg = '获取位置信息超时。'; break;
                    default: msg = '获取位置时发生未知错误。'; break;
                }
                setErrorMsg(msg);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    if (!isClient) {
        return <div style={styles.container}><p>Loading Map...</p></div>;
    }

    if (errorMsg) {
        return <div style={styles.container}><p style={styles.errorText}>{errorMsg}</p></div>;
    }

    if (!location) {
        return <div style={styles.container}><p>正在获取您的GPS位置...</p></div>;
    }

    return (
        <Suspense fallback={<div style={styles.container}><p>Loading Map Component...</p></div>}>
            <ClientOnlyWebMap location={location} />
        </Suspense>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    errorText: {
        color: 'red',
        padding: '20px',
        fontSize: '16px',
        textAlign: 'center',
    },
};
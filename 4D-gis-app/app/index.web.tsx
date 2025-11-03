import React, { Suspense, lazy } from 'react';
import { useUserLocation } from '@/hooks/useUserLocation.web';
import {LocationInfoBox} from "@/components/map/LocationInfoBox";

const CustomMapView = lazy(() => import('../components/map/CustomMapView.web'));

export default function App() {
    const { location, errorMsg, isLoading } = useUserLocation();

    // 加载状态
    if (isLoading) {
        return (
            <div style={styles.container}>
                <p style={styles.text}>正在获取您的GPS位置...</p>
            </div>
        );
    }

    if (errorMsg) {
        return (
            <div style={styles.container}>
                <p style={styles.errorText}>{errorMsg}</p>
            </div>
        );
    }

    if (location) {
        return (
            <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
                <Suspense fallback={<div style={styles.container}>
                    <p style={styles.text}>Loading Map Component...</p>
                </div>}>
                    <CustomMapView location={location}/>
                </Suspense>
                <LocationInfoBox location={location}/>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <p style={styles.text}>正在初始化...</p>
        </div>
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
        fontFamily: 'sans-serif',
    },
    text: {
        fontSize: '16px',
        textAlign: 'center',
    },
    errorText: {
        color: 'red',
        padding: '20px',
        fontSize: '16px',
        textAlign: 'center',
    },
};

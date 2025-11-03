import React from 'react';
import { CompatibleLocationObject } from '@/hooks/useUserLocation.web';

export const LocationInfoBox = ({ location }: { location: CompatibleLocationObject | null }) => {
    const coords = location?.coords;
    const altitude = coords?.altitude;

    return (
        <div style={styles.infoBox}>
            <p style={styles.infoTitle}>当前位置</p>
            <p style={styles.infoText}>
                经度: {coords ? coords.longitude.toFixed(6) : '加载中...'}
            </p>
            <p style={styles.infoText}>
                纬度: {coords ? coords.latitude.toFixed(6) : '加载中...'}
            </p>
            <p style={styles.infoText}>
                高度: {altitude !== null && altitude !== undefined ? `${altitude.toFixed(2)} m` : (coords ? 'N/A' : '加载中...')}
            </p>
        </div>
    );
};

const styles: { [key: string]: React.CSSProperties } = {
    infoBox: {
        position: 'absolute',
        bottom: '10%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 20px)',
        maxWidth: '400px',
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #ccc',
        zIndex: 1000,
        fontFamily: 'sans-serif',
        boxSizing: 'border-box',
    },
    infoTitle: {
        fontWeight: '700',
        marginBottom: '6px',
        fontSize: '14px',
        margin: 0,
    },
    infoText: {
        fontSize: '13px',
        marginBottom: '2px',
        margin: 0,
    },
};

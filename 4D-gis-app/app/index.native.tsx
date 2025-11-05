import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';

import { useUserLocation } from '@/hooks/useUserLocation.native';
import { LocationInfoBox } from '@/components/map/LocationInfoBox';
import { CustomMapView } from '@/components/map/CustomMapView.native';

export default function App() {
    const { location, errorMsg, isLoading } = useUserLocation();

    if (errorMsg) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>{errorMsg}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <CustomMapView location={location} />
            <LocationInfoBox location={location} />
            {/* 当位置信息仍在加载时，显示全屏遮罩 */}
            {isLoading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator size="large" color="#0000ff" />
                    <Text>正在获取 GPS 位置...</Text>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    errorText: {
        padding: 20,
        fontSize: 16,
        textAlign: 'center',
        color: 'red',
        marginTop: 50,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
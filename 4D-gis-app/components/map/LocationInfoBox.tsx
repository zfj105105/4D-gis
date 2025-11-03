import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LocationObject } from 'expo-location'; // 确保导入类型

export const LocationInfoBox = ({ location }: { location: LocationObject | any | null }) => {
    const coords = location?.coords;
    const altitude = coords?.altitude;

    return (
        <View style={styles.infoBox}>
            <Text style={styles.infoTitle}>当前位置</Text>
            <Text style={styles.infoText}>
                经度: {coords ? coords.longitude.toFixed(6) : '加载中...'}
            </Text>
            <Text style={styles.infoText}>
                纬度: {coords ? coords.latitude.toFixed(6) : '加载中...'}
            </Text>
            <Text style={styles.infoText}>
                高度: {altitude !== null && altitude !== undefined ? `${altitude.toFixed(2)} m` : (coords ? 'N/A' : '加载中...')}
            </Text>
        </View>
    );
};


const styles = StyleSheet.create({
    infoBox: {
        position: 'absolute',
        bottom: 40,
        left: 10,
        right: 10,
        backgroundColor: 'rgba(255,255,255,0.9)',
        padding: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#ccc',
        alignItems: 'flex-start',
    },
    infoTitle: {
        fontWeight: '700',
        marginBottom: 6,
        fontSize: 14,
    },
    infoText: {
        fontSize: 13,
        marginBottom: 2,
    },
});
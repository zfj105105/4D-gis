import React, {useEffect, useState} from 'react';
import {Alert, StyleSheet, View, Text} from 'react-native';
import {Camera, MapView, UserLocation} from '@maplibre/maplibre-react-native';
import * as Location from 'expo-location';
import {LocationObject} from "expo-location";


// 定义基础的 OSM 栅格瓦片样式
const osmRasterStyle = {
    version: 8,
    sources: {
        'osm-raster-tiles': { // Source ID
            type: 'raster',
            tiles: [
                'https://xyz.sayaz.site/tile/{z}/{x}/{y}.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }
    },
    layers: [
        {
            id: 'osm-raster-layer', // Layer ID
            type: 'raster',
            source: 'osm-raster-tiles', // 引用 Source ID
            minzoom: 0,
            maxzoom: 19
        }
    ]
};





export default function App() {
    const [location, setLocation] = useState<LocationObject | null>(null);

    useEffect(() => {
        (async () => {
            console.log('正在请求位置权限...');
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('权限被拒绝', '无法获取位置权限。请在设置中允许本应用使用位置服务。');
                return;
            }

            console.log('权限已获取！正在获取当前位置...');
            try {
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.High, // 请求高精度
                });
                console.log('获取到位置:', currentLocation);
                setLocation(currentLocation);

            } catch (error) {
                console.error('获取位置失败:', error);
                Alert.alert('定位失败', '无法获取当前位置信息。');
            }
        })();
    }, []);


    return (
        <View style={styles.container}>
            <MapView
                style={styles.map}
                mapStyle={osmRasterStyle}
                logoEnabled={false} // 隐藏 Logo
                attributionEnabled={true} // 显示 OSM 版权信息
                attributionPosition={{ bottom: 8, right: 8 }}
            >
                <Camera
                    defaultSettings={{
                        centerCoordinate: [116.404, 39.915],
                        zoomLevel: 10, // 初始缩放级别
                    }}
                />
                <UserLocation/>
            </MapView>
            <View style={styles.infoBox}>
                <Text style={styles.infoTitle}>当前位置</Text>
                <Text style={styles.infoText}>
                    经度: {location ? location.coords.longitude.toFixed(6) : '加载中...'}
                </Text>
                <Text style={styles.infoText}>
                    纬度: {location ? location.coords.latitude.toFixed(6) : '加载中...'}
                </Text>
                <Text style={styles.infoText}>
                    高度: {location ? (location.coords.altitude !== null && location.coords.altitude !== undefined ? `${location.coords.altitude.toFixed(2)} m` : 'N/A') : '加载中...'}
                </Text>
            </View>
        </View>
    );
}

// 样式表
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    map: {
        flex: 1,
    },
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
    },
    infoText: {
        fontSize: 13,
        marginBottom: 2,
    }
});


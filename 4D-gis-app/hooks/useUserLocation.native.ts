import { useState, useEffect } from 'react';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import {LocationData} from "@/types/location"; // 导入 Toast

export function useUserLocation() {
    const [location, setLocation] = useState<LocationData | null>(null);

    useEffect(() => {
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                const msg = '无法获取位置权限。请在设置中允许本应用使用位置服务。';
                Toast.show({ type: 'error', text1: '权限被拒绝', text2: msg });
                return;
            }

            try {
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.BestForNavigation,
                });
                setLocation(currentLocation);
            } catch (error) {
                const msg = '无法获取当前位置信息。';
                Toast.show({ type: 'error', text1: '定位失败', text2: msg });
            }
        })();
    }, []);

    return location;
}

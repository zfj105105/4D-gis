import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { LocationObject } from 'expo-location';

export function useUserLocation() {
    const [location, setLocation] = useState<LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        (async () => {
            console.log('正在请求位置权限...');
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                const msg = '无法获取位置权限。请在设置中允许本应用使用位置服务。';
                Alert.alert('权限被拒绝', msg);
                setErrorMsg(msg);
                setIsLoading(false);
                return;
            }

            console.log('权限已获取！正在获取当前位置...');
            try {
                let currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.BestForNavigation,
                });
                console.log('获取到位置:', currentLocation);
                setLocation(currentLocation);
            } catch (error) {
                console.error('获取位置失败:', error);
                Alert.alert('定位失败', '无法获取当前位置信息。');
                setErrorMsg('获取位置信息失败。');
            } finally {
                setIsLoading(false);
            }
        })();
    }, []);

    return { location, errorMsg, isLoading };
}
// src/hooks/useNetworkStatus.ts
import { useState, useEffect } from 'react';
import { Network, ConnectionStatus } from '@capacitor/network';

export const useNetworkStatus = () => {
    const [isOnline, setIsOnline] = useState(true); // 默认假设在线

    useEffect(() => {
        let removeListener: (() => void) | undefined;
        const checkInitialStatus = async () => {
            const status = await Network.getStatus();
            setIsOnline(status.connected);
        };

        checkInitialStatus();

        Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
            setIsOnline(status.connected);
        }).then((handle) => {
            // 保存移除函数以便在 cleanup 中调用
            removeListener = () => {
                handle.remove();
            };
        }).catch((err) => {
            console.warn('Network.addListener failed:', err);
        });

        return () => {
            removeListener?.();
        };
    }, []);

    return { isOnline };
};
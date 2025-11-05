import { View, StyleSheet } from 'react-native';
import { Camera, MapView, UserLocation, Callout } from '@maplibre/maplibre-react-native';
import { getStyle } from '@/constants/MapStyle';
import {useUserLocation} from "@/hooks/useUserLocation.native";


const DEFAULT_MAP_CENTER = [116.404, 39.915];
const DEFAULT_MAP_ZOOM = 10;

export const CustomMapView = () => {
    const location = useUserLocation();

    return (
        <MapView
            style={styles.map}
            mapStyle={getStyle()}
            logoEnabled={false}
            attributionEnabled={true}
            attributionPosition={{ bottom: 8, right: 8 }}
        >
            <Camera
                defaultSettings={{
                    centerCoordinate: DEFAULT_MAP_CENTER,
                    zoomLevel: DEFAULT_MAP_ZOOM,
                }}
            />
            <UserLocation visible={!!location} showsUserHeadingIndicator={true} />
        </MapView>
    );
};

const styles = StyleSheet.create({
    map: {
        flex: 1,
    },
    offlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#e9e9e9',
    },
    offlineText: {
        color: '#333',
        fontSize: 16,
        fontWeight: 'bold',
    },
    markerContainer: {
        width: 30,
        height: 30,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 122, 255, 0.1)',
        borderRadius: 15,
    },
    markerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(0, 122, 255, 1)',
        borderColor: 'white',
        borderWidth: 1,
    }
});

import React from 'react';
import { StyleSheet, View} from 'react-native';

import { CustomMapView } from '@/components/map/CustomMapView.native';

export default function App() {
    return (
        <View style={styles.container}>
            <CustomMapView />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
import React from 'react';
import { StatusBar, StyleSheet, Text, View } from 'react-native';
import colors from '../../constants/colour';

export default function Profile() {
    return (
        <View style={styles.screen}>
            <StatusBar barStyle="dark-content" />
            <Text style={styles.text}>Profile screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    text: {
        color: colors.darkGray,
        fontSize: 16,
        fontWeight: '700',
    },
});


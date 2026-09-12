import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

export default function GameClue({ clue = 'One who participates in a game.' }) {
    return (
        <View style={styles.container}>
            <Text style={styles.clueText}>
                Clue: <Text style={styles.clueValue}>{clue}</Text>
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginVertical: 12,
    },
    clueText: {
        fontSize: 14,
        fontFamily: fonts.medium,
        fontWeight: '600',
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 20,
    },
    clueValue: {
        fontFamily: fonts.medium,
        color: colors.gray,
    },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

export default function LetterButtons({ letters = [], onSelectLetter }) {
    return (
        <View style={styles.gridContainer}>
            {letters.map((letterObj) => {
                const { id, char, isSelected } = letterObj;
                return (
                    <TouchableOpacity
                        key={id}
                        style={[
                            styles.letterTile,
                            isSelected && styles.letterTileDisabled,
                        ]}
                        activeOpacity={0.7}
                        disabled={isSelected}
                        onPress={() => onSelectLetter(letterObj)}
                    >
                        <Text style={[styles.letterText, isSelected && styles.letterTextDisabled]}>
                            {isSelected ? '' : char}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
        marginVertical: 16,
        gap: 12,
    },
    letterTile: {
        width: 62,
        height: 62,
        borderRadius: 18,
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: colors.grayLighter,
        shadowColor: colors.purplePlay || colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    letterTileDisabled: {
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        shadowOpacity: 0,
        elevation: 0,
    },
    letterText: {
        fontSize: 26,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.primary,
    },
    letterTextDisabled: {
        color: 'transparent',
    },
});

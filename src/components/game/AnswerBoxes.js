
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

export default function AnswerBoxes({ wordLength = 4, selectedLetters = [], onDeselectLetter }) {
    // Generate array of length wordLength dynamically
    const boxes = Array.from({ length: wordLength });

    // Dynamic sizing based on word length to fit all devices neatly
    const boxSize = wordLength >= 8
        ? { width: 34, height: 44, fontSize: 18, borderRadius: 10, gap: 4 }
        : wordLength >= 7
        ? { width: 38, height: 48, fontSize: 20, borderRadius: 11, gap: 5 }
        : wordLength >= 6
        ? { width: 44, height: 54, fontSize: 24, borderRadius: 12, gap: 6 }
        : wordLength === 5
        ? { width: 48, height: 58, fontSize: 26, borderRadius: 13, gap: 7 }
        : { width: 54, height: 62, fontSize: 28, borderRadius: 14, gap: 8 };

    return (
        <View style={[styles.container, { gap: boxSize.gap }]}>
            {boxes.map((_, index) => {
                const selected = selectedLetters[index]; // letter object or string if filled
                const isFilled = Boolean(selected);

                // Robust character extraction for both string and object shapes
                let charToDisplay = '';
                if (isFilled) {
                    if (typeof selected === 'object' && selected !== null) {
                        charToDisplay = selected.char || selected.letter || selected.value || '';
                    } else {
                        charToDisplay = String(selected);
                    }
                }

                return (
                    <TouchableOpacity
                        key={`answer_box_${index}`}
                        style={[
                            styles.box,
                            {
                                width: boxSize.width,
                                height: boxSize.height,
                                borderRadius: boxSize.borderRadius,
                            },
                            isFilled ? styles.boxFilled : styles.boxEmpty,
                        ]}
                        activeOpacity={0.7}
                        disabled={!isFilled}
                        onPress={() => isFilled && onDeselectLetter(index)}
                    >
                        <Text style={[styles.boxText, { fontSize: boxSize.fontSize }]}>
                            {charToDisplay}
                        </Text>
                        <View
                            style={[
                                styles.bottomLine,
                                isFilled ? styles.bottomLineFilled : styles.bottomLineEmpty,
                            ]}
                        />
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 20,
        gap: 8,
        paddingHorizontal: 16,
    },
    box: {
        width: 52,
        height: 60,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
    },
    boxFilled: {
        backgroundColor: colors.primaryLight,
        borderWidth: 1.5,
        borderColor: colors.indigoBorder || colors.primary,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 3,
    },
    boxEmpty: {
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.grayLighter,
    },
    boxText: {
        fontSize: 28,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.primary, // Vibrant primary indigo/purple letter matching screenshot
        zIndex: 2,
    },
    bottomLine: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 4,
        zIndex: 1,
    },
    bottomLineFilled: {
        backgroundColor: colors.primary, // Bold blue line indicator under letter
    },
    bottomLineEmpty: {
        backgroundColor: colors.grayLight, // Muted line indicator for empty box
    },
});

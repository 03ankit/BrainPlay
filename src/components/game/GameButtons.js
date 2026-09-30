import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

export default function GameButtons({
    onHint,
    onSubmit,
    isSubmitDisabled,
    isHintDisabled,
    hintsRemaining,
}) {
    return (
        <View style={styles.container}>
            {/* Hint Button */}
            <TouchableOpacity
                style={[
                    styles.hintButton,
                    isHintDisabled && styles.hintButtonDisabled,
                ]}
                activeOpacity={0.8}
                disabled={isHintDisabled}
                onPress={onHint}
            >
                <Text style={[styles.hintIcon, isHintDisabled && styles.hintIconDisabled]}>💡</Text>
                <Text style={[styles.hintText, isHintDisabled && styles.hintTextDisabled]}>
                    {hintsRemaining !== undefined ? `Hint (${hintsRemaining})` : 'Hint'}
                </Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity
                style={[
                    styles.submitButton,
                    isSubmitDisabled && styles.submitButtonDisabled,
                ]}
                activeOpacity={0.85}
                disabled={isSubmitDisabled}
                onPress={onSubmit}
            >
                <View style={styles.checkmarkCircle}>
                    <Text style={styles.checkmarkText}>✓</Text>
                </View>
                <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        marginVertical: 20,
        gap: 16,
    },
    hintButton: {
        flex: 1,
        height: 56,
        borderRadius: 22,
        backgroundColor: colors.white,
        borderWidth: 2,
        borderColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    hintButtonDisabled: {
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        shadowOpacity: 0,
        elevation: 0,
    },
    hintIcon: {
        fontSize: 18,
    },
    hintIconDisabled: {
        opacity: 0.4,
    },
    hintText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.primary,
    },
    hintTextDisabled: {
        color: '#94A3B8',
    },
    submitButton: {
        flex: 1,
        height: 56,
        borderRadius: 22,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    submitButtonDisabled: {
        backgroundColor: colors.gray,
        shadowOpacity: 0,
        elevation: 0,
    },
    checkmarkCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkmarkText: {
        color: colors.white,
        fontSize: 13,
        fontWeight: '900',
    },
    submitText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
});

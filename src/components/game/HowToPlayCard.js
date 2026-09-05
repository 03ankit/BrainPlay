import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts from '../../constants/fonts';

const HowToPlayCard = ({
    description = "Unscramble the letters as quickly as you can to reveal the hidden word. The faster you solve it, the higher your multiplier!",
    rules = [
        {
            id: '1',
            icon: '⏱',
            text: 'You have 60 seconds per round to solve as many words as possible.',
        },
        {
            id: '2',
            icon: '⚡',
            text: 'Earn combo points by unscrambling three words in a row without a mistake.',
        },
    ],
}) => {
    return (
        <View style={styles.outerContainer}>
            {/* Section Header */}
            <Text style={styles.sectionHeaderTitle}>How to Play</Text>

            {/* Main Rules Card */}
            <View style={styles.card}>
                <Text style={styles.descriptionText}>{description}</Text>

                {/* Rules Bullet Items */}
                <View style={styles.rulesList}>
                    {rules.map((rule) => (
                        <View key={rule.id} style={styles.ruleRow}>
                            <View style={styles.iconCircle}>
                                <Text style={styles.ruleIcon}>{rule.icon}</Text>
                            </View>
                            <Text style={styles.ruleText}>{rule.text}</Text>
                        </View>
                    ))}
                </View>
            </View>
        </View>
    );
};

export default HowToPlayCard;

const styles = StyleSheet.create({
    outerContainer: {
        width: '100%',
        marginVertical: 14,
    },
    sectionHeaderTitle: {
        fontSize: 22,
        fontFamily: fonts.bold,
        color: '#1E1B4B',
        marginBottom: 14,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 20,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    descriptionText: {
        fontSize: 15,
        fontFamily: fonts.regular,
        color: '#475569',
        lineHeight: 23,
        marginBottom: 20,
    },
    rulesList: {
        gap: 16,
    },
    ruleRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: '#F3E8FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    ruleIcon: {
        fontSize: 18,
    },
    ruleText: {
        flex: 1,
        fontSize: 14,
        fontFamily: fonts.regular,
        color: '#334155',
        lineHeight: 20,
    },
});

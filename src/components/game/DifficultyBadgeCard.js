import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts from '../../constants/fonts';

const DifficultyBadgeCard = ({
    level = 'Medium',
    currentLevel = 2,
    totalLevels = 3,
}) => {
    return (
        <View style={styles.container}>
            {/* Left Icon Container */}
            <View style={styles.leftSection}>
                <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>💡</Text>
                </View>
                <Text style={styles.difficultyText}>
                    Difficulty: <Text style={styles.levelText}>{level}</Text>
                </Text>
            </View>

            {/* Right Segmented Level Bars */}
            <View style={styles.levelBarsContainer}>
                {Array.from({ length: totalLevels }).map((_, index) => {
                    const isActive = index < currentLevel;
                    return (
                        <View
                            key={index}
                            style={[
                                styles.barSegment,
                                isActive ? styles.barActive : styles.barInactive,
                            ]}
                        />
                    );
                })}
            </View>
        </View>
    );
};

export default DifficultyBadgeCard;

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: '#F3E8FF',
        borderWidth: 1,
        borderColor: '#E9D5FF',
        borderRadius: 24,
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
    },
    leftSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    iconCircle: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: '#E9D5FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    iconEmoji: {
        fontSize: 18,
    },
    difficultyText: {
        fontSize: 15,
        fontFamily: fonts.medium,
        color: '#3B0764',
    },
    levelText: {
        fontFamily: fonts.bold,
        color: '#3B0764',
    },
    levelBarsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    barSegment: {
        width: 28,
        height: 8,
        borderRadius: 4,
    },
    barActive: {
        backgroundColor: '#7C3AED',
    },
    barInactive: {
        backgroundColor: '#E2E8F0',
    },
});

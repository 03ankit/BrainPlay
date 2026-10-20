import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts from '../../constants/fonts';

const DifficultyBadgeCard = ({
    level = 'Easy',
    currentLevel,
    totalLevels = 3,
}) => {
    // Format level display nicely (e.g. 'EASY' -> 'Easy', 'VERY HARD' -> 'Very Hard')
    const displayLevel = React.useMemo(() => {
        if (!level || typeof level !== 'string') return level || 'Easy';
        return level
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
            .join(' ');
    }, [level]);

    // Active bars (1 to 3) based on currentLevel or difficulty text
    const activeBars = React.useMemo(() => {
        if (typeof currentLevel === 'number') {
            return Math.min(Math.max(currentLevel, 1), totalLevels);
        }
        const norm = (level || '').toUpperCase();
        if (norm.includes('EASY') || norm.includes('NORMAL')) return 1;
        if (norm.includes('MED')) return 2;
        return 3;
    }, [currentLevel, level, totalLevels]);

    return (
        <View style={styles.container}>
            {/* Left Icon Container */}
            <View style={styles.leftSection}>
                <View style={styles.iconCircle}>
                    <Text style={styles.iconEmoji}>💡</Text>
                </View>
                <Text style={styles.difficultyText}>
                    Difficulty: <Text style={styles.levelText}>{displayLevel}</Text>
                </Text>
            </View>

            {/* Right Segmented Level Bars (3 boxes) */}
            <View style={styles.levelBarsContainer}>
                {Array.from({ length: totalLevels }).map((_, index) => {
                    const isActive = index < activeBars;
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
        width: 32,
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

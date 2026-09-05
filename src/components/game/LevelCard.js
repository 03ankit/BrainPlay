import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - (2 * 12)) / 3; // 3 columns, 20 padding each side, 12 gap

const LevelCard = ({ item }) => {

    if (item.isEmpty) {
        return <View style={{ width: cardWidth, height: 130 }} />;
    }

    const renderStars = () => {
        if (item.stars === 0) return null;
        return (
            <View style={styles.starsContainer}>
                <Text style={item.stars >= 1 ? styles.starFilled : styles.starOutline}>★</Text>
                <Text style={item.stars >= 2 ? styles.starFilled : styles.starOutline}>★</Text>
                <Text style={item.stars >= 3 ? styles.starFilled : styles.starOutline}>★</Text>
            </View>
        );
    };

    if (item.isCurrent) {
        return (
            <View style={[styles.card, styles.currentCard]}>
                <View style={styles.currentHeader}>
                    <View style={styles.currentLevelCircle}>
                        <Text style={styles.currentLevelNum}>{item.level}</Text>
                    </View>
                    <View style={styles.currentBadge}>
                        <Text style={styles.currentBadgeText}>{item.shortType.toUpperCase()}</Text>
                    </View>
                </View>
                <View style={styles.currentCenter}>
                    <View style={styles.playIconContainer}>
                        <Text style={styles.playIcon}>▶</Text>
                    </View>
                    <Text style={styles.currentTitle}>Prefixes</Text>
                    <View style={styles.playPill}>
                        <Text style={styles.playPillText}>PLAY</Text>
                    </View>
                </View>
            </View>
        );
    }

    if (item.isBoss) {
        return (
            <View style={[styles.card, styles.bossCard]}>
                <View style={styles.headerRow}>
                    <View style={styles.bossLevelCircle}>
                        <Text style={styles.bossLevelText}>{item.level}</Text>
                    </View>
                    <View style={styles.bossBadge}>
                        <Text style={styles.bossBadgeText}>{item.shortType}</Text>
                    </View>
                </View>
                <View style={styles.centerRow}>
                    <Text style={styles.crownEmoji}>👑</Text>
                    <Text style={styles.lockEmoji}>🔒</Text>
                </View>
                <Text style={styles.bossSubtitle}>{item.subtitle}</Text>
            </View>
        );
    }

    if (item.isLocked) {
        return (
            <View style={[styles.card, styles.lockedCard]}>
                <View style={styles.headerRow}>
                    <Text style={styles.lockedLevelText}>{item.level.toString().padStart(2, '0')}</Text>
                    <Text style={styles.lockedBadgeText}>{item.shortType}</Text>
                </View>
                <View style={styles.centerRow}>
                    <Text style={styles.lockEmojiGray}>🔒</Text>
                </View>
                <View style={styles.dashContainer}>
                    <View style={styles.grayDash} />
                </View>
            </View>
        );
    }

    // Unlocked Normal Card
    const getBadgeStyle = () => {
        if (item.type === 'Easy') return { bg: colors.greenLight, text: colors.greenDark };
        if (item.type === 'Medium') return { bg: colors.orangeLight, text: colors.orangeDark };
        if (item.type === 'Hard') return { bg: colors.redLight, text: colors.redDark };
        if (item.type === 'Expert') return { bg: colors.violetLight, text: colors.violetDark };
        return { bg: colors.grayLight, text: colors.darkGray };
    };

    const getDashColor = () => {
        if (item.type === 'Easy') return colors.green;
        if (item.type === 'Medium') return colors.orange;
        if (item.type === 'Hard') return colors.red;
        if (item.type === 'Expert') return colors.violet;
        return colors.gray;
    };

    const badgeStyle = getBadgeStyle();

    return (
        <View style={[styles.card, styles.normalCard]}>
            <View style={styles.headerRow}>
                <Text style={[styles.unlockedLevelText, { color: badgeStyle.text }]}>{item.level.toString().padStart(2, '0')}</Text>
                <View style={[styles.unlockedBadge, { backgroundColor: badgeStyle.bg }]}>
                    <Text style={[styles.unlockedBadgeText, { color: badgeStyle.text }]}>{item.shortType}</Text>
                </View>
            </View>
            <View style={styles.centerRow}>
                {renderStars()}
            </View>
            <View style={styles.dashContainer}>
                <View style={[styles.coloredDash, { backgroundColor: getDashColor() }]} />
            </View>
        </View>
    );
};

export default LevelCard;

const styles = StyleSheet.create({
    card: {
        width: cardWidth,
        height: 130,
        borderRadius: 16,
        padding: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#F1F5F9',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    centerRow: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    dashContainer: {
        alignItems: 'center',
        paddingBottom: 4,
    },

    // Current Card (Level 12)
    currentCard: {
        backgroundColor: colors.primary,
        borderWidth: 0,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    currentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    currentLevelCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    currentLevelNum: {
        color: colors.primary,
        fontSize: 12,
        fontFamily: fonts.bold,
    },
    currentBadge: {
        backgroundColor: '#FBBF24',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
    },
    currentBadgeText: {
        color: '#78350F',
        fontSize: 9,
        fontFamily: fonts.bold,
    },
    currentCenter: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    playIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
    },
    playIcon: {
        color: '#FFFFFF',
        fontSize: 14,
        marginLeft: 2,
    },
    currentTitle: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: fonts.bold,
        marginBottom: 6,
    },
    playPill: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 10,
    },
    playPillText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontFamily: fonts.bold,
    },

    // Unlocked Normal
    normalCard: {
        // Default styling is fine
    },
    unlockedLevelText: {
        fontSize: 14,
        fontFamily: fonts.bold,
    },
    unlockedBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    unlockedBadgeText: {
        fontSize: 9,
        fontFamily: fonts.bold,
    },
    starsContainer: {
        flexDirection: 'row',
        gap: 2,
    },
    starFilled: {
        color: '#FBBF24',
        fontSize: 12,
    },
    starOutline: {
        color: '#D1D5DB',
        fontSize: 12,
    },
    coloredDash: {
        width: 16,
        height: 3,
        borderRadius: 2,
    },

    // Locked Card
    lockedCard: {
        backgroundColor: '#F8FAFC',
    },
    lockedLevelText: {
        color: '#94A3B8',
        fontSize: 12,
        fontFamily: fonts.medium,
        marginLeft: 4,
    },
    lockedBadgeText: {
        color: colors.red, // Might want a light red here, but red works
        fontSize: 9,
        fontFamily: fonts.medium,
    },
    lockEmojiGray: {
        fontSize: 18,
        opacity: 0.3,
    },
    grayDash: {
        width: 16,
        height: 3,
        backgroundColor: '#E2E8F0',
        borderRadius: 2,
    },

    // Boss Card
    bossCard: {
        backgroundColor: '#F5F3FF', // Light purple
        borderWidth: 2,
        borderColor: '#DDD6FE', // Purple border
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    bossLevelCircle: {
        width: 22,
        height: 22,
        borderRadius: 11,
        backgroundColor: '#7C3AED',
        alignItems: 'center',
        justifyContent: 'center',
    },
    bossLevelText: {
        color: '#FFFFFF',
        fontSize: 10,
        fontFamily: fonts.bold,
    },
    bossBadge: {
        backgroundColor: '#7C3AED',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    bossBadgeText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontFamily: fonts.bold,
    },
    crownEmoji: {
        fontSize: 16,
    },
    lockEmoji: {
        fontSize: 12,
        opacity: 0.6,
    },
    bossSubtitle: {
        color: '#7C3AED',
        fontSize: 10,
        fontFamily: fonts.bold,
        textAlign: 'center',
        paddingBottom: 4,
    },
});

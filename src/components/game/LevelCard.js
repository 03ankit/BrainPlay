import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

const { width } = Dimensions.get('window');

/**
 * LevelCard can render individual level map nodes, boss cards, world divider banners, and chest milestones.
 */
export const MapLevelNode = ({
    level,
    status = 'completed', // 'completed', 'active', 'locked', 'boss'
    stars = 3,
    title = '',
    world = 1,
    sideAnnotation = null, // { type: 'start' | 'chest_opened' | 'chest_claimed' | 'mystery', text: string }
    onPress,
    isSelected = false,
}) => {
    // Determine colors based on world / status
    let nodeBg = colors.world1.primary;
    let nodeShadow = colors.world1.shadow;

    if (status === 'locked') {
        nodeBg = colors.lockedNode.bg;
        nodeShadow = colors.lockedNode.shadow;
    } else if (status === 'active') {
        nodeBg = colors.activeNode.bg;
        nodeShadow = colors.activeNode.shadow;
    } else if (world === 2) {
        nodeBg = colors.world2.primary;
        nodeShadow = colors.world2.shadow;
    } else if (world === 3) {
        nodeBg = colors.world3.primary;
        nodeShadow = colors.world3.shadow;
    }

    if (status === 'active') {
        return (
            <View style={styles.activeNodeWrapper}>
                {/* Floating "YOU ARE HERE!" tooltip */}
                <View style={styles.hereTooltip}>
                    <Text style={styles.hereText} numberOfLines={1}>📍 YOU ARE HERE!</Text>
                    <View style={styles.hereArrow} />
                </View>

                {/* Outer pulsing ring */}
                <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => onPress && onPress(level)}
                    style={styles.activeOuterRing}
                >
                    <View style={styles.activeMiddleRing}>
                        <View style={styles.activeInnerCircle}>
                            <Text style={styles.activePlayIcon}>▶</Text>
                            <Text style={styles.activeLevelNumber} numberOfLines={1}>LV{level}</Text>
                            <View style={styles.activePlayPill}>
                                <Text style={styles.activePlayPillText} numberOfLines={1}>PLAY</Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>

                {/* Level Title Below */}
                {title ? (
                    <View style={styles.activeTitlePill}>
                        <Text style={styles.activeTitleText} numberOfLines={1}>{title}</Text>
                    </View>
                ) : null}

                {/* Optional side annotation */}
                {sideAnnotation && renderSideAnnotation(sideAnnotation)}
            </View>
        );
    }

    if (status === 'locked') {
        return (
            <View style={styles.nodeWrapper}>
                <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => onPress && onPress(level)}
                    style={[styles.lockedCircle, isSelected && styles.selectedCircle]}
                >
                    <Text style={styles.lockIcon}>🔒</Text>
                    <Text style={styles.lockedLevelNum} numberOfLines={1}>{level}</Text>
                </TouchableOpacity>
                {sideAnnotation && renderSideAnnotation(sideAnnotation)}
            </View>
        );
    }

    // Completed Node (World 1 / World 2 / etc.)
    return (
        <View style={styles.nodeWrapper}>
            {/* Stars above */}
            <View style={styles.starsRow}>
                <Text style={stars >= 1 ? styles.starGold : styles.starDim}>⭐</Text>
                <Text style={stars >= 2 ? styles.starGold : styles.starDim}>⭐</Text>
                <Text style={stars >= 3 ? styles.starGold : styles.starDim}>⭐</Text>
            </View>

            {/* Circular Button */}
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onPress && onPress(level)}
                style={[
                    styles.completedCircle,
                    { backgroundColor: nodeBg, shadowColor: nodeShadow },
                    isSelected && styles.selectedCircle,
                ]}
            >
                {/* 3D bevel shine overlay */}
                <View style={styles.circleTopGloss} />
                <Text style={styles.completedLevelText} numberOfLines={1}>{level.toString().padStart(2, '0')}</Text>
            </TouchableOpacity>

            {/* Side annotation like "STARTING POINT" or "Opened" chest */}
            {sideAnnotation && renderSideAnnotation(sideAnnotation)}
        </View>
    );
};

const renderSideAnnotation = (annotation) => {
    if (annotation.type === 'start') {
        return (
            <View style={styles.startBadge}>
                <Text style={styles.startBadgeIcon}>🏁</Text>
                <Text style={styles.startBadgeText} numberOfLines={1}>{annotation.text || 'STARTING POINT'}</Text>
            </View>
        );
    }

    if (annotation.type === 'chest_opened' || annotation.type === 'chest_claimed') {
        return (
            <View style={styles.chestPill}>
                <Text style={styles.chestIcon}>🎁</Text>
                <Text style={styles.chestText} numberOfLines={1}>{annotation.text}</Text>
            </View>
        );
    }

    if (annotation.type === 'mystery') {
        return (
            <View style={styles.mysteryChestContainer}>
                <Text style={styles.mysteryGiftIcon}>🎁</Text>
                <View style={styles.mysteryTextContainer}>
                    <Text style={styles.mysterySubLabel} numberOfLines={1}>BONUS LEVEL UNLOCKED</Text>
                    <Text style={styles.mysteryTitle} numberOfLines={1}>{annotation.text || 'Mystery Chest'}</Text>
                </View>
            </View>
        );
    }

    return null;
};

/**
 * World Divider / Progress Banner that sits between zones on the map
 */
export const WorldBanner = ({ worldNumber, title, subtitle, icon = '🍬' }) => {
    let worldConfig = colors.world1;

    if (worldNumber === 2) {
        worldConfig = colors.world2;
    } else if (worldNumber === 3) {
        worldConfig = colors.world3;
    }

    return (
        <View style={[styles.worldBanner, { backgroundColor: worldConfig.bg, borderColor: worldConfig.border }]}>
            <View style={styles.worldBannerLeft}>
                <Text style={styles.worldBannerIcon}>{icon}</Text>
                <Text style={[styles.worldBannerTitle, { color: worldConfig.text }]} numberOfLines={1}>
                    World {worldNumber}: {title}
                </Text>
            </View>
            <View style={styles.worldBannerRight}>
                <Text style={[styles.worldBannerSub, { color: worldConfig.subText }]} numberOfLines={1}>
                    {subtitle}
                </Text>
            </View>
        </View>
    );
};

/**
 * World 4 Summit Boss Card at Top
 */
export const BossSummitCard = ({ onPlayBoss }) => {
    return (
        <View style={styles.bossSummitContainer}>
            {/* Header Pill */}
            <View style={styles.bossSummitHeaderPill}>
                <Text style={styles.bossWorldTag} numberOfLines={1}>WORLD 4 • SKY CASTLE (19-20)</Text>
                <Text style={styles.bossSummitHeading} numberOfLines={1}>Royal Boss Summit</Text>
            </View>

            {/* Boss Node Circle */}
            <TouchableOpacity
                activeOpacity={0.9}
                onPress={onPlayBoss}
                style={styles.bossNodeTouchable}
            >
                <View style={styles.bossBadgeWrapper}>
                    <Text style={styles.bossBadgeText} numberOfLines={1}>👑 BOSS</Text>
                </View>

                <View style={styles.bossOuterRing}>
                    <View style={styles.bossInnerCircle}>
                        <Text style={styles.bossCastleIcon}>🏰</Text>
                        <Text style={styles.bossWarpLabel} numberOfLines={1}>WARP</Text>
                        <Text style={styles.bossLabel} numberOfLines={1}>BOSS</Text>
                    </View>
                </View>
            </TouchableOpacity>

            {/* Secret key note banner */}
            <View style={styles.bossSecretNote}>
                <Text style={styles.bossSecretIcon}>🔑</Text>
                <Text style={styles.bossSecretText} numberOfLines={1}>The key is hidden somewhere in the trees</Text>
            </View>
        </View>
    );
};

// Default export for backward compatibility
export default function LevelCard(props) {
    if (props.item) {
        return (
            <MapLevelNode
                level={props.item.level}
                status={props.item.isCurrent ? 'active' : props.item.isLocked ? 'locked' : 'completed'}
                stars={props.item.stars || 3}
                title={props.item.title}
                world={props.item.level <= 5 ? 1 : props.item.level <= 11 ? 2 : 3}
                onPress={props.onPress}
            />
        );
    }
    return <MapLevelNode {...props} />;
}

const styles = StyleSheet.create({
    nodeWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    starsRow: {
        flexDirection: 'row',
        gap: 1,
        marginBottom: 2,
    },
    starGold: {
        fontSize: 9,
        color: colors.yellow,
    },
    starDim: {
        fontSize: 9,
        color: colors.grayLight,
    },
    completedCircle: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 6,
        elevation: 5,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    circleTopGloss: {
        position: 'absolute',
        top: 2,
        left: 6,
        right: 6,
        height: 12,
        borderRadius: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },
    completedLevelText: {
        color: colors.white,
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    lockedCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.lockedNode.bg,
        borderWidth: 1.5,
        borderColor: colors.lockedNode.border,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.gray,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    lockIcon: {
        fontSize: 11,
        marginBottom: 1,
        opacity: 0.7,
    },
    lockedLevelNum: {
        fontSize: 10,
        fontFamily: fonts.bold,
        color: colors.lockedNode.text,
        fontWeight: '700',
    },
    selectedCircle: {
        borderColor: colors.primary,
        borderWidth: 2.5,
    },

    // Active Node (Level 12)
    activeNodeWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        marginVertical: 2,
    },
    hereTooltip: {
        backgroundColor: colors.activeNode.bg,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        marginBottom: 6,
        alignItems: 'center',
        shadowColor: colors.activeNode.shadow,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 5,
        elevation: 4,
    },
    hereText: {
        color: colors.white,
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    hereArrow: {
        position: 'absolute',
        bottom: -3,
        width: 6,
        height: 6,
        backgroundColor: colors.activeNode.bg,
        transform: [{ rotate: '45deg' }],
    },
    activeOuterRing: {
        width: 76,
        height: 76,
        borderRadius: 38,
        backgroundColor: colors.activeNode.outerRing,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.activeNode.middleRing,
    },
    activeMiddleRing: {
        width: 66,
        height: 66,
        borderRadius: 33,
        backgroundColor: colors.activeNode.middleRing,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeInnerCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.activeNode.bg,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.activeNode.shadow,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 6,
        borderWidth: 2,
        borderColor: colors.activeNode.borderColor,
    },
    activePlayIcon: {
        color: colors.white,
        fontSize: 9,
        marginBottom: 0,
    },
    activeLevelNumber: {
        color: colors.white,
        fontSize: 12,
        fontFamily: fonts.bold,
        fontWeight: '900',
        lineHeight: 14,
    },
    activePlayPill: {
        backgroundColor: colors.activeNode.badgeBg,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 5,
        marginTop: 1,
    },
    activePlayPillText: {
        color: colors.activeNode.badgeText,
        fontSize: 7,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    activeTitlePill: {
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.grayBorder,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 10,
        marginTop: 4,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    activeTitleText: {
        color: colors.slateText,
        fontSize: 10,
        fontFamily: fonts.bold,
        fontWeight: '700',
    },

    // Side Badges & Chests
    startBadge: {
        position: 'absolute',
        top: 56,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.world1.border,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 3,
        shadowColor: colors.world1.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 3,
        zIndex: 5,
        gap: 3,
    },
    startBadgeIcon: {
        fontSize: 10,
    },
    startBadgeText: {
        color: colors.world1.text,
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    chestPill: {
        position: 'absolute',
        left: 56,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.world2.border,
        borderRadius: 10,
        paddingHorizontal: 7,
        paddingVertical: 3,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 3,
        elevation: 2,
        gap: 3,
    },
    chestIcon: {
        fontSize: 11,
    },
    chestText: {
        color: colors.world2.text,
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '700',
    },
    mysteryChestContainer: {
        position: 'absolute',
        left: 50,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.world2.bg,
        borderWidth: 1.5,
        borderColor: colors.world2.border,
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
        shadowColor: colors.world2.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 5,
        elevation: 3,
        gap: 6,
        minWidth: 140,
    },
    mysteryGiftIcon: {
        fontSize: 16,
    },
    mysteryTextContainer: {
        flex: 1,
    },
    mysterySubLabel: {
        color: colors.world2.subText,
        fontSize: 7,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
    mysteryTitle: {
        color: colors.goldBrown,
        fontSize: 10,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },

    // World Banner
    worldBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: width - 32,
        marginHorizontal: 16,
        paddingHorizontal: 12,
        paddingVertical: 7,
        borderRadius: 12,
        borderWidth: 1,
        marginVertical: 10,
    },
    worldBannerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        flex: 1,
    },
    worldBannerIcon: {
        fontSize: 12,
    },
    worldBannerTitle: {
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
    worldBannerRight: {
        flexShrink: 0,
    },
    worldBannerSub: {
        fontSize: 10,
        fontFamily: fonts.medium,
        fontWeight: '700',
    },

    // Boss Summit Card
    bossSummitContainer: {
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    bossSummitHeaderPill: {
        backgroundColor: colors.world4.bg,
        borderWidth: 1.5,
        borderColor: colors.world4.border,
        borderRadius: 16,
        paddingHorizontal: 16,
        paddingVertical: 8,
        alignItems: 'center',
        shadowColor: colors.world4.gold,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.12,
        shadowRadius: 5,
        elevation: 3,
        width: width - 40,
    },
    bossWorldTag: {
        color: colors.world4.tagText,
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.6,
        marginBottom: 1,
    },
    bossSummitHeading: {
        color: colors.world4.text,
        fontSize: 14,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    bossNodeTouchable: {
        alignItems: 'center',
        marginTop: 12,
        marginBottom: 8,
        position: 'relative',
    },
    bossBadgeWrapper: {
        backgroundColor: colors.world4.gold,
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
        marginBottom: -7,
        zIndex: 10,
        borderWidth: 1.5,
        borderColor: colors.white,
    },
    bossBadgeText: {
        color: colors.white,
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    bossOuterRing: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: colors.world4.gold,
        padding: 3,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.world4.shadow,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 7,
    },
    bossInnerCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.world4.primary,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1.5,
        borderColor: colors.world4.borderLight,
    },
    bossCastleIcon: {
        fontSize: 18,
        marginBottom: -1,
    },
    bossWarpLabel: {
        color: colors.white,
        fontSize: 8,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    bossLabel: {
        color: colors.yellow,
        fontSize: 8,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    bossSecretNote: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.grayBorder,
        borderRadius: 12,
        paddingHorizontal: 10,
        paddingVertical: 5,
        gap: 5,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
        maxWidth: width - 48,
    },
    bossSecretIcon: {
        fontSize: 11,
    },
    bossSecretText: {
        color: colors.grayDark,
        fontSize: 10,
        fontFamily: fonts.medium,
        fontWeight: '600',
    },
});



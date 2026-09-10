import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import { MapLevelNode, BossSummitCard } from '../../components/game/LevelCard';

const { width } = Dimensions.get('window');

/**
 * Node placement on X-axis across the winding serpentine road (0 to 1 ratio)
 * Nodes are ordered from top to bottom (Level 20 -> Level 1)
 */
const mapNodesData = [
    { level: 19, xRatio: 0.78, status: 'locked', world: 4 },
    { level: 18, xRatio: 0.50, status: 'locked', world: 3 },
    { level: 17, xRatio: 0.80, status: 'locked', world: 3 },
    { level: 16, xRatio: 0.22, status: 'locked', world: 3 },
    { level: 15, xRatio: 0.48, status: 'locked', world: 3 },
    { level: 14, xRatio: 0.20, status: 'locked', world: 3 },
    { level: 13, xRatio: 0.32, status: 'locked', world: 3 },
    { level: 12, xRatio: 0.50, status: 'active', world: 2, title: 'Prefixes & Roots' },
    { level: 11, xRatio: 0.80, status: 'completed', stars: 3, world: 2 },
    { level: 10, xRatio: 0.22, status: 'completed', stars: 3, world: 2 },
    { level: 9, xRatio: 0.58, status: 'completed', stars: 3, world: 2 },
    { level: 8, xRatio: 0.24, status: 'completed', stars: 2, world: 2 },
    { level: 7, xRatio: 0.80, status: 'completed', stars: 3, world: 2 },
    { level: 6, xRatio: 0.50, status: 'completed', stars: 3, world: 2 },
    { level: 5, xRatio: 0.22, status: 'completed', stars: 3, world: 1 },
    { level: 4, xRatio: 0.78, status: 'completed', stars: 3, world: 1 },
    { level: 3, xRatio: 0.44, status: 'completed', stars: 3, world: 1 },
    { level: 2, xRatio: 0.78, status: 'completed', stars: 3, world: 1 },
    { level: 1, xRatio: 0.50, status: 'completed', stars: 3, world: 1, sideAnnotation: { type: 'start', text: 'STARTING POINT' } },
];

export default function SelectLevel({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef(null);

    // Get game info from navigation params or fallback to default
    const gameParam = route?.params?.game;
    const gameTitle = route?.params?.title || (typeof gameParam === 'string' ? gameParam : gameParam?.title) || 'Word Odyssey';

    // Currently selected level to show and play in bottom bar
    const [selectedLevel, setSelectedLevel] = useState(12);

    const handleBack = () => {
        if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    // Selecting level on node tap
    const handleNodePress = (level) => {
        if (level <= 12) {
            setSelectedLevel(level);
        }
    };

    // Play the selected level
    const handlePlaySelectedLevel = () => {
        navigation.navigate('WordJumbleDetail', { level: selectedLevel, game: gameTitle });
    };

    const handlePlayBoss = () => {
        // Direct action if boss is unlocked, otherwise silently ignore
    };

    // Calculate layout positions for continuous Bézier S-curves connecting each node
    const BOSS_CARD_HEIGHT = 180;

    // Compute exact center (x, y) coordinates for all items in the list
    let currentY = BOSS_CARD_HEIGHT + 10;
    const itemPositions = mapNodesData.map(item => {
        const rowHeight = item.status === 'active' ? 104 : 80;
        const centerX = (width - 40) * item.xRatio + 20;
        const centerY = currentY + (item.status === 'active' ? 52 : 38);
        const pos = {
            type: 'node',
            level: item.level,
            world: item.world,
            status: item.status,
            x: centerX,
            y: centerY,
            yTop: currentY,
            height: rowHeight,
            xRatio: item.xRatio,
        };
        currentY += rowHeight;
        return pos;
    });

    const totalCanvasHeight = currentY + 120;

    // Generate smooth Bézier S-curve connecting path segments
    const renderedPaths = [];
    const nodeOnlyPositions = itemPositions.filter(p => p.type === 'node');

    for (let i = 0; i < nodeOnlyPositions.length - 1; i++) {
        const nodeA = nodeOnlyPositions[i];
        const nodeB = nodeOnlyPositions[i + 1];

        // Path color based on zone
        let pathColor = colors.world1.dash;
        let isDashed = false;

        if (nodeA.world === 2 && nodeB.world === 2) {
            pathColor = colors.world2.dash;
        } else if (nodeA.level === 13 || nodeA.level === 12 || nodeB.level === 12) {
            pathColor = colors.activeNode.bg;
        } else if (nodeA.world === 3 || nodeB.world === 3) {
            pathColor = colors.lockedNode.dash;
            isDashed = true;
        } else if (nodeA.world === 4 || nodeB.world === 4) {
            pathColor = colors.world3.primary;
        }

        const deltaX = nodeB.x - nodeA.x;
        const deltaY = nodeB.y - nodeA.y;

        // Cubic Bézier control points for natural S-curve road
        const isVertical = Math.abs(deltaX) < 30;
        const wobble = isVertical ? (i % 2 === 0 ? 36 : -36) : 0;

        const c1X = nodeA.x + deltaX * 0.15 + wobble;
        const c1Y = nodeA.y + deltaY * 0.65;
        const c2X = nodeB.x - deltaX * 0.15 - wobble;
        const c2Y = nodeA.y + deltaY * 0.35;

        // Sample points along the curve
        const steps = 14;
        const curveDots = [];
        for (let s = 1; s < steps; s++) {
            if (isDashed && s % 2 === 1) continue; // Alternate for dashed road look
            const t = s / steps;
            const oneMinusT = 1 - t;
            const dotX =
                oneMinusT * oneMinusT * oneMinusT * nodeA.x +
                3 * oneMinusT * oneMinusT * t * c1X +
                3 * oneMinusT * t * t * c2X +
                t * t * t * nodeB.x;
            const dotY =
                oneMinusT * oneMinusT * oneMinusT * nodeA.y +
                3 * oneMinusT * oneMinusT * t * c1Y +
                3 * oneMinusT * t * t * c2Y +
                t * t * t * nodeB.y;

            curveDots.push({ x: dotX, y: dotY, key: `dot_${nodeA.level}_${nodeB.level}_${s}` });
        }

        renderedPaths.push({
            dots: curveDots,
            pathColor,
            key: `path_${nodeA.level}_${nodeB.level}`,
        });
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>

            {/* Top Game Header Bar */}
            <View style={styles.topHeader}>
                <View style={styles.topHeaderLeft}>
                    <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.7}>
                        <Image source={images.back} style={styles.backIcon} />
                    </TouchableOpacity>
                    <View style={styles.headerTextGroup}>
                        <View style={styles.titleWithBadge}>
                            <Text style={styles.appTitle} numberOfLines={1}>BrainPlay</Text>
                            <View style={styles.arcadeBadge}>
                                <Text style={styles.arcadeText}>ARCADE</Text>
                            </View>
                        </View>
                        <Text style={styles.mapSubtitle} numberOfLines={1}>{gameTitle} Map</Text>
                    </View>
                </View>
            </View>

            {/* Clean Subheader: Active Level and Total Stars Only */}
            <View style={styles.infoSubHeader}>
                <View style={styles.activeLevelIndicator}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeLevelIndicatorText} numberOfLines={1}>Active: Level {selectedLevel}</Text>
                </View>
                <View style={styles.totalStarsPill}>
                    <Text style={styles.totalStarsText}>⭐ 34/60 Stars</Text>
                </View>
            </View>

            {/* Serpentine Map Path Content */}
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.mapScrollContent, { minHeight: totalCanvasHeight }]}
            >
                {/* Connecting Winding Road Paths (rendered beneath nodes) */}
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    {renderedPaths.map(p =>
                        p.dots.map(d => (
                            <View
                                key={d.key}
                                style={[
                                    styles.pathRoadDot,
                                    {
                                        left: d.x - 3.5,
                                        top: d.y - 3.5,
                                        backgroundColor: p.pathColor,
                                    },
                                ]}
                            />
                        ))
                    )}
                </View>

                {/* Boss Summit at Top */}
                <BossSummitCard onPlayBoss={handlePlayBoss} />

                {/* Map Nodes */}
                <View style={styles.pathNodesContainer}>
                    {mapNodesData.map((item) => {
                        // Calculate horizontal center offset
                        const leftOffset = (width - 40) * item.xRatio - 25;

                        return (
                            <View
                                key={`node_wrapper_${item.level}`}
                                style={[
                                    styles.nodeRow,
                                    { height: item.status === 'active' ? 104 : 80 },
                                ]}
                            >
                                <View style={[styles.nodeAbsoluteContainer, { left: leftOffset }]}>
                                    <MapLevelNode
                                        level={item.level}
                                        status={item.status}
                                        stars={item.stars || 3}
                                        title={item.title}
                                        world={item.world}
                                        sideAnnotation={item.sideAnnotation}
                                        onPress={handleNodePress}
                                        isSelected={selectedLevel === item.level}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>

                {/* Bottom Padding for floating footer */}
                <View style={{ height: 110 }} />
            </ScrollView>

            {/* Sticky Bottom Action Bar */}
            <View style={[styles.bottomBarWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <View style={styles.bottomBar}>
                    {/* Selected Level Indicator */}
                    <View style={styles.bottomBarLeft}>
                        <View style={styles.stageLevelBadge}>
                            <Text style={styles.stageLevelText}>LVL {selectedLevel}</Text>
                        </View>
                        <View style={styles.stageDetails}>
                            <View style={styles.activeStageTag}>
                                <Text style={styles.activeStageTagText} numberOfLines={1}>SELECTED LEVEL</Text>
                            </View>
                            <Text style={styles.stageName} numberOfLines={1}>
                                {selectedLevel === 12 ? 'Prefixes & Roots' : `Level ${selectedLevel} Challenge`}
                            </Text>
                        </View>
                    </View>

                    {/* Play Button without -1 */}
                    <TouchableOpacity
                        style={styles.playLevelButton}
                        activeOpacity={0.88}
                        onPress={handlePlaySelectedLevel}
                    >
                        <Text style={styles.playButtonText} numberOfLines={1}>PLAY LEVEL {selectedLevel} ▶</Text>
                    </TouchableOpacity>
                </View>
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.screenBg,
    },
    topHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingTop: 10,
        paddingBottom: 14,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLighter,
    },
    topHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    backButton: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.grayLighter,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    backIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        tintColor: colors.darkBlue,
    },
    headerTextGroup: {
        flex: 1,
    },
    titleWithBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    appTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
    },
    arcadeBadge: {
        backgroundColor: colors.purpleDark,
        paddingHorizontal: 7,
        paddingVertical: 2,
        borderRadius: 6,
    },
    arcadeText: {
        color: colors.white,
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    mapSubtitle: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: colors.gray,
        marginTop: 2,
    },
    topStatsRow: {
        flexDirection: 'row',
        gap: 4,
        flexShrink: 0,
    },
    statPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.background,
        borderWidth: 1,
        borderColor: colors.avatarBg,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        gap: 4,
    },
    statIcon: {
        fontSize: 11,
    },
    statText: {
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.darkBlue,
    },
    infoSubHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.grayLighter,
    },
    activeLevelIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primaryLight,
        borderWidth: 1,
        borderColor: colors.indigoLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
        gap: 6,
    },
    activeDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: colors.primary,
    },
    activeLevelIndicatorText: {
        color: colors.primary,
        fontSize: 12,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
    totalStarsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.orangeWarm,
        borderWidth: 1,
        borderColor: colors.orangeBorder,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14,
    },
    totalStarsText: {
        color: colors.orangeDark,
        fontSize: 12,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
    mapScrollContent: {
        paddingTop: 8,
        position: 'relative',
    },
    decorIcon: {
        position: 'absolute',
        zIndex: 1,
    },
    pathNodesContainer: {
        position: 'relative',
        paddingBottom: 16,
        zIndex: 2,
    },
    nodeRow: {
        position: 'relative',
        justifyContent: 'center',
        zIndex: 2,
    },
    nodeAbsoluteContainer: {
        position: 'absolute',
        zIndex: 10,
    },
    pathRoadDot: {
        position: 'absolute',
        width: 7,
        height: 7,
        borderRadius: 3.5,
        zIndex: 1,
    },
    bottomBarWrapper: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 12,
        paddingTop: 6,
        backgroundColor: 'rgba(247, 248, 252, 0.95)',
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 14,
        elevation: 8,
        borderWidth: 1,
        borderColor: colors.violetLight,
    },
    bottomBarLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: 8,
    },
    stageLevelBadge: {
        width: 38,
        height: 38,
        borderRadius: 19,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
        elevation: 3,
    },
    stageLevelText: {
        color: colors.white,
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    stageDetails: {
        flex: 1,
    },
    activeStageTag: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 5,
        paddingVertical: 1,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginBottom: 1,
    },
    activeStageTagText: {
        color: colors.primary,
        fontSize: 7,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.3,
    },
    stageName: {
        color: colors.darkBlue,
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
    playLevelButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 14,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 5,
        gap: 4,
        flexShrink: 0,
    },
    playButtonText: {
        color: colors.white,
        fontSize: 10,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    energyTag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 4,
        paddingVertical: 1.5,
        borderRadius: 5,
    },
    energyText: {
        color: colors.yellowLight,
        fontSize: 8,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
});




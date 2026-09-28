import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Dimensions,
    Image,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import { MapLevelNode, BossSummitCard } from '../../components/game/LevelCard';
import progressRepository from '../../database/repositories/progressRepository';
import playerRepository from '../../database/repositories/playerRepository';
import StarRequirementModal from '../../components/game/StarRequirementModal';
import LevelLockedModal from '../../components/game/LevelLockedModal';

const { width } = Dimensions.get('window');

/**
 * 20 Level Nodes along serpentine path (ordered from top level 20 to bottom level 1)
 */
const mapNodesConfig = [
    { level: 20, xRatio: 0.50, world: 4, title: 'Royal Summit' },
    { level: 19, xRatio: 0.78, world: 4, title: 'Victory Pass' },
    { level: 18, xRatio: 0.50, world: 3, title: 'Crystal Cavern' },
    { level: 17, xRatio: 0.80, world: 3, title: 'Triumph Ridge' },
    { level: 16, xRatio: 0.22, world: 3, title: 'Mystery Peak' },
    { level: 15, xRatio: 0.48, world: 3, title: 'Champion Trail' },
    { level: 14, xRatio: 0.20, world: 3, title: 'Journey Way' },
    { level: 13, xRatio: 0.32, world: 3, title: 'Wisdom Path' },
    { level: 12, xRatio: 0.50, world: 2, title: 'Prefixes & Roots' },
    { level: 11, xRatio: 0.80, world: 2, title: 'Action Words' },
    { level: 10, xRatio: 0.22, world: 2, title: 'Flower Field' },
    { level: 9,  xRatio: 0.58, world: 2, title: 'Wonder Land' },
    { level: 8,  xRatio: 0.24, world: 2, title: 'Player Realm' },
    { level: 7,  xRatio: 0.80, world: 2, title: 'Puzzle Garden' },
    { level: 6,  xRatio: 0.50, world: 2, title: 'Smart Grove' },
    { level: 5,  xRatio: 0.22, world: 1, title: 'Brain Storm' },
    { level: 4,  xRatio: 0.78, world: 1, title: 'House Hill' },
    { level: 3,  xRatio: 0.44, world: 1, title: 'Star Valley' },
    { level: 2,  xRatio: 0.78, world: 1, title: 'Game Park' },
    { level: 1,  xRatio: 0.50, world: 1, title: 'Starting Point', sideAnnotation: { type: 'start', text: 'STARTING POINT' } },
];

export default function SelectLevel({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const scrollViewRef = useRef(null);

    // Navigation parameters
    const gameParam = route?.params?.game;
    const gameTitle = route?.params?.title || (typeof gameParam === 'string' ? gameParam : gameParam?.title) || 'Word Jumble';

    // State for SQLite player progress, unlocked levels, player coins, and selected level
    const [playerProgress, setPlayerProgress] = useState([]);
    const [unlockedLevels, setUnlockedLevels] = useState([]);
    const [playerCoins, setPlayerCoins] = useState(100);
    const [selectedLevel, setSelectedLevel] = useState(Number(route?.params?.level) || 1);
    const [showStarModal, setShowStarModal] = useState(false);
    const [lockedModal, setLockedModal] = useState({
        visible: false,
        targetLevel: 2,
        requiredLevel: 1,
        title: 'Level Locked',
        message: '',
    });

    const gameId = gameTitle === 'Color Match' ? '2' : (gameTitle === 'Math Quiz' || gameTitle === 'Maths Challenge') ? '3' : (gameTitle === 'Memory Cards' || gameTitle === 'Memory Challenge' || gameTitle === 'Memory') ? '4' : '1';

    // Fetch player progress and unlocks from SQLite whenever screen comes into focus
    const loadProgress = useCallback(async () => {
        try {
            const data = await progressRepository.getPlayerProgress('local_player', gameId);
            setPlayerProgress(data || []);

            const unlocks = await progressRepository.getUnlockedLevels('local_player', gameId);
            setUnlockedLevels(unlocks || []);

            const profile = await playerRepository.getPlayerProfile('local_player');
            if (profile) {
                setPlayerCoins(Number(profile.coins) || 0);
            }

            // Calculate highest completed level sequentially
            const completedSet = new Set(
                (data || [])
                    .filter((p) => Number(p.is_completed) === 1)
                    .map((p) => Number(p.level_number))
            );

            let highestConsecutive = 0;
            while (completedSet.has(highestConsecutive + 1)) {
                highestConsecutive += 1;
            }

            // Compute World 1 (levels 1-5) stars
            let w1Stars = 0;
            (data || []).forEach((p) => {
                const lvl = Number(p.level_number);
                if (lvl >= 1 && lvl <= 5 && Number(p.is_completed) === 1) {
                    w1Stars += Number(p.stars) || 0;
                }
            });

            // Active level calculation:
            // If Level 5 is completed and World 1 stars < 11 and Level 6 not unlocked with coins, max unlocked level is 5
            const isWorld1Qualified = w1Stars >= 11;
            const isLvl6Unlocked = (unlocks || []).includes(6);

            let activeLvl = Math.min(highestConsecutive + 1, 20);
            if (highestConsecutive >= 5 && !isWorld1Qualified && !isLvl6Unlocked && activeLvl > 5) {
                activeLvl = 5;
            }

            // Prefer route param level if specified and unlocked, otherwise active level
            const paramLvl = Number(route?.params?.level);
            if (paramLvl && (paramLvl <= activeLvl || (unlocks || []).includes(paramLvl))) {
                setSelectedLevel(paramLvl);
            } else {
                setSelectedLevel(activeLvl);
            }
        } catch (err) {
            console.error('Error fetching player progress in SelectLevel:', err);
        }
    }, [route?.params?.level, gameId]);

    useFocusEffect(
        useCallback(() => {
            loadProgress();
        }, [loadProgress])
    );

    // Compute stats from playerProgress
    const completedSet = new Set(
        playerProgress
            .filter((p) => Number(p.is_completed) === 1)
            .map((p) => Number(p.level_number))
    );

    let highestCompletedLevel = 0;
    while (completedSet.has(highestCompletedLevel + 1)) {
        highestCompletedLevel += 1;
    }

    let world1Stars = 0;
    let totalEarnedStars = 0;
    playerProgress.forEach((item) => {
        if (Number(item.is_completed) === 1) {
            const s = Number(item.stars) || 0;
            totalEarnedStars += s;
            if (Number(item.level_number) >= 1 && Number(item.level_number) <= 5) {
                world1Stars += s;
            }
        }
    });

    const isWorld1Bypassed = world1Stars >= 11 || unlockedLevels.includes(6);

    let activeLevelNumber = Math.min(highestCompletedLevel + 1, 20);
    if (highestCompletedLevel >= 5 && !isWorld1Bypassed && activeLevelNumber > 5) {
        activeLevelNumber = 5;
    }

    // Map node items with exact dynamic status & star rating from SQLite
    const mapNodesData = mapNodesConfig.map((item) => {
        const prog = playerProgress.find((p) => Number(p.level_number) === item.level);
        const isCoinUnlocked = unlockedLevels.includes(item.level);
        let status = 'locked';
        let stars = 0;

        if (prog && Number(prog.is_completed) === 1) {
            status = 'completed';
            stars = prog.stars !== undefined && prog.stars !== null ? Number(prog.stars) : 0;
        } else if (isCoinUnlocked) {
            status = 'active';
            stars = 0;
        } else if (item.level === activeLevelNumber) {
            status = 'active';
            stars = 0;
        }

        // Lock level 6 and beyond if World 1 stars requirement (11 stars) is not met and not coin unlocked
        if (item.level >= 6 && !isWorld1Bypassed && !isCoinUnlocked && status !== 'completed') {
            status = 'locked';
        }

        return {
            ...item,
            status,
            stars,
        };
    });

    const selectedNodeInfo = mapNodesData.find((n) => n.level === selectedLevel) || {
        level: selectedLevel,
        title: `Level ${selectedLevel} Challenge`,
    };

    const handleBack = () => {
        navigation.reset({
            index: 0,
            routes: [{ name: 'BottomNavigation', params: { screen: 'Games' } }],
        });
    };

    // Unlock any locked level with 300 coins
    const handleUnlockWithCoins = async (targetLvl) => {
        const result = await progressRepository.unlockLevelWithCoins({
            profileId: 'local_player',
            gameId,
            levelNumber: targetLvl,
            cost: 300,
        });

        if (result.success) {
            setShowStarModal(false);
            setLockedModal((prev) => ({ ...prev, visible: false }));
            setPlayerCoins(result.remainingCoins);
            setUnlockedLevels((prev) => [...prev, targetLvl]);
            setSelectedLevel(targetLvl);
            await loadProgress();
            Alert.alert(
                'Level Unlocked! 🎉',
                `Level ${targetLvl} is now unlocked! You spent 300 coins. New Balance: ${result.remainingCoins} 🪙`,
            );
        } else {
            Alert.alert(
                'Insufficient Coins',
                result.message || `You need 300 coins to unlock Level ${targetLvl}. Complete levels to earn more coins!`
            );
        }
    };

    // Tapping a level node
    const handleNodePress = (level) => {
        const node = mapNodesData.find((n) => n.level === level);

        // Check if user tapped Level 6+ without meeting 11 stars in World 1 and without coin unlock
        if (level >= 6 && !isWorld1Bypassed && !unlockedLevels.includes(level) && node?.status === 'locked') {
            setShowStarModal(true);
            return;
        }

        if (node && node.status !== 'locked') {
            setSelectedLevel(level);
        } else {
            const reqLevel = Math.max(1, level - 1);
            setLockedModal({
                visible: true,
                targetLevel: level,
                requiredLevel: reqLevel,
                title: level === 20 ? 'Summit Locked' : 'Level Locked',
                message: level === 20
                    ? 'Complete previous levels to unlock the Royal Boss Summit!'
                    : `Complete Level ${reqLevel} first to unlock Level ${level}!`,
            });
        }
    };

    // Play selected level button
    const handlePlaySelectedLevel = () => {
        if (selectedLevel >= 6 && !isWorld1Bypassed && !unlockedLevels.includes(selectedLevel)) {
            setShowStarModal(true);
            return;
        }

        const targetNode = mapNodesData.find((n) => n.level === selectedLevel);
        if (targetNode && targetNode.status === 'locked') {
            const reqLevel = Math.max(1, selectedLevel - 1);
            setLockedModal({
                visible: true,
                targetLevel: selectedLevel,
                requiredLevel: reqLevel,
                title: selectedLevel === 20 ? 'Summit Locked' : 'Level Locked',
                message: selectedLevel === 20
                    ? 'Complete previous levels to unlock the Royal Boss Summit!'
                    : `Complete Level ${reqLevel} first to unlock Level ${selectedLevel}!`,
            });
            return;
        }

        if (gameTitle === 'Color Match') {
            navigation.navigate('ColorMatchDetail', { level: selectedLevel, game: gameTitle });
        } else if (gameTitle === 'Math Quiz' || gameTitle === 'Maths Challenge') {
            navigation.navigate('MathQuizDetail', { level: selectedLevel, game: gameTitle });
        } else if (gameTitle === 'Memory Cards' || gameTitle === 'Memory Challenge' || gameTitle === 'Memory') {
            navigation.navigate('MemoryChallengeDetail', { level: selectedLevel, game: gameTitle });
        } else {
            navigation.navigate('WordJumbleDetail', { level: selectedLevel, game: gameTitle });
        }
    };

    const handlePlayBoss = () => {
        const bossNode = mapNodesData.find((n) => n.level === 20);
        if (bossNode && bossNode.status !== 'locked') {
            setSelectedLevel(20);
            if (gameTitle === 'Color Match') {
                navigation.navigate('ColorMatchScreen', { level: 20, game: gameTitle });
            } else if (gameTitle === 'Math Quiz' || gameTitle === 'Maths Challenge') {
                navigation.navigate('MathQuizScreen', { level: 20, game: gameTitle });
            } else if (gameTitle === 'Memory Cards' || gameTitle === 'Memory Challenge' || gameTitle === 'Memory') {
                navigation.navigate('MemoryChallengeScreen', { level: 20, game: gameTitle });
            } else {
                navigation.navigate('WordPuzzleScreen', { level: 20, game: gameTitle });
            }
        } else {
            setLockedModal({
                visible: true,
                targetLevel: 20,
                requiredLevel: 19,
                title: 'Summit Locked',
                message: 'Complete previous levels to unlock the Royal Boss Summit!',
            });
        }
    };

    // Layout calculation for perfectly aligned Bézier S-curves & Node placement
    const BOSS_CARD_HEIGHT = 180;
    let currentY = BOSS_CARD_HEIGHT + 10;
    const itemPositions = mapNodesData.map((item) => {
        const rowHeight = item.status === 'active' ? 108 : (item.level === 1 ? 96 : 80);
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

    // Auto-scroll to active level on mount
    useEffect(() => {
        if (scrollViewRef.current && itemPositions.length > 0) {
            const activePos = itemPositions.find((p) => p.level === activeLevelNumber);
            if (activePos) {
                const targetY = Math.max(0, activePos.y - 280);
                setTimeout(() => {
                    scrollViewRef.current?.scrollTo({ y: targetY, animated: true });
                }, 350);
            }
        }
    }, [activeLevelNumber, itemPositions]);

    // Generate smooth Bézier S-curve connecting path segments
    const renderedPaths = [];
    const nodeOnlyPositions = itemPositions.filter((p) => p.type === 'node');

    for (let i = 0; i < nodeOnlyPositions.length - 1; i++) {
        const nodeA = nodeOnlyPositions[i];
        const nodeB = nodeOnlyPositions[i + 1];

        let pathColor = colors.world1.dash;
        let isDashed = false;

        if (nodeA.world === 2 && nodeB.world === 2) {
            pathColor = colors.world2.dash;
        } else if (nodeA.status === 'active' || nodeB.status === 'active') {
            pathColor = colors.activeNode.bg;
        } else if (nodeA.status === 'locked' || nodeB.status === 'locked') {
            pathColor = colors.lockedNode.dash;
            isDashed = true;
        } else if (nodeA.world === 3 || nodeB.world === 3) {
            pathColor = colors.world3.primary;
        }

        const deltaX = nodeB.x - nodeA.x;
        const deltaY = nodeB.y - nodeA.y;

        const isVertical = Math.abs(deltaX) < 30;
        const wobble = isVertical ? (i % 2 === 0 ? 36 : -36) : 0;

        const c1X = nodeA.x + deltaX * 0.15 + wobble;
        const c1Y = nodeA.y + deltaY * 0.65;
        const c2X = nodeB.x - deltaX * 0.15 - wobble;
        const c2Y = nodeA.y + deltaY * 0.35;

        const steps = 14;
        const curveDots = [];
        for (let s = 1; s < steps; s++) {
            if (isDashed && s % 2 === 1) continue;
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

            {/* Subheader: Active Level and Total Stars */}
            <View style={styles.infoSubHeader}>
                <View style={styles.activeLevelIndicator}>
                    <View style={styles.activeDot} />
                    <Text style={styles.activeLevelIndicatorText} numberOfLines={1}>Active: Level {activeLevelNumber}</Text>
                </View>
                <View style={styles.totalStarsPill}>
                    <Text style={styles.totalStarsText}>⭐ {totalEarnedStars}/60 Stars</Text>
                </View>
            </View>

            {/* Serpentine Map Path Content */}
            <ScrollView
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[styles.mapScrollContent, { minHeight: totalCanvasHeight }]}
            >
                {/* Connecting Winding Road Paths */}
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                    {renderedPaths.map((p) =>
                        p.dots.map((d) => (
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
                        const nodeWidth = item.status === 'active' ? 76 : 50;
                        const leftOffset = (width - 40) * item.xRatio + 20 - nodeWidth / 2;

                        return (
                            <View
                                key={`node_wrapper_${item.level}`}
                                style={[
                                    styles.nodeRow,
                                    { height: item.status === 'active' ? 108 : (item.level === 1 ? 96 : 80) },
                                ]}
                            >
                                <View style={[styles.nodeAbsoluteContainer, { left: leftOffset }]}>
                                    <MapLevelNode
                                        level={item.level}
                                        status={item.status}
                                        stars={item.stars}
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

                {/* Bottom Padding */}
                <View style={{ height: 140 }} />
            </ScrollView>

            {/* Sticky Bottom Action Bar */}
            <View style={[styles.bottomBarWrapper, { paddingBottom: Math.max(insets.bottom, 12) }]}>
                <View style={styles.bottomBar}>
                    {/* Selected Level Info */}
                    <View style={styles.bottomBarLeft}>
                        <View style={styles.stageLevelBadge}>
                            <Text style={styles.stageLevelText}>LVL {selectedLevel}</Text>
                        </View>
                        <View style={styles.stageDetails}>
                            <View style={styles.activeStageTag}>
                                <Text style={styles.activeStageTagText} numberOfLines={1}>SELECTED LEVEL</Text>
                            </View>
                            <Text style={styles.stageName} numberOfLines={1}>
                                {selectedNodeInfo.title || `Level ${selectedLevel} Challenge`}
                            </Text>
                        </View>
                    </View>

                    {/* Play Level Action Button */}
                    <TouchableOpacity
                        style={styles.playLevelButton}
                        activeOpacity={0.88}
                        onPress={handlePlaySelectedLevel}
                    >
                        <Text style={styles.playButtonText} numberOfLines={1}>PLAY LEVEL {selectedLevel} ▶</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Star Requirement Locked Modal with 300 Coin Unlock */}
            <StarRequirementModal
                visible={showStarModal}
                requiredStars={11}
                currentStars={world1Stars}
                targetLevel={6}
                previousLevelsRange="Levels 1–5"
                unlockCoinsCost={300}
                playerCoins={playerCoins}
                onUnlockWithCoins={() => handleUnlockWithCoins(6)}
                onReplay={() => setShowStarModal(false)}
                onClose={() => setShowStarModal(false)}
            />

            {/* Level Locked Custom Modal */}
            <LevelLockedModal
                visible={lockedModal.visible}
                targetLevel={lockedModal.targetLevel}
                requiredLevel={lockedModal.requiredLevel}
                title={lockedModal.title}
                message={lockedModal.message}
                onClose={() => setLockedModal((prev) => ({ ...prev, visible: false }))}
            />
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
    subHeaderRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    coinsPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
    },
    coinsPillText: {
        color: '#B45309',
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
        paddingHorizontal: 10,
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
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'visible',
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
});

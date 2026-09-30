import React, { useCallback, useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    BackHandler,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import images from '../../constants/images';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';
import StarRequirementModal from '../../components/game/StarRequirementModal';
import PurchaseSuccessModal from '../../components/game/PurchaseSuccessModal';
import InsufficientCoinsModal from '../../components/game/InsufficientCoinsModal';
import progressRepository from '../../database/repositories/progressRepository';
import questionRepository from '../../database/repositories/questionRepository';
import playerRepository from '../../database/repositories/playerRepository';
import HapticService from '../../utils/HapticService';

const { width, height } = Dimensions.get('window');

export default function LevelCompleteScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();

    const levelNumber = Number(route?.params?.level) || 1;
    const timeTaken = route?.params?.timeTaken || '00:12';
    const stars = Number(route?.params?.stars) || 3;
    const title = route?.params?.title || 'Mastermind!';
    const gameTitle = route?.params?.game || 'Word Jumble';

    // Calculate coin reward: 3 stars -> 100 coins, 2 stars -> 70 coins, 1 star -> 50 coins
    const earnedCoins = route?.params?.coins !== undefined
        ? Number(route?.params?.coins)
        : progressRepository.getCoinRewardForStars(stars);

    // Dynamic total levels state (queried from SQLite questions table)
    const [maxLevels, setMaxLevels] = useState(
        Number(route?.params?.totalLevels) || 20
    );

    // Modals state
    const [showStarModal, setShowStarModal] = useState(false);
    const [purchaseSuccessModal, setPurchaseSuccessModal] = useState({
        visible: false,
        level: 6,
        cost: 300,
        remainingCoins: 0,
    });
    const [insufficientCoinsModal, setInsufficientCoinsModal] = useState({
        visible: false,
        level: 6,
        requiredCoins: 300,
        currentCoins: 0,
    });
    const [world1Stars, setWorld1Stars] = useState(0);
    const [playerCoins, setPlayerCoins] = useState(100);
    const [unlockedLevels, setUnlockedLevels] = useState([]);

    const gameId = gameTitle === 'Color Match'
        ? '2'
        : (gameTitle === 'Math Quiz' || gameTitle === 'Maths Challenge')
        ? '3'
        : (gameTitle === 'Memory Cards' || gameTitle === 'Memory Challenge' || gameTitle === 'Memory')
        ? '4'
        : '1';

    // Fetch live progress, unlocked levels, dynamic total levels, and profile coins
    const fetchGameStatus = useCallback(async () => {
        try {
            // 1. Fetch dynamic total levels available for this game
            const dynamicTotal = await questionRepository.getTotalLevelsForGame(gameId);
            if (dynamicTotal && dynamicTotal > 0) {
                setMaxLevels(dynamicTotal);
            }

            // 2. Calculate World 1 (levels 1-5) total stars
            const progressList = await progressRepository.getPlayerProgress('local_player', gameId);
            let total = 0;
            if (Array.isArray(progressList)) {
                progressList.forEach((p) => {
                    const lvl = Number(p.level_number);
                    if (lvl >= 1 && lvl <= 5 && Number(p.is_completed) === 1) {
                        total += Number(p.stars) || 0;
                    }
                });
            }
            setWorld1Stars(total);

            // 3. Fetch coin unlocks
            const unlocks = await progressRepository.getUnlockedLevels('local_player', gameId);
            setUnlockedLevels(unlocks || []);

            // 4. Fetch profile coins
            const profile = await playerRepository.getPlayerProfile('local_player');
            if (profile) {
                setPlayerCoins(Number(profile.coins) || 0);
            }

            return { totalStars: total, unlocks };
        } catch (err) {
            console.error('Error checking level complete status:', err);
            return { totalStars: 0, unlocks: [] };
        }
    }, [gameId]);

    useEffect(() => {
        HapticService.success();
        fetchGameStatus();
    }, [fetchGameStatus]);

    const isLastLevel = levelNumber >= maxLevels;

    // Proceed to next level helper
    const navigateToGameLevel = (lvl) => {
        HapticService.selection();
        const targetGameScreen = gameTitle === 'Color Match'
            ? 'ColorMatchScreen'
            : (gameTitle === 'Math Quiz' || gameTitle === 'Maths Challenge')
            ? 'MathQuizScreen'
            : (gameTitle === 'Memory Cards' || gameTitle === 'Memory Challenge' || gameTitle === 'Memory')
            ? 'MemoryChallengeScreen'
            : 'WordPuzzleScreen';

        navigation.reset({
            index: 2,
            routes: [
                { name: 'BottomNavigation' },
                { name: 'SelectLevel', params: { level: lvl, game: gameTitle } },
                { name: targetGameScreen, params: { level: lvl, game: gameTitle } },
            ],
        });
    };

    // Continue to Next Level
    const handleContinue = async () => {
        HapticService.selection();

        if (levelNumber >= maxLevels) {
            Alert.alert(
                'Game Complete! 🏆',
                `Congratulations! You have completed all ${maxLevels} levels of ${gameTitle}!`,
                [
                    {
                        text: 'Back to Level Map',
                        onPress: handleHome,
                    },
                ]
            );
            return;
        }

        const nextLevel = levelNumber + 1;

        // If completing Level 5 and moving to Level 6:
        // Must either have >= 11 stars in World 1 or have unlocked Level 6 with 300 coins
        if (nextLevel === 6) {
            const status = await fetchGameStatus();
            const isQualified = status.totalStars >= 11;
            const isCoinUnlocked = (status.unlocks || []).includes(6);

            if (!isQualified && !isCoinUnlocked) {
                setShowStarModal(true);
                return;
            }
        }

        navigateToGameLevel(nextLevel);
    };

    // Handle unlocking level with 300 coins from modal
    const handleUnlockWithCoins = async () => {
        const result = await progressRepository.unlockLevelWithCoins({
            profileId: 'local_player',
            gameId,
            levelNumber: 6,
            cost: 300,
        });

        if (result.success) {
            HapticService.success();
            setShowStarModal(false);
            setPlayerCoins(result.remainingCoins);
            setUnlockedLevels((prev) => [...prev, 6]);
            setPurchaseSuccessModal({
                visible: true,
                level: 6,
                cost: 300,
                remainingCoins: result.remainingCoins,
            });
        } else {
            HapticService.error();
            setInsufficientCoinsModal({
                visible: true,
                level: 6,
                requiredCoins: 300,
                currentCoins: playerCoins,
            });
        }
    };

    // Navigate to Level Map / Home
    const handleHome = useCallback(() => {
        HapticService.selection();
        navigation.reset({
            index: 1,
            routes: [
                { name: 'BottomNavigation' },
                { name: 'SelectLevel', params: { level: Math.min(levelNumber + (levelNumber < maxLevels ? 1 : 0), maxLevels), game: gameTitle } },
            ],
        });
    }, [navigation, levelNumber, gameTitle, maxLevels]);

    // Intercept hardware back button to navigate home
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                handleHome();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [handleHome])
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom, 24) },
                ]}
            >
                {/* 1. Top Trophy Hero Artwork Banner */}
                <View style={styles.heroBannerContainer}>
                    <Image
                        source={images.trophy}
                        style={styles.trophyBannerImage}
                        resizeMode="cover"
                    />
                </View>

                {/* 2. Main White Bottom Card */}
                <View style={styles.cardContainer}>

                    {/* Level Banner Subtitle & Title */}
                    <Text style={styles.levelSubtitle}>
                        {levelNumber >= 21 ? 'ROYAL BOSS SUMMIT COMPLETE 👑' : `LEVEL ${levelNumber} COMPLETE`}
                    </Text>
                    <Text style={styles.mainTitle}>
                        {levelNumber >= 21 ? 'Ultimate Conqueror! 🏆' : title}
                    </Text>

                    {/* Earned Stars Rating */}
                    <View style={styles.starsRow}>
                        {[1, 2, 3].map((starNum) => {
                            const isEarned = starNum <= stars;
                            return (
                                <Image
                                    key={`star_${starNum}`}
                                    source={isEarned ? images.starfilled : images.star}
                                    style={[
                                        styles.starIconImage,
                                        !isEarned && styles.starDimmed,
                                    ]}
                                    resizeMode="contain"
                                />
                            );
                        })}
                    </View>

                    {/* Stats Cards Row: Time Taken & Coins Earned */}
                    <View style={styles.statsRow}>
                        {/* Time Taken Stat Card */}
                        <View style={styles.statCard}>
                            <View style={styles.statHeader}>
                                <Text style={styles.clockIcon}>⏱</Text>
                                <Text style={styles.statLabel}>TIME</Text>
                            </View>
                            <Text style={styles.statValue}>{timeTaken}</Text>
                        </View>

                        {/* Coins Earned Stat Card */}
                        <View style={[styles.statCard, styles.coinsCard]}>
                            <View style={styles.statHeader}>
                                <Text style={styles.coinIconEmoji}>🪙</Text>
                                <Text style={[styles.statLabel, { color: '#B45309' }]}>COINS</Text>
                            </View>
                            <Text style={[styles.statValue, { color: '#B45309' }]}>
                                +{earnedCoins}
                            </Text>
                        </View>
                    </View>

                    {/* Total Coin Balance Badge */}
                    <View style={styles.balancePill}>
                        <Text style={styles.balanceText}>Total Balance: {playerCoins} 🪙</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Continue / Finish Button */}
                        <TouchableOpacity
                            style={styles.continueButton}
                            activeOpacity={0.88}
                            onPress={handleContinue}
                        >
                            <Text style={styles.continueText}>
                                {isLastLevel ? 'Finish Game' : 'Continue'}
                            </Text>
                        </TouchableOpacity>

                        {/* Home Button */}
                        <TouchableOpacity
                            style={styles.homeButton}
                            activeOpacity={0.85}
                            onPress={handleHome}
                        >
                            <Text style={styles.homeText}>Home</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>

            {/* Star Requirement / 300 Coin Unlock Modal */}
            <StarRequirementModal
                visible={showStarModal}
                requiredStars={11}
                currentStars={world1Stars}
                targetLevel={6}
                previousLevelsRange="Levels 1–5"
                unlockCoinsCost={300}
                playerCoins={playerCoins}
                onUnlockWithCoins={handleUnlockWithCoins}
                onReplay={handleHome}
                onClose={() => setShowStarModal(false)}
            />

            {/* Level Purchase Success Custom Modal */}
            <PurchaseSuccessModal
                visible={purchaseSuccessModal.visible}
                level={purchaseSuccessModal.level}
                cost={purchaseSuccessModal.cost}
                remainingCoins={purchaseSuccessModal.remainingCoins}
                onPlayLevel={() => {
                    setPurchaseSuccessModal((prev) => ({ ...prev, visible: false }));
                    navigateToGameLevel(6);
                }}
                onClose={() => {
                    setPurchaseSuccessModal((prev) => ({ ...prev, visible: false }));
                    handleHome();
                }}
            />

            {/* Insufficient Coins Custom Modal */}
            <InsufficientCoinsModal
                visible={insufficientCoinsModal.visible}
                level={insufficientCoinsModal.level}
                requiredCoins={insufficientCoinsModal.requiredCoins}
                currentCoins={insufficientCoinsModal.currentCoins}
                onReplay={() => {
                    setInsufficientCoinsModal((prev) => ({ ...prev, visible: false }));
                    handleHome();
                }}
                onClose={() => setInsufficientCoinsModal((prev) => ({ ...prev, visible: false }))}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkPurple || '#1E1B4B',
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    heroBannerContainer: {
        width: width,
        height: height * 0.40,
        backgroundColor: colors.darkPurple || '#1E1B4B',
        position: 'relative',
    },
    trophyBannerImage: {
        width: '100%',
        height: '100%',
    },
    cardContainer: {
        flex: 1,
        backgroundColor: colors.white,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 20,
        alignItems: 'center',
        marginTop: -30,
    },
    levelSubtitle: {
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.primary,
        letterSpacing: 1.5,
        marginBottom: 6,
        textAlign: 'center',
    },
    mainTitle: {
        fontSize: 28,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
        marginBottom: 8,
        textAlign: 'center',
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },
    starIconImage: {
        width: 38,
        height: 38,
    },
    starDimmed: {
        opacity: 0.35,
    },
    statsRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginBottom: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: colors.primaryLight,
        borderRadius: 20,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    coinsCard: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1.5,
        borderColor: '#FDE68A',
    },
    statHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        marginBottom: 4,
    },
    clockIcon: {
        fontSize: 14,
        color: colors.primary,
    },
    coinIconEmoji: {
        fontSize: 14,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.gray,
        letterSpacing: 0.8,
    },
    statValue: {
        fontSize: 24,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
    },
    balancePill: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 14,
        paddingVertical: 6,
        borderRadius: 14,
        marginBottom: 24,
    },
    balanceText: {
        fontSize: 13,
        fontFamily: fonts.semiBold,
        color: '#64748B',
    },
    buttonGroup: {
        width: '100%',
        gap: 12,
    },
    continueButton: {
        width: '100%',
        height: 54,
        borderRadius: 20,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    continueText: {
        fontSize: 17,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
    homeButton: {
        width: '100%',
        height: 54,
        borderRadius: 20,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.grayBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeText: {
        fontSize: 17,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.primary,
    },
});

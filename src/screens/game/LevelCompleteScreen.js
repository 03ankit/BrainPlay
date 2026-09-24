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
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import images from '../../constants/images';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';
import StarRequirementModal from '../../components/game/StarRequirementModal';
import progressRepository from '../../database/repositories/progressRepository';

const { width, height } = Dimensions.get('window');

export default function LevelCompleteScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();

    const levelNumber = Number(route?.params?.level) || 12;
    const timeTaken = route?.params?.timeTaken || '00:12';
    const stars = Number(route?.params?.stars) || 3;
    const title = route?.params?.title || 'Mastermind!';
    const gameTitle = route?.params?.game || 'Word Jumble';

    // Star requirement modal state
    const [showStarModal, setShowStarModal] = useState(false);
    const [world1Stars, setWorld1Stars] = useState(0);

    const gameId = gameTitle === 'Color Match' ? '2' : (gameTitle === 'Math Quiz' || gameTitle === 'Maths Challenge') ? '3' : '1';

    // Calculate World 1 (levels 1-5) total stars
    const fetchWorld1Stars = useCallback(async () => {
        try {
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
            return total;
        } catch (err) {
            console.error('Error checking stars progress:', err);
            return 0;
        }
    }, [gameId]);

    useEffect(() => {
        fetchWorld1Stars();
    }, [fetchWorld1Stars]);

    // Continue to Next Level
    const handleContinue = async () => {
        const nextLevel = levelNumber + 1;

        // If completing Level 5 and trying to go to Level 6, enforce 11 stars minimum requirement
        if (nextLevel === 6) {
            const currentTotalStars = await fetchWorld1Stars();
            if (currentTotalStars < 11) {
                setShowStarModal(true);
                return;
            }
        }

        const targetGameScreen = gameTitle === 'Color Match'
            ? 'ColorMatchScreen'
            : (gameTitle === 'Math Quiz' || gameTitle === 'Maths Challenge')
            ? 'MathQuizScreen'
            : 'WordPuzzleScreen';

        navigation.reset({
            index: 2,
            routes: [
                { name: 'BottomNavigation' },
                { name: 'SelectLevel', params: { level: nextLevel, game: gameTitle } },
                { name: targetGameScreen, params: { level: nextLevel, game: gameTitle } },
            ],
        });
    };

    // Navigate to Level Map / Home
    const handleHome = () => {
        navigation.reset({
            index: 1,
            routes: [
                { name: 'BottomNavigation' },
                { name: 'SelectLevel', params: { level: levelNumber + 1, game: gameTitle } },
            ],
        });
    };

    // Intercept hardware back button to navigate home instead of returning to completed puzzle screen
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                handleHome();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [levelNumber, gameTitle])
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
                        LEVEL {levelNumber} COMPLETE
                    </Text>
                    <Text style={styles.mainTitle}>{title}</Text>

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

                    {/* Time Taken Stat Card */}
                    <View style={styles.statCard}>
                        <View style={styles.statRow}>
                            <Text style={styles.clockIcon}>⏱</Text>
                            <Text style={styles.statLabel}>TIME TAKEN</Text>
                        </View>
                        <Text style={styles.statValue}>{timeTaken}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Continue Button */}
                        <TouchableOpacity
                            style={styles.continueButton}
                            activeOpacity={0.88}
                            onPress={handleContinue}
                        >
                            <Text style={styles.continueText}>Continue</Text>
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

            {/* Star Requirement Locked Modal */}
            <StarRequirementModal
                visible={showStarModal}
                requiredStars={11}
                currentStars={world1Stars}
                targetLevel={6}
                previousLevelsRange="Levels 1–5"
                onReplay={handleHome}
                onClose={() => setShowStarModal(false)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkPurple || '#1E1B4B', // Deep dark purple background matching top artwork
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    heroBannerContainer: {
        width: width,
        height: height * 0.42,
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
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 20,
        alignItems: 'center',
        marginTop: -30, // Overlap banner smoothly
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
        fontSize: 30,
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
        marginBottom: 20,
    },
    starIconImage: {
        width: 38,
        height: 38,
    },
    starDimmed: {
        opacity: 0.35,
    },
    statCard: {
        width: '100%',
        backgroundColor: colors.primaryLight,
        borderRadius: 22,
        paddingVertical: 18,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    clockIcon: {
        fontSize: 15,
        color: colors.primary,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.gray,
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 28,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
    },
    buttonGroup: {
        width: '100%',
        gap: 14,
    },
    continueButton: {
        width: '100%',
        height: 56,
        borderRadius: 22,
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
        height: 56,
        borderRadius: 22,
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

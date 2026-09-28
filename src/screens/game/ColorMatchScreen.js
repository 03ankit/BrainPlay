import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    BackHandler,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import GameHeader from '../../components/game/GameHeader';
import GameTimer from '../../components/game/GameTimer';
import ExitGameModal from '../../components/game/ExitGameModal';
import TimeUpModal from '../../components/game/TimeUpModal';
import IncorrectModal from '../../components/game/IncorrectModal';
import progressRepository from '../../database/repositories/progressRepository';
import playerRepository from '../../database/repositories/playerRepository';
import streakRepository from '../../database/repositories/streakRepository';
import { getLevelChallenge } from '../../data/colorMatchData';

const { width } = Dimensions.get('window');

export default function ColorMatchScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const selectedLevel = Number(route?.params?.level) || 1;
    const gameTitle = route?.params?.game || 'Color Match';

    const levelChallenge = getLevelChallenge(selectedLevel);
    const initialSeconds = levelChallenge.timeLimitSeconds || 15;

    // Game state
    const [currentQuestion, setCurrentQuestion] = useState(levelChallenge);
    const [isCompleted, setIsCompleted] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    // Modals
    const [showExitModal, setShowExitModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    const questionStartTimeRef = useRef(Date.now());
    const isProcessingRef = useRef(false);

    // Reset challenge when selectedLevel changes
    useEffect(() => {
        const challenge = getLevelChallenge(selectedLevel);
        setCurrentQuestion(challenge);
        setIsCompleted(false);
        setTimerKey((prev) => prev + 1);
        questionStartTimeRef.current = Date.now();
        isProcessingRef.current = false;
    }, [selectedLevel]);

    // Hardware Back Button Handler
    useEffect(() => {
        const backAction = () => {
            if (isFocused && !isCompleted) {
                setShowExitModal(true);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            backAction
        );
        return () => backHandler.remove();
    }, [isFocused, isCompleted]);

    // Timer expires callback
    const handleTimeUp = useCallback(() => {
        if (isCompleted || !isFocused) return;
        setShowTimeUpModal(true);
    }, [isCompleted, isFocused]);

    // Check Answer Handler
    const handleAnswer = async (userPressedMatch) => {
        if (isProcessingRef.current || isCompleted) return;
        isProcessingRef.current = true;

        const isCorrect = userPressedMatch === currentQuestion.isMatch;

        if (isCorrect) {
            setIsCompleted(true);

            // Calculate elapsed time
            const elapsedSecs = Math.max(
                1,
                Math.round((Date.now() - questionStartTimeRef.current) / 1000)
            );
            const mins = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
            const secs = String(elapsedSecs % 60).padStart(2, '0');
            const formattedTime = `${mins}:${secs}`;

            // Stars calculation: 3 stars if answered quickly, 2 stars if answered within time
            let earnedStars = 3;
            if (elapsedSecs > initialSeconds * 0.7) {
                earnedStars = 2;
            }

            const pointsEarned = earnedStars * 100;
            const earnedCoins = progressRepository.getCoinRewardForStars(earnedStars);

            // Save to SQLite progressRepository
            try {
                await progressRepository.savePlayerProgress({
                    profileId: 'local_player',
                    gameId: '2', // Game ID '2' is Color Match
                    levelNumber: selectedLevel,
                    stars: earnedStars,
                    highScore: pointsEarned,
                    isCompleted: 1,
                });

                // Update player coins & XP
                await playerRepository.updatePlayerStats('local_player', {
                    coins: earnedCoins,
                    xp: earnedStars * 50,
                });

                // Automatically record activity for the 7-day regular daily streak
                await streakRepository.recordDailyActivity('local_player', '2', selectedLevel);
            } catch (err) {
                console.log('Error saving Color Match level progress:', err);
            }

            // Transition to LevelCompleteScreen
            setTimeout(() => {
                navigation.replace('LevelCompleteScreen', {
                    level: selectedLevel,
                    stars: earnedStars,
                    score: pointsEarned,
                    coins: earnedCoins,
                    game: 'Color Match',
                    timeTaken: formattedTime,
                    title: earnedStars === 3 ? 'Mastermind!' : earnedStars === 2 ? 'Great Job!' : 'Level Cleared!',
                });
            }, 300);
        } else {
            // Incorrect answer - show modal immediately without extra shake
            setShowIncorrectModal(true);
            isProcessingRef.current = false;
        }
    };

    // Retry callbacks
    const handleRetry = () => {
        setShowTimeUpModal(false);
        setShowIncorrectModal(false);
        setIsCompleted(false);
        setTimerKey((prev) => prev + 1);
        questionStartTimeRef.current = Date.now();
        isProcessingRef.current = false;
    };

    const handleExitToMap = () => {
        setShowExitModal(false);
        setShowTimeUpModal(false);
        setShowIncorrectModal(false);
        navigation.reset({
            index: 1,
            routes: [
                { name: 'BottomNavigation' },
                { name: 'SelectLevel', params: { level: selectedLevel, game: 'Color Match' } },
            ],
        });
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Header matching Word Jumble (BrainPlay, Avatar back, Lv. X badge) */}
            <GameHeader
                level={selectedLevel}
                onBack={() => setShowExitModal(true)}
            />

            {/* Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Circular Timer matching Word Jumble */}
                <GameTimer
                    initialSeconds={initialSeconds}
                    onTimeUp={handleTimeUp}
                    questionId={selectedLevel}
                    resetKey={timerKey}
                    isPaused={!isFocused || isCompleted || showTimeUpModal || showIncorrectModal}
                />

                {/* Central Stroop Question Card */}
                <View style={styles.cardWrapper}>
                    <View style={styles.card}>
                        <Text style={styles.cardQuestionLabel}>
                            DOES THE TEXT MATCH THE COLOR?
                        </Text>

                        {/* Big Bold Stroop Color Text */}
                        <Text
                            style={[
                                styles.stroopWord,
                                { color: currentQuestion?.inkColorHex || '#EF4444' },
                            ]}
                        >
                            {currentQuestion?.word || 'BLUE'}
                        </Text>
                    </View>

                    {/* Subtitle Instruction */}
                    <Text style={styles.instructionText}>
                        Tap <Text style={styles.boldText}>MATCH</Text> if the meaning matches the ink color.
                    </Text>
                </View>

                {/* Bottom Action Buttons: NO MATCH & MATCH */}
                <View style={styles.bottomButtonRow}>
                    {/* NO MATCH Button */}
                    <TouchableOpacity
                        style={styles.noMatchButton}
                        activeOpacity={0.82}
                        onPress={() => handleAnswer(false)}
                    >
                        <Text style={styles.noMatchText}>✕  NO MATCH</Text>
                    </TouchableOpacity>

                    {/* MATCH Button */}
                    <TouchableOpacity
                        style={styles.matchButton}
                        activeOpacity={0.82}
                        onPress={() => handleAnswer(true)}
                    >
                        <Text style={styles.matchText}>✓  MATCH</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Exit Confirmation Modal */}
            <ExitGameModal
                visible={showExitModal}
                onConfirmExit={handleExitToMap}
                onCancel={() => setShowExitModal(false)}
            />

            {/* Time Up Modal */}
            <TimeUpModal
                visible={showTimeUpModal}
                level={selectedLevel}
                message={`Time ran out for Level ${selectedLevel}. Try again!`}
                onRetry={handleRetry}
                onLevelMap={handleExitToMap}
            />

            {/* Incorrect Answer Modal */}
            <IncorrectModal
                visible={showIncorrectModal}
                level={selectedLevel}
                message={`That was not the correct match for Level ${selectedLevel}. Try again!`}
                onTryAgain={handleRetry}
                onLevelMap={handleExitToMap}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
        alignItems: 'center',
    },

    // Central Card
    cardWrapper: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 14,
    },
    card: {
        width: '100%',
        minHeight: 280,
        backgroundColor: colors.white,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 36,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 18,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#E2E8F0',
    },
    cardQuestionLabel: {
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '700',
        color: '#475569',
        letterSpacing: 1.4,
        textAlign: 'center',
        marginBottom: 32,
    },
    stroopWord: {
        fontSize: 56,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 1.5,
        textAlign: 'center',
    },
    instructionText: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.gray,
        textAlign: 'center',
        marginTop: 18,
        paddingHorizontal: 12,
    },
    boldText: {
        fontWeight: '800',
        color: colors.darkGray,
    },

    // Bottom Action Buttons Row
    bottomButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 18,
    },
    noMatchButton: {
        flex: 1,
        height: 58,
        backgroundColor: colors.white,
        borderRadius: 18,
        borderWidth: 2,
        borderColor: '#FCA5A5',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    noMatchText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#B91C1C',
        letterSpacing: 0.3,
    },
    matchButton: {
        flex: 1,
        height: 58,
        backgroundColor: colors.purplePlay || colors.primary,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    matchText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#FFFFFF',
        letterSpacing: 0.3,
    },
});

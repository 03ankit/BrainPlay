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
import { getLevelChallenge } from '../../data/mathQuizData';
import HapticService from '../../utils/HapticService';

const { width } = Dimensions.get('window');
const OPTION_CARD_WIDTH = (width - 40 - 14) / 2;
const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export default function MathQuizScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const selectedLevel = Number(route?.params?.level) || 1;
    const gameTitle = route?.params?.game || 'Math Quiz';

    const challenge = getLevelChallenge(selectedLevel);
    const initialSeconds = challenge.timeLimitSeconds || 15;

    // Game state
    const [currentQuestion, setCurrentQuestion] = useState(challenge);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    // Modals state
    const [showExitModal, setShowExitModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    const questionStartTimeRef = useRef(Date.now());
    const isProcessingRef = useRef(false);

    // Reset challenge when selectedLevel changes
    useEffect(() => {
        const newChallenge = getLevelChallenge(selectedLevel);
        setCurrentQuestion(newChallenge);
        setSelectedOption(null);
        setIsCompleted(false);
        setTimerKey((prev) => prev + 1);
        questionStartTimeRef.current = Date.now();
        isProcessingRef.current = false;
    }, [selectedLevel]);

    // Hardware back press handler
    useEffect(() => {
        const backAction = () => {
            if (isFocused && !isCompleted) {
                setShowExitModal(true);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => backHandler.remove();
    }, [isFocused, isCompleted]);

    // Timer expires
    const handleTimeUp = useCallback(() => {
        if (isCompleted || !isFocused) return;
        HapticService.warning();
        setShowTimeUpModal(true);
    }, [isCompleted, isFocused]);

    // Handle Option Selection
    const handleSelectOption = (option) => {
        if (isProcessingRef.current || isCompleted) return;
        HapticService.light();
        setSelectedOption(option);
    };

    // Handle Submit Answer
    const handleSubmitAnswer = async () => {
        if (selectedOption === null || isProcessingRef.current || isCompleted) return;
        isProcessingRef.current = true;

        const isCorrect = Number(selectedOption) === Number(currentQuestion.correctAnswer);

        if (isCorrect) {
            HapticService.success();
            setIsCompleted(true);

            // Elapsed time calculation
            const elapsedSecs = Math.max(
                1,
                Math.round((Date.now() - questionStartTimeRef.current) / 1000)
            );
            const mins = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
            const secs = String(elapsedSecs % 60).padStart(2, '0');
            const formattedTime = `${mins}:${secs}`;

            // Stars calculation matching timer ring color:
            // Green (> 50% time left): 3 Stars
            // Orange (25% - 50% time left): 2 Stars
            // Red (<= 25% time left): 1 Star
            let earnedStars = 3;
            if (elapsedSecs > initialSeconds * 0.75) {
                earnedStars = 1; // Red timer zone
            } else if (elapsedSecs > initialSeconds * 0.5) {
                earnedStars = 2; // Orange timer zone
            } else {
                earnedStars = 3; // Green timer zone
            }

            const pointsEarned = currentQuestion.points || (earnedStars * 150);
            const earnedCoins = progressRepository.getCoinRewardForStars(earnedStars);

            // Save to SQLite
            try {
                await progressRepository.savePlayerProgress({
                    profileId: 'local_player',
                    gameId: '3', // Game ID '3' for Math Quiz
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
                await streakRepository.recordDailyActivity('local_player', '3', selectedLevel);
            } catch (err) {
                console.log('Error saving Math Quiz progress:', err);
            }

            // Transition to LevelCompleteScreen
            setTimeout(() => {
                navigation.replace('LevelCompleteScreen', {
                    level: selectedLevel,
                    stars: earnedStars,
                    score: pointsEarned,
                    coins: earnedCoins,
                    game: 'Math Quiz',
                    timeTaken: formattedTime,
                    title: earnedStars === 3 ? 'Math Master!' : 'Level Cleared!',
                });
            }, 300);
        } else {
            // Incorrect answer
            HapticService.error();
            setShowIncorrectModal(true);
            isProcessingRef.current = false;
        }
    };

    // Retry callback
    const handleRetry = () => {
        HapticService.selection();
        setShowTimeUpModal(false);
        setShowIncorrectModal(false);
        setIsCompleted(false);
        setSelectedOption(null);
        setTimerKey((prev) => prev + 1);
        questionStartTimeRef.current = Date.now();
        isProcessingRef.current = false;
    };

    // Exit to Level Map
    const handleExitToMap = () => {
        setShowExitModal(false);
        setShowTimeUpModal(false);
        setShowIncorrectModal(false);
        navigation.reset({
            index: 1,
            routes: [
                { name: 'BottomNavigation' },
                { name: 'SelectLevel', params: { level: selectedLevel, game: 'Math Quiz' } },
            ],
        });
    };

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Standard GameHeader matching Word Jumble & Color Match */}
            <GameHeader
                level={selectedLevel}
                onBack={() => setShowExitModal(true)}
            />

            {/* Scrollable Game Area */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Circular GameTimer matching ColorMatchScreen & WordPuzzleScreen */}
                <GameTimer
                    initialSeconds={initialSeconds}
                    onTimeUp={handleTimeUp}
                    questionId={selectedLevel}
                    resetKey={timerKey}
                    isPaused={!isFocused || isCompleted || showTimeUpModal || showIncorrectModal}
                />

                {/* Central Math Question Card */}
                <View style={styles.cardWrapper}>
                    <View style={styles.card}>
                        {/* Category Label */}
                        <Text style={styles.cardQuestionLabel}>
                            {currentQuestion.category || 'ARITHMETIC SPEED'}
                        </Text>

                        {/* Large Math Equation */}
                        <Text style={styles.mathExpression} numberOfLines={1} adjustsFontSizeToFit>
                            {currentQuestion.expression}
                        </Text>
                    </View>

                    {/* Subtitle Instruction */}
                    <Text style={styles.instructionText}>
                        Select your answer and press <Text style={styles.boldText}>Submit Answer</Text>.
                    </Text>
                </View>

                {/* 2x2 Option Buttons Grid */}
                <View style={styles.optionsGrid}>
                    {currentQuestion.options.map((option, index) => {
                        const label = OPTION_LABELS[index] || 'A';
                        const isSelected = selectedOption === option;

                        return (
                            <TouchableOpacity
                                key={`math_opt_${index}_${option}`}
                                style={[
                                    styles.optionCard,
                                    isSelected && styles.optionCardSelected,
                                ]}
                                activeOpacity={0.82}
                                onPress={() => handleSelectOption(option)}
                            >
                                <Text style={[
                                    styles.optionLabel,
                                    isSelected && styles.optionLabelSelected,
                                ]}>
                                    {label}
                                </Text>
                                <Text
                                    style={[
                                        styles.optionValue,
                                        isSelected && styles.optionValueSelected,
                                    ]}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </ScrollView>

            {/* Fixed Bottom Submit Button matching theme */}
            <View style={[styles.bottomButtonContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
                <TouchableOpacity
                    style={[
                        styles.submitButton,
                        selectedOption === null && styles.submitButtonDisabled,
                    ]}
                    activeOpacity={0.88}
                    onPress={handleSubmitAnswer}
                    disabled={selectedOption === null || isProcessingRef.current || isCompleted}
                >
                    <Text style={styles.submitButtonText}>SUBMIT ANSWER</Text>
                    <Text style={styles.submitButtonArrow}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Exit Confirmation Modal */}
            <ExitGameModal
                visible={showExitModal}
                title="Exit Game?"
                message="Are you sure you want to exit? Your current level progress will be lost."
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
                message={`That was not the correct answer for Level ${selectedLevel}. Try again!`}
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
        paddingBottom: 24,
        alignItems: 'center',
    },

    // Central Question Card matching ColorMatchScreen
    cardWrapper: {
        width: '100%',
        alignItems: 'center',
        marginVertical: 14,
    },
    card: {
        width: '100%',
        minHeight: 200,
        backgroundColor: colors.white,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 28,
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
        marginBottom: 16,
    },
    mathExpression: {
        fontSize: 44,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 1.5,
        textAlign: 'center',
        color: colors.darkBlue || '#1E293B',
    },
    instructionText: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.gray,
        textAlign: 'center',
        marginTop: 16,
        paddingHorizontal: 12,
    },
    boldText: {
        fontWeight: '800',
        color: colors.darkGray,
    },

    // 2x2 Answer Grid matching application theme
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        rowGap: 14,
        marginTop: 8,
    },
    optionCard: {
        width: OPTION_CARD_WIDTH,
        height: 84,
        backgroundColor: colors.white,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 2,
    },
    optionCardSelected: {
        borderColor: colors.purplePlay || colors.primary,
        backgroundColor: '#EFF6FF',
        borderWidth: 2,
        shadowOpacity: 0.25,
        elevation: 4,
    },
    optionLabel: {
        position: 'absolute',
        top: 10,
        left: 14,
        fontSize: 12,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#64748B',
    },
    optionLabelSelected: {
        color: colors.purplePlay || colors.primary,
    },
    optionValue: {
        fontSize: 28,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue || '#1E293B',
        textAlign: 'center',
    },
    optionValueSelected: {
        color: colors.purplePlay || colors.primary,
    },

    // Bottom Action Button Container
    bottomButtonContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
        backgroundColor: colors.background,
    },
    submitButton: {
        height: 56,
        backgroundColor: colors.purplePlay || colors.primary,
        borderRadius: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 5,
    },
    submitButtonDisabled: {
        backgroundColor: '#CBD5E1',
        shadowOpacity: 0.05,
    },
    submitButtonText: {
        color: colors.white,
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.8,
    },
    submitButtonArrow: {
        color: colors.white,
        fontSize: 18,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
});

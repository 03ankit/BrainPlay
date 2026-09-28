import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Text,
    TouchableOpacity,
    BackHandler,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import GameHeader from '../../components/game/GameHeader';
import GameTimer from '../../components/game/GameTimer';
import LetterButtons from '../../components/game/LetterButtons';
import AnswerBoxes from '../../components/game/AnswerBoxes';
import GameClue from '../../components/game/GameClue';
import GameButtons from '../../components/game/GameButtons';
import ExitGameModal from '../../components/game/ExitGameModal';
import TimeUpModal from '../../components/game/TimeUpModal';
import IncorrectModal from '../../components/game/IncorrectModal';
import questionRepository from '../../database/repositories/questionRepository';
import gameHistoryRepository from '../../database/repositories/gameHistoryRepository';
import progressRepository from '../../database/repositories/progressRepository';
import playerRepository from '../../database/repositories/playerRepository';
import streakRepository from '../../database/repositories/streakRepository';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';
import WORD_PUZZLE_QUESTIONS from '../../data/wordPuzzleQuestions';


const FALLBACK_QUESTIONS = WORD_PUZZLE_QUESTIONS;

// Helper to safely parse options array
const getCleanLetterArray = (q) => {
    if (!q) return [];
    let opts = q.options;
    if (typeof opts === 'string') {
        try {
            opts = JSON.parse(opts);
        } catch (e) {
            opts = null;
        }
    }
    if (Array.isArray(opts) && opts.length >= (q.word ? q.word.length : 1)) {
        return opts.map((c) => String(c).toUpperCase());
    }
    return String(q.word || '').toUpperCase().split('');
};

// Fisher-Yates shuffle helper
const shuffleArray = (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
};

export default function WordPuzzleScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const selectedLevel = Number(route?.params?.level) || 1;

    // Game state
    const [playerLevel, setPlayerLevel] = useState(selectedLevel);
    const [currentQuestion, setCurrentQuestion] = useState(() => {
        const fallbackIdx = (selectedLevel - 1) % FALLBACK_QUESTIONS.length;
        return FALLBACK_QUESTIONS[fallbackIdx] || null;
    });
    const [availableLetters, setAvailableLetters] = useState([]);
    const [selectedLetters, setSelectedLetters] = useState([]);

    // Timing & score state
    const [hintsUsed, setHintsUsed] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());

    // Exit, Time Up & Incorrect Modal state
    const [showExitModal, setShowExitModal] = useState(false);
    const [pendingTarget, setPendingTarget] = useState(null);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    // 1. Fetch single question for the selected level
    useEffect(() => {
        const loadLevelQuestion = async () => {
            setPlayerLevel(selectedLevel);
            try {
                // Query SQLite database for question corresponding to selected level
                const dbQuestion = await questionRepository.getQuestionByLevel('1', selectedLevel);
                if (dbQuestion) {
                    setCurrentQuestion(dbQuestion);
                    return;
                }

                const allDbQuestions = await questionRepository.getQuestionsForGame('1');
                if (allDbQuestions && allDbQuestions.length > 0) {
                    const found = allDbQuestions.find((q) => Number(q.level_number) === selectedLevel)
                        || allDbQuestions[(selectedLevel - 1) % allDbQuestions.length];
                    setCurrentQuestion(found);
                    return;
                }
            } catch (error) {
                console.log('Error loading level question from DB:', error);
            }

            // Fallback question for this level
            const fallbackIdx = (selectedLevel - 1) % FALLBACK_QUESTIONS.length;
            setCurrentQuestion(FALLBACK_QUESTIONS[fallbackIdx]);
        };

        loadLevelQuestion();
    }, [selectedLevel]);

    // 2. Initialize letter tiles & answer state whenever currentQuestion changes
    const setupQuestion = useCallback((q) => {
        if (!q || !q.word) return;

        const rawChars = getCleanLetterArray(q);
        const shuffled = shuffleArray(rawChars);

        // Assign unique IDs to support duplicate letters (e.g. APPLE)
        const letterObjects = shuffled.map((char, index) => ({
            id: `letter-${index}-${char}-${Math.random().toString(36).substr(2, 5)}`,
            char: String(char).toUpperCase(),
            isSelected: false,
        }));

        setAvailableLetters(letterObjects);
        setSelectedLetters([]);
        setHintsUsed(0);
        setIsCompleted(false);
        setQuestionStartTime(Date.now());
    }, []);

    useEffect(() => {
        if (currentQuestion) {
            setupQuestion(currentQuestion);
        }
    }, [currentQuestion, setupQuestion]);

    // Hardware Back Handler (Android back button)
    useEffect(() => {
        const backAction = () => {
            if (isFocused && !isCompleted) {
                setPendingTarget(null);
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

    // Handle user request to exit (via back icon or bottom tabs)
    const handleRequestExit = (target = null) => {
        setPendingTarget(target);
        setShowExitModal(true);
    };

    // Confirm exit action
    const handleConfirmExit = () => {
        setShowExitModal(false);
        if (pendingTarget) {
            navigation.reset({
                index: 0,
                routes: [{ name: pendingTarget.routeName || 'BottomNavigation', params: pendingTarget.params }],
            });
        } else {
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'BottomNavigation' },
                    { name: 'SelectLevel', params: { level: playerLevel, game: 'Word Jumble' } },
                ],
            });
        }
    };

    // Tapping an available letter tile selects it and displays it in next answer box
    const handleSelectLetter = (letterObj) => {
        if (!currentQuestion || !currentQuestion.word) return;

        if (selectedLetters.length >= currentQuestion.word.length) {
            return; // Don't exceed word length
        }

        // Hide selected letter tile in availableLetters grid
        setAvailableLetters((prev) =>
            prev.map((item) =>
                item.id === letterObj.id ? { ...item, isSelected: true } : item
            )
        );

        // Add to answer boxes
        setSelectedLetters((prev) => [...prev, letterObj]);
    };

    // Tapping a filled answer box removes letter and returns it to available letter tiles
    const handleDeselectLetter = (index) => {
        const letterToRemove = selectedLetters[index];
        if (!letterToRemove) return;

        // Unhide letter tile in availableLetters grid
        setAvailableLetters((prev) =>
            prev.map((item) =>
                item.id === letterToRemove.id ? { ...item, isSelected: false } : item
            )
        );

        // Remove from selectedLetters at index
        setSelectedLetters((prev) => prev.filter((_, i) => i !== index));
    };

    // Timer expires callback
    const handleTimeUp = useCallback(() => {
        if (isCompleted || !isFocused) return;
        setShowTimeUpModal(true);
    }, [isCompleted, isFocused]);

    // Retry callback when time expires
    const handleRetry = useCallback(() => {
        setShowTimeUpModal(false);
        setTimerKey((prev) => prev + 1);
        if (currentQuestion) {
            setupQuestion(currentQuestion);
        }
    }, [setupQuestion, currentQuestion]);

    // Level map / exit callback from time up modal
    const handleTimeUpExit = useCallback(() => {
        setShowTimeUpModal(false);
        navigation.reset({
            index: 1,
            routes: [
                { name: 'BottomNavigation' },
                { name: 'SelectLevel', params: { level: playerLevel, game: 'Word Jumble' } },
            ],
        });
    }, [navigation, playerLevel]);

    // Try again callback from incorrect answer modal
    const handleTryAgain = useCallback(() => {
        setShowIncorrectModal(false);
        if (currentQuestion) {
            setupQuestion(currentQuestion);
        }
    }, [setupQuestion, currentQuestion]);

    // Level map callback from incorrect answer modal
    const handleIncorrectExit = useCallback(() => {
        setShowIncorrectModal(false);
        navigation.reset({
            index: 1,
            routes: [
                { name: 'BottomNavigation' },
                { name: 'SelectLevel', params: { level: playerLevel, game: 'Word Jumble' } },
            ],
        });
    }, [navigation, playerLevel]);

    // Hint button callback
    const handleHint = () => {
        if (!currentQuestion || !currentQuestion.word) return;

        const targetWord = currentQuestion.word.toUpperCase();
        const nextIndex = selectedLetters.length;

        if (nextIndex >= targetWord.length) {
            return;
        }

        const requiredChar = targetWord[nextIndex];

        // Track hint usage for star calculation
        setHintsUsed((prev) => prev + 1);

        // Find an unselected matching letter tile
        const matchingLetter = availableLetters.find(
            (item) => !item.isSelected && item.char.toUpperCase() === requiredChar
        );

        if (matchingLetter) {
            handleSelectLetter(matchingLetter);
        } else {
            Alert.alert('Hint', `The next letter is "${requiredChar}".`);
        }
    };

    // Submit answer callback
    const handleSubmit = async () => {
        if (!currentQuestion || !currentQuestion.word) return;

        const userWord = selectedLetters.map((l) => l.char).join('').toUpperCase();
        const correctWord = currentQuestion.word.toUpperCase();

        if (userWord === correctWord) {
            setIsCompleted(true); // Instantly stops timer

            // Calculate elapsed time
            const elapsedSecs = Math.max(1, Math.floor((Date.now() - questionStartTime) / 1000));
            const minsStr = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
            const secsStr = String(elapsedSecs % 60).padStart(2, '0');
            const formattedTime = `${minsStr}:${secsStr}`;

            // Calculate stars based on hint count:
            // 0 hints = 3 Stars, 1-2 hints = 2 Stars, 3+ hints = 1 Star
            let earnedStars = 3;
            if (hintsUsed === 0) {
                earnedStars = 3;
            } else if (hintsUsed === 1 || hintsUsed === 2) {
                earnedStars = 2;
            } else {
                earnedStars = 1;
            }

            // Calculate coin rewards: 3 stars -> 100, 2 stars -> 70, 1 star -> 50
            const earnedCoins = progressRepository.getCoinRewardForStars(earnedStars);

            // Save session history and level progress to SQLite
            await gameHistoryRepository.saveGameHistory({
                profileId: 'local_player',
                gameId: '1',
                levelNumber: playerLevel,
                score: earnedStars * 100,
                stars: earnedStars,
                accuracy: 100,
            });

            await progressRepository.savePlayerProgress({
                profileId: 'local_player',
                gameId: '1',
                levelNumber: playerLevel,
                stars: earnedStars,
                highScore: earnedStars * 100,
                isCompleted: 1,
            });

            // Update player coins & XP
            try {
                await playerRepository.updatePlayerStats('local_player', {
                    coins: earnedCoins,
                    xp: earnedStars * 50,
                });
            } catch (coinErr) {
                console.log('Error updating player stats on level completion:', coinErr);
            }

            // Automatically record activity for the 7-day regular daily streak
            try {
                await streakRepository.recordDailyActivity('local_player', '1', playerLevel);
            } catch (streakErr) {
                console.log('Error updating daily streak:', streakErr);
            }

            // Navigate to dedicated LevelCompleteScreen
            navigation.navigate('LevelCompleteScreen', {
                level: playerLevel,
                timeTaken: formattedTime,
                stars: earnedStars,
                coins: earnedCoins,
                title: earnedStars === 3 ? 'Mastermind!' : earnedStars === 2 ? 'Great Job!' : 'Level Cleared!',
                game: 'Word Jumble',
            });
        } else {
            setShowIncorrectModal(true);
        }
    };

    const isSubmitDisabled = selectedLetters.length < (currentQuestion?.word?.length || 0);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <GameHeader level={playerLevel} onBack={() => handleRequestExit(null)} />

            {/* Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Timer (Paused if screen unmounts, loses focus, question is completed, or modal is open) */}
                <GameTimer
                    initialSeconds={currentQuestion?.time || currentQuestion?.time_limit_seconds || 15}
                    onTimeUp={handleTimeUp}
                    questionId={currentQuestion?.id || playerLevel}
                    resetKey={timerKey}
                    isPaused={!isFocused || isCompleted || showTimeUpModal || showIncorrectModal}
                />

                {/* Available Letter Tiles */}
                <LetterButtons
                    letters={availableLetters}
                    onSelectLetter={handleSelectLetter}
                />

                {/* Dynamic Answer Boxes */}
                <AnswerBoxes
                    wordLength={currentQuestion?.word?.length || 4}
                    selectedLetters={selectedLetters}
                    onDeselectLetter={handleDeselectLetter}
                />

                {/* Clue */}
                <GameClue clue={currentQuestion?.clue || currentQuestion?.hint} />

                {/* Hint & Submit Action Buttons */}
                <GameButtons
                    onHint={handleHint}
                    onSubmit={handleSubmit}
                    isSubmitDisabled={isSubmitDisabled}
                />
            </ScrollView>

            {/* Exit Confirmation Modal */}
            <ExitGameModal
                visible={showExitModal}
                onConfirmExit={handleConfirmExit}
                onCancel={() => setShowExitModal(false)}
            />

            {/* Time Up Modal */}
            <TimeUpModal
                visible={showTimeUpModal}
                level={playerLevel}
                onRetry={handleRetry}
                onLevelMap={handleTimeUpExit}
            />

            {/* Incorrect Answer Modal */}
            <IncorrectModal
                visible={showIncorrectModal}
                level={playerLevel}
                onTryAgain={handleTryAgain}
                onLevelMap={handleIncorrectExit}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 40,
    },
});


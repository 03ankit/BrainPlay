import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    Alert,
    Text,
    TouchableOpacity,
    Image,
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
import questionRepository from '../../database/repositories/questionRepository';
import gameHistoryRepository from '../../database/repositories/gameHistoryRepository';
import progressRepository from '../../database/repositories/progressRepository';
import images from '../../constants/images';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';
import WORD_PUZZLE_QUESTIONS from '../../constants/wordPuzzleQuestions';

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
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [availableLetters, setAvailableLetters] = useState([]);
    const [selectedLetters, setSelectedLetters] = useState([]);

    // Timing & score state
    const [hintsUsed, setHintsUsed] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);
    const [questionStartTime, setQuestionStartTime] = useState(Date.now());

    // Exit Modal state
    const [showExitModal, setShowExitModal] = useState(false);
    const [pendingTarget, setPendingTarget] = useState(null);

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
            navigation.navigate(pendingTarget.routeName || 'BottomNavigation', pendingTarget.params);
        } else if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('SelectLevel', { level: playerLevel, game: 'Word Jumble' });
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
    const handleTimeUp = () => {
        if (isCompleted || !isFocused) return;

        Alert.alert(
            '⏰ Time Expired!',
            `Time ran out for Level ${playerLevel}.`,
            [
                {
                    text: 'Try Again 🔄',
                    onPress: () => setupQuestion(currentQuestion),
                },
                {
                    text: 'Level Map 🗺️',
                    onPress: () => navigation.navigate('SelectLevel', { level: playerLevel, game: 'Word Jumble' }),
                },
            ]
        );
    };

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

            // Navigate to dedicated LevelCompleteScreen
            navigation.navigate('LevelCompleteScreen', {
                level: playerLevel,
                timeTaken: formattedTime,
                stars: earnedStars,
                title: earnedStars === 3 ? 'Mastermind!' : earnedStars === 2 ? 'Great Job!' : 'Level Cleared!',
                game: 'Word Jumble',
            });
        } else {
            Alert.alert(
                '❌ Incorrect Answer',
                'That is not the correct word. Try unscrambling again!',
                [{ text: 'Try Again', onPress: () => setupQuestion(currentQuestion) }]
            );
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
                {/* Timer (Paused if screen unmounts, loses focus, or question is completed) */}
                <GameTimer
                    initialSeconds={currentQuestion?.time || currentQuestion?.time_limit_seconds || 15}
                    onTimeUp={handleTimeUp}
                    questionId={currentQuestion?.id || playerLevel}
                    isPaused={!isFocused || isCompleted}
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

            {/* Embedded Bottom Navigation */}
            <View style={[styles.bottomNavContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleRequestExit({ routeName: 'BottomNavigation', params: { screen: 'Home' } })}
                >
                    <Image source={images.home} style={styles.navIcon} resizeMode="contain" />
                    <Text style={styles.navText}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.navItem, styles.navItemActive]}
                    onPress={() => handleRequestExit({ routeName: 'BottomNavigation', params: { screen: 'Games' } })}
                >
                    <Image source={images.game} style={[styles.navIcon, styles.navIconActive]} resizeMode="contain" />
                    <Text style={styles.navTextActive}>Games</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleRequestExit({ routeName: 'BottomNavigation', params: { screen: 'Achievements' } })}
                >
                    <Image source={images.champions} style={styles.navIcon} resizeMode="contain" />
                    <Text style={styles.navText}>Achievements</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.navItem}
                    onPress={() => handleRequestExit({ routeName: 'BottomNavigation', params: { screen: 'Profile' } })}
                >
                    <Image source={images.person} style={styles.navIcon} resizeMode="contain" />
                    <Text style={styles.navText}>Profile</Text>
                </TouchableOpacity>
            </View>

            {/* Exit Confirmation Modal */}
            <ExitGameModal
                visible={showExitModal}
                onConfirmExit={handleConfirmExit}
                onCancel={() => setShowExitModal(false)}
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
        paddingBottom: 100,
    },
    bottomNavContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: colors.white,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: colors.grayLighter,
    },
    navItem: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
        minWidth: 80,
    },
    navItemActive: {
        backgroundColor: colors.primary,
    },
    navIcon: {
        width: 22,
        height: 22,
        tintColor: colors.gray,
        marginBottom: 4,
    },
    navIconActive: {
        tintColor: colors.white,
    },
    navText: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: colors.gray,
    },
    navTextActive: {
        fontSize: 12,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
});

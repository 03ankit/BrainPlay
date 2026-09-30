import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    BackHandler,
    ScrollView,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from '@react-navigation/native';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import GameHeader from '../../components/game/GameHeader';
import GameTimer from '../../components/game/GameTimer';
import ExitGameModal from '../../components/game/ExitGameModal';
import TimeUpModal from '../../components/game/TimeUpModal';
import IncorrectModal from '../../components/game/IncorrectModal';
import progressRepository from '../../database/repositories/progressRepository';
import playerRepository from '../../database/repositories/playerRepository';
import streakRepository from '../../database/repositories/streakRepository';
import { getLevelChallenge } from '../../data/memoryChallengeQuestions';
import HapticService from '../../utils/HapticService';

const { width } = Dimensions.get('window');
const GRID_PADDING = 20;
const CARD_GAP = 10;
const GRID_COLUMNS = 4;
const CARD_SIZE = Math.floor((width - (GRID_PADDING * 2) - ((GRID_COLUMNS - 1) * CARD_GAP)) / GRID_COLUMNS);

// Helper to generate and shuffle card pairs
function generateDeck(cardEmojis, pairsCount) {
    const selected = cardEmojis.slice(0, pairsCount);
    const deck = [];

    selected.forEach((emoji, idx) => {
        deck.push({ id: `${idx}_A`, emoji, key: `${emoji}_A` });
        deck.push({ id: `${idx}_B`, emoji, key: `${emoji}_B` });
    });

    // Fisher-Yates shuffle
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
}

export default function MemoryChallengeScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();
    const isFocused = useIsFocused();

    const selectedLevel = Number(route?.params?.level) || 1;
    const gameTitle = route?.params?.game || 'Memory Cards';

    const challenge = getLevelChallenge(selectedLevel);
    const totalPairs = challenge.pairs || 8;
    const initialSeconds = challenge.timeLimit || 60;
    const previewTimeMs = challenge.previewTime || 4000;
    const maxLives = challenge.lives || 3;

    // Game state
    const [deck, setDeck] = useState(() => generateDeck(challenge.cards, totalPairs));
    const [flippedIndices, setFlippedIndices] = useState([]);
    const [matchedCardIds, setMatchedCardIds] = useState(new Set());
    const [livesLeft, setLivesLeft] = useState(maxLives);
    const [isPreviewing, setIsPreviewing] = useState(true);
    const [previewCountdown, setPreviewCountdown] = useState(Math.ceil(previewTimeMs / 1000));
    const [isCompleted, setIsCompleted] = useState(false);
    const [timerKey, setTimerKey] = useState(0);

    // Modals
    const [showExitModal, setShowExitModal] = useState(false);
    const [showTimeUpModal, setShowTimeUpModal] = useState(false);
    const [showIncorrectModal, setShowIncorrectModal] = useState(false);

    const questionStartTimeRef = useRef(Date.now());
    const isEvaluatingRef = useRef(false);
    const previewIntervalRef = useRef(null);

    // Initialize or Reset Game for Selected Level
    const initGame = useCallback(() => {
        const newChallenge = getLevelChallenge(selectedLevel);
        const newDeck = generateDeck(newChallenge.cards, newChallenge.pairs || 8);

        setDeck(newDeck);
        setFlippedIndices([]);
        setMatchedCardIds(new Set());
        setLivesLeft(newChallenge.lives || 3);
        setIsCompleted(false);
        setIsPreviewing(true);
        isEvaluatingRef.current = false;

        const previewSecs = Math.ceil((newChallenge.previewTime || 4000) / 1000);
        setPreviewCountdown(previewSecs);

        // Preview countdown interval
        if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
        let remaining = previewSecs;
        previewIntervalRef.current = setInterval(() => {
            remaining -= 1;
            setPreviewCountdown(remaining);
            if (remaining <= 0) {
                clearInterval(previewIntervalRef.current);
                previewIntervalRef.current = null;
                setIsPreviewing(false);
                setTimerKey((prev) => prev + 1);
                questionStartTimeRef.current = Date.now();
            }
        }, 1000);
    }, [selectedLevel]);

    useEffect(() => {
        initGame();
        return () => {
            if (previewIntervalRef.current) clearInterval(previewIntervalRef.current);
        };
    }, [initGame]);

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

    // Timer expires callback
    const handleTimeUp = useCallback(() => {
        if (isCompleted || isPreviewing || !isFocused) return;
        HapticService.warning();
        setShowTimeUpModal(true);
    }, [isCompleted, isPreviewing, isFocused]);

    // Card Tap Handler
    const handleCardPress = (index) => {
        if (isPreviewing || isEvaluatingRef.current || isCompleted) return;
        if (flippedIndices.includes(index)) return;
        if (matchedCardIds.has(deck[index].id)) return;

        HapticService.light();

        if (flippedIndices.length === 0) {
            // First card flipped
            setFlippedIndices([index]);
        } else if (flippedIndices.length === 1) {
            // Second card flipped
            const firstIndex = flippedIndices[0];
            const newFlipped = [firstIndex, index];
            setFlippedIndices(newFlipped);
            isEvaluatingRef.current = true;

            const firstCard = deck[firstIndex];
            const secondCard = deck[index];

            if (firstCard.emoji === secondCard.emoji) {
                // MATCH!
                HapticService.medium();
                setTimeout(() => {
                    setMatchedCardIds((prev) => {
                        const next = new Set(prev);
                        next.add(firstCard.id);
                        next.add(secondCard.id);

                        // Check Win Condition
                        if (next.size === deck.length) {
                            handleLevelWin();
                        }
                        return next;
                    });
                    setFlippedIndices([]);
                    isEvaluatingRef.current = false;
                }, 350);
            } else {
                // MISMATCH
                HapticService.error();
                setTimeout(() => {
                    setFlippedIndices([]);
                    isEvaluatingRef.current = false;

                    setLivesLeft((prevLives) => {
                        const remaining = prevLives - 1;
                        if (remaining <= 0) {
                            setShowIncorrectModal(true);
                        }
                        return Math.max(0, remaining);
                    });
                }, 750);
            }
        }
    };

    // Level Complete / Win Handler
    const handleLevelWin = async () => {
        HapticService.success();
        setIsCompleted(true);

        const elapsedSecs = Math.max(
            1,
            Math.round((Date.now() - questionStartTimeRef.current) / 1000)
        );
        const mins = String(Math.floor(elapsedSecs / 60)).padStart(2, '0');
        const secs = String(elapsedSecs % 60).padStart(2, '0');
        const formattedTime = `${mins}:${secs}`;

        // Star calculation based on timer color and lives:
        // Green timer (> 50% time left & full lives): 3 Stars
        // Orange timer (25% - 50% time left) or 2 lives: 2 Stars
        // Red timer (<= 25% time left) or 1 life left: 1 Star
        let earnedStars = 3;
        if (livesLeft <= 1 || elapsedSecs > initialSeconds * 0.75) {
            earnedStars = 1;
        } else if (elapsedSecs > initialSeconds * 0.5 || (initialLives >= 3 && livesLeft === 2)) {
            earnedStars = 2;
        } else {
            earnedStars = 3;
        }

        const pointsEarned = totalPairs * 150 + (livesLeft * 100);
        const earnedCoins = progressRepository.getCoinRewardForStars(earnedStars);

        try {
            await progressRepository.savePlayerProgress({
                profileId: 'local_player',
                gameId: '4', // Game ID '4' for Memory Cards
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
            await streakRepository.recordDailyActivity('local_player', '4', selectedLevel);
        } catch (err) {
            console.log('Error saving Memory Challenge progress:', err);
        }

        setTimeout(() => {
            navigation.replace('LevelCompleteScreen', {
                level: selectedLevel,
                stars: earnedStars,
                score: pointsEarned,
                coins: earnedCoins,
                game: 'Memory Cards',
                timeTaken: formattedTime,
                title: earnedStars === 3 ? 'Memory Master!' : 'Level Cleared!',
            });
        }, 300);
    };

    // Retry callback
    const handleRetry = () => {
        setShowTimeUpModal(false);
        setShowIncorrectModal(false);
        initGame();
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
                { name: 'SelectLevel', params: { level: selectedLevel, game: gameTitle } },
            ],
        });
    };

    const matchedPairsCount = Math.floor(matchedCardIds.size / 2);
    const totalCards = deck.length;
    const gridColumns = totalCards <= 4 ? 2 : totalCards <= 6 ? 3 : 4;
    const dynamicCardSize = Math.floor((width - (GRID_PADDING * 2) - ((gridColumns - 1) * CARD_GAP)) / gridColumns);
    const dynamicEmojiSize = totalCards <= 4 ? 48 : totalCards <= 6 ? 38 : totalCards <= 8 ? 34 : 28;

    return (
        <View style={[styles.screen, { paddingTop: insets.top }]}>
            {/* Standard GameHeader matching ColorMatch & Word Jumble */}
            <GameHeader
                level={selectedLevel}
                onBack={() => setShowExitModal(true)}
            />

            {/* Main Scroll Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Timer / Preview State */}
                {isPreviewing ? (
                    <View style={styles.previewBanner}>
                        <Text style={styles.previewBannerIcon}>👀</Text>
                        <Text style={styles.previewBannerTitle}>
                            MEMORIZE CARDS ({previewCountdown}s)
                        </Text>
                        <Text style={styles.previewBannerSub}>
                            Cards will flip face down shortly!
                        </Text>
                    </View>
                ) : (
                    <GameTimer
                        initialSeconds={initialSeconds}
                        onTimeUp={handleTimeUp}
                        questionId={selectedLevel}
                        resetKey={timerKey}
                        isPaused={!isFocused || isCompleted || showTimeUpModal || showIncorrectModal}
                    />
                )}

                {/* Status HUD Chips (Pairs Matched & Lives Remaining) */}
                <View style={styles.hudRow}>
                    <View style={styles.hudChip}>
                        <Text style={styles.hudLabel}>PAIRS</Text>
                        <Text style={styles.hudValue}>{matchedPairsCount} / {totalPairs}</Text>
                    </View>

                    <View style={styles.hudChip}>
                        <Text style={styles.hudLabel}>LIVES</Text>
                        <View style={styles.heartsRow}>
                            {Array.from({ length: maxLives }).map((_, i) => (
                                <Image
                                    key={`heart_${i}`}
                                    source={images.heart}
                                    style={[
                                        styles.heartIcon,
                                        i >= livesLeft && styles.heartIconLost,
                                    ]}
                                    resizeMode="contain"
                                />
                            ))}
                        </View>
                    </View>
                </View>

                {/* Dynamic Memory Card Grid */}
                <View style={[styles.gridContainer, { maxWidth: width - (GRID_PADDING * 2) }]}>
                    {deck.map((card, index) => {
                        const isMatched = matchedCardIds.has(card.id);
                        const isFlipped = isPreviewing || flippedIndices.includes(index) || isMatched;

                        return (
                            <TouchableOpacity
                                key={`card_${card.id}_${index}`}
                                style={[
                                    styles.card,
                                    { width: dynamicCardSize, height: dynamicCardSize },
                                    isFlipped && styles.cardFlipped,
                                    isMatched && styles.cardMatched,
                                ]}
                                activeOpacity={0.8}
                                onPress={() => handleCardPress(index)}
                                disabled={isPreviewing || isFlipped || isMatched}
                            >
                                {isFlipped ? (
                                    <Text style={[styles.cardEmoji, { fontSize: dynamicEmojiSize }]}>
                                        {card.emoji}
                                    </Text>
                                ) : (
                                    <View style={styles.cardBack}>
                                        <Text style={[styles.cardBackSymbol, { fontSize: dynamicEmojiSize * 0.7 }]}>
                                            ✦
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Subtitle Instruction */}
                <Text style={styles.instructionText}>
                    {isPreviewing
                        ? 'Quickly memorize all card locations!'
                        : 'Tap 2 cards to find identical matching pairs.'}
                </Text>
            </ScrollView>

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

            {/* Out of Lives Modal */}
            <IncorrectModal
                visible={showIncorrectModal}
                level={selectedLevel}
                message={`Out of lives for Level ${selectedLevel}! Try again to beat the challenge.`}
                onTryAgain={handleRetry}
                onLevelMap={handleExitToMap}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background || '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: GRID_PADDING,
        paddingBottom: 30,
        alignItems: 'center',
    },

    // Preview Banner
    previewBanner: {
        width: '100%',
        backgroundColor: '#EDE9FE',
        borderWidth: 1.5,
        borderColor: '#C4B5FD',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        alignItems: 'center',
        marginVertical: 10,
    },
    previewBannerIcon: {
        fontSize: 28,
        marginBottom: 4,
    },
    previewBannerTitle: {
        fontFamily: fonts.bold || 'System',
        fontSize: 16,
        color: '#6D28D9',
        letterSpacing: 0.5,
    },
    previewBannerSub: {
        fontFamily: fonts.regular || 'System',
        fontSize: 13,
        color: '#7C3AED',
        marginTop: 2,
    },

    // HUD status row
    hudRow: {
        flexDirection: 'row',
        width: '100%',
        justifyContent: 'space-between',
        marginVertical: 12,
        gap: 12,
    },
    hudChip: {
        flex: 1,
        backgroundColor: colors.white || '#FFFFFF',
        borderRadius: 14,
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        shadowColor: '#64748B',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
        elevation: 2,
    },
    hudLabel: {
        fontFamily: fonts.bold || 'System',
        fontSize: 12,
        color: '#64748B',
        letterSpacing: 0.6,
    },
    hudValue: {
        fontFamily: fonts.bold || 'System',
        fontSize: 15,
        color: '#1E293B',
    },
    heartsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    heartIcon: {
        width: 18,
        height: 18,
        tintColor: '#EF4444',
    },
    heartIconLost: {
        tintColor: '#CBD5E1',
        opacity: 0.5,
    },

    // 4x4 Grid Container
    gridContainer: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: CARD_GAP,
        marginVertical: 10,
    },

    // Card styling
    card: {
        width: CARD_SIZE,
        height: CARD_SIZE,
        backgroundColor: '#4F46E5',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#4338CA',
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    cardFlipped: {
        backgroundColor: '#FFFFFF',
        borderColor: '#C7D2FE',
        shadowColor: '#94A3B8',
        shadowOpacity: 0.15,
    },
    cardMatched: {
        backgroundColor: '#F0FDF4',
        borderColor: '#86EFAC',
        opacity: 0.9,
    },
    cardEmoji: {
        fontSize: 32,
    },
    cardBack: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    cardBackSymbol: {
        color: '#A5B4FC',
        fontSize: 22,
        fontWeight: 'bold',
    },

    // Subtitle instruction
    instructionText: {
        fontFamily: fonts.regular || 'System',
        fontSize: 14,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 14,
    },
});

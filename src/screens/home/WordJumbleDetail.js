import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Share,
} from 'react-native';
import Header from '../../components/CommonHeader';
import GameBannerCard from '../../components/game/GameBannerCard';
import DifficultyBadgeCard from '../../components/game/DifficultyBadgeCard';
import HowToPlayCard from '../../components/game/HowToPlayCard';
import GameBottomActionBar from '../../components/game/GameBottomActionBar';
import images from '../../constants/images';
import colors from '../../constants/colour';
import { WORD_PUZZLE_QUESTIONS } from '../../data/wordPuzzleQuestions';

export default function WordJumbleDetail({ navigation, route }) {
    const gameTitle = route?.params?.game || route?.params?.title || 'Word Jumble';
    const levelNumber = Number(route?.params?.level) || 1;

    const currentQuestion = WORD_PUZZLE_QUESTIONS.find(q => q.level_number === levelNumber) || WORD_PUZZLE_QUESTIONS[0];
    const difficulty = currentQuestion?.difficulty || (levelNumber <= 5 ? 'EASY' : levelNumber <= 12 ? 'MEDIUM' : levelNumber <= 20 ? 'HARD' : 'BOSS');
    const difficultyLevel = levelNumber <= 5 ? 1 : levelNumber <= 12 ? 2 : 3;

    const handleBack = () => {
        if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Can you solve ${gameTitle} Level ${levelNumber} on BrainPlay? Play now!`,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const handleStartGame = () => {
        navigation.navigate('WordPuzzleScreen', { level: levelNumber, game: gameTitle });
    };

    const handleFavorite = (isFav) => {
        console.log('Favorite state changed:', isFav);
    };

    const shareButton = (
        <TouchableOpacity
            onPress={handleShare}
            style={styles.shareIconButton}
            activeOpacity={0.7}
        >
            <Image source={images.share} style={styles.shareIcon} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Screen Header */}
            <Header
                title={gameTitle}
                showBack={true}
                onBack={handleBack}
                rightComponent={shareButton}
            />

            {/* Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. Hero Banner Card */}
                <GameBannerCard
                    category="ARCADE LEVEL MAP"
                    title={gameTitle}
                    imageSource={images.word_jumble_bg}
                />

                {/* 2. Difficulty Level Badge */}
                <DifficultyBadgeCard
                    level={difficulty}
                    currentLevel={difficultyLevel}
                    totalLevels={3}
                />

                {/* 3. How to Play Instructions */}
                <HowToPlayCard
                    description="Unscramble the letters as quickly as you can to reveal the hidden word. The faster you solve it, the higher your multiplier!"
                    rules={[
                        {
                            id: '1',
                            icon: '⏱',
                            text: 'You have 60 seconds per round to solve as many words as possible.',
                        },
                        {
                            id: '2',
                            icon: '⚡',
                            text: 'Earn combo points by unscrambling three words in a row without a mistake.',
                        },
                    ]}
                />
            </ScrollView>

            {/* Sticky Bottom Action Bar */}
            <GameBottomActionBar
                onStartGame={handleStartGame}
                onToggleFavorite={handleFavorite}
                isFavoriteInitial={false}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background || '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 8,
        paddingBottom: 110, // Extra space to clear fixed bottom action bar
    },
    shareIconButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    shareIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        tintColor: colors.primary || '#4F46E5',
    },
});

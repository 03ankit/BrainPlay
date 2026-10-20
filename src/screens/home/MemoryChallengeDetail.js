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
import { getLevelChallenge } from '../../data/memoryChallengeQuestions';

export default function MemoryChallengeDetail({ navigation, route }) {
    const gameTitle = route?.params?.game || route?.params?.title || 'Memory Cards';
    const levelNumber = Number(route?.params?.level) || 1;

    const levelConfig = getLevelChallenge(levelNumber);

    const handleBack = () => {
        if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Can you beat ${gameTitle} Level ${levelNumber} on BrainPlay? Test your visual memory now!`,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const handleStartGame = () => {
        navigation.navigate('MemoryChallengeScreen', { level: levelNumber, game: gameTitle });
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
                    category="MEMORY & PATTERN ARENA"
                    title={levelConfig.title || gameTitle}
                    imageSource={images.word_jumble_bg}
                />

                {/* 2. Difficulty Level Badge */}
                <DifficultyBadgeCard
                    level={levelConfig.difficulty}
                    currentLevel={levelNumber <= 6 ? 1 : levelNumber <= 13 ? 2 : 3}
                    totalLevels={3}
                />

                {/* 3. How to Play Instructions */}
                <HowToPlayCard
                    description={levelConfig.description || "Flip and match all identical cards before running out of lives or time! Memorize card positions during the preview countdown."}
                    rules={[
                        {
                            id: '1',
                            icon: '👁️',
                            text: `Memorize the card positions during the ${(levelConfig.previewTime || 3000) / 1000}s initial preview.`,
                        },
                        {
                            id: '2',
                            icon: '🃏',
                            text: `Flip 2 cards at a time to find matching pairs (${levelConfig.pairs || 8} pairs total).`,
                        },
                        {
                            id: '3',
                            icon: '❤️',
                            text: `Watch your lives (${levelConfig.lives || 3} max). Avoid mistakes to earn 3 stars!`,
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
        paddingBottom: 110,
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

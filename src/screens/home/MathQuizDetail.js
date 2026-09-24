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
import { getLevelChallenge } from '../../constants/mathQuizData';

export default function MathQuizDetail({ navigation, route }) {
    const gameTitle = route?.params?.game || route?.params?.title || 'Math Quiz';
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
                message: `Can you solve ${gameTitle} Level ${levelNumber} on BrainPlay? Test your mental arithmetic now!`,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const handleStartGame = () => {
        navigation.navigate('MathQuizScreen', { level: levelNumber, game: gameTitle });
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
                    category="ARITHMETIC & SPEED ARENA"
                    title={gameTitle}
                    imageSource={images.word_jumble_bg}
                />

                {/* 2. Difficulty Level Badge */}
                <DifficultyBadgeCard
                    level={levelConfig.difficulty}
                    currentLevel={levelNumber <= 5 ? 1 : levelNumber <= 10 ? 2 : levelNumber <= 15 ? 3 : 4}
                    totalLevels={4}
                />

                {/* 3. How to Play Instructions */}
                <HowToPlayCard
                    description="Calculate the arithmetic expression as fast as possible and select the correct option among 4 choices before the clock runs out!"
                    rules={[
                        {
                            id: '1',
                            icon: '⚡',
                            text: 'Read the equation and calculate the answer mentally.',
                        },
                        {
                            id: '2',
                            icon: '⏱',
                            text: 'Tap the correct option box before the countdown runs out.',
                        },
                        {
                            id: '3',
                            icon: '⭐',
                            text: 'Answer swiftly to earn 3 full stars and boost your Brain Score!',
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

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
import { COLOR_MATCH_LEVELS } from '../../constants/colorMatchData';

export default function ColorMatchDetail({ navigation, route }) {
    const gameTitle = route?.params?.game || route?.params?.title || 'Color Match';
    const levelNumber = Number(route?.params?.level) || 5;

    const levelConfig = COLOR_MATCH_LEVELS[(levelNumber - 1) % COLOR_MATCH_LEVELS.length] || COLOR_MATCH_LEVELS[0];

    const handleBack = () => {
        if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Can you beat ${gameTitle} Level ${levelNumber} on BrainPlay? Test your brain reflexes now!`,
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const handleStartGame = () => {
        navigation.navigate('ColorMatchScreen', { level: levelNumber, game: gameTitle });
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
                    category="REFLEX & COGNITIVE ARENA"
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
                    description="Determine whether the ink color of the text matches the word name as quickly as you can. Overcome the Stroop effect to earn huge combo multipliers!"
                    rules={[
                        {
                            id: '1',
                            icon: '🎯',
                            text: 'Read the word and check its font color. Ignore brain distractions!',
                        },
                        {
                            id: '2',
                            icon: '⚡',
                            text: 'Tap MATCH if the meaning matches the ink color, or NO MATCH if it differs.',
                        },
                        {
                            id: '3',
                            icon: '🔥',
                            text: 'Answer rapidly in sequence without mistakes to build massive Combo scores.',
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

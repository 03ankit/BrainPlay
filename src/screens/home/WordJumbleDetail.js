import React from 'react';
import {
    View,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Alert,
    Share,
} from 'react-native';
import Header from '../../components/CommonHeader';
import GameBannerCard from '../../components/game/GameBannerCard';
import DifficultyBadgeCard from '../../components/game/DifficultyBadgeCard';
import HowToPlayCard from '../../components/game/HowToPlayCard';
import GameBottomActionBar from '../../components/game/GameBottomActionBar';
import images from '../../constants/images';
import colors from '../../constants/colour';

export default function WordJumbleDetail({ navigation }) {
    const handleBack = () => {
        if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Can you solve the Word Jumble puzzle on BrainPlay? Play now!',
            });
        } catch (error) {
            console.log('Share error:', error);
        }
    };

    const handleStartGame = () => {
        Alert.alert('Start Game', 'Word Jumble round starting now!', [
            { text: 'Let\'s Play', onPress: () => console.log('Game Started') }
        ]);
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
                title="Word Jumble"
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
                    category="PUZZLE CATEGORY"
                    title="Word Jumble"
                    imageSource={images.word_jumble_bg}
                />

                {/* 2. Difficulty Level Badge */}
                <DifficultyBadgeCard
                    level="Medium"
                    currentLevel={2}
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

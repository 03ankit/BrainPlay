import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import fonts from '../../constants/fonts';

const GameBottomActionBar = ({
    onStartGame,
    onToggleFavorite,
    isFavoriteInitial = false,
}) => {
    const insets = useSafeAreaInsets();
    const [isFavorite, setIsFavorite] = useState(isFavoriteInitial);

    const handleFavoritePress = () => {
        const nextState = !isFavorite;
        setIsFavorite(nextState);
        if (onToggleFavorite) {
            onToggleFavorite(nextState);
        }
    };

    return (
        <View style={[styles.bottomContainer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {/* Primary Action: Start Game */}
            <TouchableOpacity
                style={styles.startButton}
                activeOpacity={0.8}
                onPress={onStartGame}
            >
                <Text style={styles.playIcon}>▶</Text>
                <Text style={styles.startButtonText}>Start Game</Text>
            </TouchableOpacity>

            {/* Favorite / Heart Button */}
            <TouchableOpacity
                style={[
                    styles.favoriteButton,
                    isFavorite && styles.favoriteButtonActive,
                ]}
                activeOpacity={0.7}
                onPress={handleFavoritePress}
            >
                <Text style={[styles.heartIcon, isFavorite && styles.heartIconActive]}>
                    {isFavorite ? '♥' : '♡'}
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default GameBottomActionBar;

const styles = StyleSheet.create({
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 14,
        gap: 12,
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 10,
    },
    startButton: {
        flex: 1,
        height: 56,
        backgroundColor: '#6366F1',
        borderRadius: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        shadowColor: '#6366F1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    playIcon: {
        color: '#FFFFFF',
        fontSize: 16,
    },
    startButtonText: {
        color: '#FFFFFF',
        fontSize: 18,
        fontFamily: fonts.bold,
    },
    favoriteButton: {
        width: 56,
        height: 56,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: '#6366F1',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    favoriteButtonActive: {
        backgroundColor: '#EEF2FF',
        borderColor: '#4F46E5',
    },
    heartIcon: {
        fontSize: 24,
        color: '#6366F1',
    },
    heartIconActive: {
        color: '#EF4444',
    },
});

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Dimensions,
    StatusBar,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import streakRepository from '../../database/repositories/streakRepository';
import { executeSql } from '../../database/database';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

const featuredGames = [
    {
        id: '1',
        title: 'Word Jumble',
        difficulty: 'MEDIUM',
        diffBg: colors.orangeLight,
        diffColor: colors.orangeDark,
        bestScore: '4,500',
        icon: '🧩',
        iconBg: '#4F46E5',
        iconColor: colors.white,
    },
    {
        id: '2',
        title: 'Color Match',
        difficulty: 'EASY',
        diffBg: colors.greenMint,
        diffColor: colors.greenDark,
        bestScore: '2,100',
        icon: '🎨',
        iconBg: '#DC2626',
        iconColor: colors.white,
    },
    {
        id: '3',
        title: 'Memory Cards',
        difficulty: 'HARD',
        diffBg: colors.redLight,
        diffColor: colors.redDark,
        bestScore: '850',
        icon: '🧠',
        iconBg: '#7C3AED',
        iconColor: colors.white,
    },
    {
        id: '4',
        title: 'Math Quiz',
        difficulty: 'MEDIUM',
        diffBg: colors.orangeLight,
        diffColor: colors.orangeDark,
        bestScore: '5,680',
        icon: '🧮',
        iconBg: '#1E40AF',
        iconColor: colors.white,
    },
];

export default function Home({ navigation }) {
    const insets = useSafeAreaInsets();
    const [streakCount, setStreakCount] = useState(0);
    const [completedDays, setCompletedDays] = useState(0);
    const [userProfile, setUserProfile] = useState({
        name: 'Player',
        level: 1,
        coins: 100,
        image: null,
    });

    // Fetch live streak & profile data whenever Home comes into focus
    useFocusEffect(
        useCallback(() => {
            const loadHomeData = async () => {
                try {
                    // 1. Fetch streak data
                    const data = await streakRepository.getWeeklyStreak('local_player');
                    setStreakCount(data.streakCount || 0);
                    setCompletedDays(data.completedDays || 0);

                    // 2. Fetch profile data (name, level, coins, image)
                    const profileRes = await executeSql(
                        'SELECT name, level, coins, image FROM profiles WHERE id = ?;',
                        ['local_player']
                    );
                    if (profileRes && profileRes.rows && profileRes.rows.length > 0) {
                        const item = profileRes.rows.item(0);
                        setUserProfile({
                            name: item.name || 'Player',
                            level: item.level || 1,
                            coins: item.coins !== undefined ? item.coins : 100,
                            image: item.image || null,
                        });
                    }
                } catch (err) {
                    console.error('Error fetching home data:', err);
                }
            };
            loadHomeData();
        }, [])
    );

    const handlePlayGame = (game) => {
        navigation.navigate('SelectLevel', {
            game: game.title,
            title: game.title,
            difficulty: game.difficulty,
            color: game.iconBg,
        });
    };

    const handleStreakPress = () => {
        navigation.navigate('WeeklyStreakDetail');
    };

    const displayName = userProfile.name ? userProfile.name.split(' ')[0] : 'Player';
    const currentTier = streakRepository.getStreakTier(streakCount);

    return (
        <View style={[styles.screen, { paddingTop: Math.max(insets.top, 14) }]}>
            <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

            {/* Main Scrollable Content */}
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* 1. Top App Bar */}
                <View style={styles.topBar}>
                    <View style={styles.brandRow}>
                        {/* User Avatar with outer border */}
                        <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={() => navigation.navigate('Profile')}
                            style={styles.avatarWrap}
                        >
                            <Image
                                source={userProfile.image ? { uri: userProfile.image } : images.person}
                                style={styles.avatarImage}
                                resizeMode="cover"
                            />
                        </TouchableOpacity>

                        {/* App Brand Name */}
                        <Text style={styles.brandTitle}>BrainPlay</Text>
                    </View>

                    {/* Level & Coins Badge */}
                    <View style={styles.levelBadge}>
                        <Text style={styles.levelBadgeText}>
                            Lv. {userProfile.level} • {userProfile.coins} <Text style={styles.coinEmoji}>🪙</Text>
                        </Text>
                    </View>
                </View>

                {/* 2. Welcome Greeting & Screen Title */}
                <View style={styles.greetingSection}>
                    <Text style={styles.welcomeText}>Welcome back, {displayName} 👋</Text>
                    <Text style={styles.pageTitle}>Pick Your Challenge</Text>
                </View>

                {/* 3. Hero Streak / Rank Tier Card */}
                <TouchableOpacity
                    style={styles.heroCard}
                    activeOpacity={0.9}
                    onPress={handleStreakPress}
                >
                    {/* Background Glow Overlay */}
                    <View style={styles.heroGlowCircle} />

                    <View style={styles.heroLeft}>
                        {/* 7 Day Streak Tag */}
                        <View style={styles.streakTagRow}>
                            <Image source={images.fire} style={styles.streakFireIcon} resizeMode="contain" />
                            <Text style={styles.streakTagText}>
                                {streakCount >= 7 ? `${streakCount} DAY STREAK` : `DAY ${completedDays}/7 STREAK`}
                            </Text>
                        </View>

                        {/* Rank Tier Title (Replaced Brain Score) */}
                        <Text style={styles.heroScoreTitle}>{currentTier.title}</Text>

                        {/* Subtitle */}
                        <Text style={styles.heroSubtitle}>
                            {currentTier.nextTier
                                ? `${currentTier.daysToNext} day${currentTier.daysToNext === 1 ? '' : 's'} to unlock ${currentTier.nextTier.title}`
                                : 'Grand Legend Champion Reached! 👑'}
                        </Text>
                    </View>

                    {/* Right Badge Image Box */}
                    <View style={styles.heroBadgeBox}>
                        <Image
                            source={images[currentTier.badgeKey]}
                            style={styles.heroBadgeIcon}
                            resizeMode="contain"
                        />
                    </View>
                </TouchableOpacity>

                {/* 4. Featured Games Header Row */}
                <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Featured Games</Text>
                    <Text style={styles.sectionBadge}>{featuredGames.length} Ready to Play</Text>
                </View>

                {/* 5. 2-Column Games Grid */}
                <View style={styles.gamesGrid}>
                    {featuredGames.map((game) => (
                        <TouchableOpacity
                            key={game.id}
                            style={styles.gameCard}
                            activeOpacity={0.88}
                            onPress={() => handlePlayGame(game)}
                        >
                            {/* Card Top Row: Icon & Difficulty Tag */}
                            <View style={styles.cardTopRow}>
                                <View
                                    style={[
                                        styles.gameIconBox,
                                        { backgroundColor: game.iconBg },
                                    ]}
                                >
                                    <Text style={styles.gameIconEmoji}>{game.icon}</Text>
                                </View>

                                <View
                                    style={[
                                        styles.diffBadge,
                                        { backgroundColor: game.diffBg },
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.diffBadgeText,
                                            { color: game.diffColor },
                                        ]}
                                    >
                                        {game.difficulty}
                                    </Text>
                                </View>
                            </View>

                            {/* Game Title */}
                            <Text style={styles.gameCardTitle} numberOfLines={1}>
                                {game.title}
                            </Text>

                            {/* Best Score */}
                            <Text style={styles.bestScoreText} numberOfLines={1}>
                                Best: {game.bestScore}
                            </Text>

                            {/* Play Action Button (Vibrant Royal Blue) */}
                            <TouchableOpacity
                                style={styles.cardPlayButton}
                                activeOpacity={0.85}
                                onPress={() => handlePlayGame(game)}
                            >
                                <Image source={images.play} style={styles.cardPlayIcon} resizeMode="contain" />
                                <Text style={styles.cardPlayText}>Play</Text>
                            </TouchableOpacity>
                        </TouchableOpacity>
                    ))}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 28,
    },

    // 1. Top App Bar
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        marginBottom: 16,
    },
    brandRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    avatarWrap: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#DBEAFE',
        borderWidth: 2,
        borderColor: '#93C5FD',
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarImage: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    brandTitle: {
        fontSize: 24,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: '#2563EB', // Vibrant Royal Blue
        letterSpacing: -0.3,
    },
    levelBadge: {
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 14,
        paddingVertical: 7,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#DBEAFE',
    },
    levelBadgeText: {
        color: '#1D4ED8',
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
    coinEmoji: {
        fontSize: 13,
    },

    // 2. Greeting Section
    greetingSection: {
        marginBottom: 20,
    },
    welcomeText: {
        fontSize: 15,
        fontFamily: fonts.medium,
        color: colors.grayDark,
        marginBottom: 4,
    },
    pageTitle: {
        fontSize: 28,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkGray,
        letterSpacing: -0.5,
    },

    // 3. Hero Streak / Brain Score Card (Royal Blue Gradient Theme)
    heroCard: {
        width: '100%',
        backgroundColor: '#4338CA', // Rich Royal Blue / Indigo
        borderRadius: 24,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        overflow: 'hidden',
        position: 'relative',
        marginBottom: 26,
        shadowColor: '#3B82F6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.32,
        shadowRadius: 16,
        elevation: 6,
    },
    heroGlowCircle: {
        position: 'absolute',
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: '#3B82F6',
        opacity: 0.45,
        top: -60,
        right: -40,
    },
    heroLeft: {
        flex: 1,
        paddingRight: 12,
    },
    streakTagRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 4,
    },
    streakFireIcon: {
        width: 16,
        height: 16,
    },
    streakTagText: {
        color: '#FDE047',
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 1.2,
    },
    heroScoreTitle: {
        color: colors.white,
        fontSize: 22,
        fontFamily: fonts.bold,
        fontWeight: '900',
        marginBottom: 4,
        letterSpacing: -0.2,
    },
    heroSubtitle: {
        color: 'rgba(255, 255, 255, 0.9)',
        fontSize: 12.5,
        fontFamily: fonts.medium,
    },
    heroBadgeBox: {
        width: 60,
        height: 60,
        borderRadius: 18,
        backgroundColor: 'rgba(255, 255, 255, 0.18)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.35)',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },
    heroBadgeIcon: {
        width: 48,
        height: 48,
    },

    // 4. Section Header
    sectionHeaderRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 21,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkGray,
        letterSpacing: -0.3,
    },
    sectionBadge: {
        color: '#2563EB',
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },

    // 5. 2-Column Games Grid
    gamesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    gameCard: {
        width: CARD_WIDTH,
        backgroundColor: colors.white,
        borderRadius: 22,
        padding: 14,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: colors.grayLighter,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 3,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gameIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    gameIconEmoji: {
        fontSize: 20,
    },
    diffBadge: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
    },
    diffBadgeText: {
        fontSize: 9.5,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.4,
    },
    gameCardTitle: {
        fontSize: 15.5,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkGray,
        marginBottom: 3,
    },
    bestScoreText: {
        fontSize: 12.5,
        fontFamily: fonts.medium,
        color: colors.gray,
        marginBottom: 14,
    },
    cardPlayButton: {
        width: '100%',
        height: 40,
        backgroundColor: '#4F46E5', // Vibrant Royal Blue Button
        borderRadius: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 3,
    },
    cardPlayIcon: {
        width: 12,
        height: 12,
        tintColor: colors.white,
    },
    cardPlayText: {
        color: colors.white,
        fontSize: 13.5,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
});
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';

const categories = ['All Games', 'Puzzle', 'Brain & Logic', 'Memory', 'Word Games', 'Speed'];

const allGamesList = [
    {
        id: '1',
        title: 'Word Jumble',
        category: 'Word Games',
        difficulty: 'MEDIUM',
        diffColor: colors.orange,
        hs: 4500,
        icon: '🧩',
        color: colors.purplePlay,
        desc: 'Unscramble letters to reveal secret words',
        totalLevels: 20,
        currentLevel: 12,
    },
    {
        id: '2',
        title: 'Color Match',
        category: 'Speed',
        difficulty: 'EASY',
        diffColor: colors.green,
        hs: 2100,
        icon: '🎨',
        color: colors.rose,
        desc: 'Test your reflexes by matching dynamic color patterns',
        totalLevels: 20,
        currentLevel: 5,
    },
    {
        id: '3',
        title: 'Memory Cards',
        category: 'Memory',
        difficulty: 'HARD',
        diffColor: colors.red,
        hs: 850,
        icon: '🧠',
        color: colors.purpleLight,
        desc: 'Memorize positions and find matching pairs',
        totalLevels: 20,
        currentLevel: 8,
    },
    {
        id: '4',
        title: '2048 Fusion',
        category: 'Brain & Logic',
        difficulty: 'MEDIUM',
        diffColor: colors.orange,
        hs: 12400,
        icon: '🔢',
        color: colors.blue,
        desc: 'Slide number tiles together to reach 2048',
        totalLevels: 20,
        currentLevel: 14,
    },
    {
        id: '5',
        title: 'Word Search',
        category: 'Word Games',
        difficulty: 'EASY',
        diffColor: colors.green,
        hs: 3200,
        icon: '🔍',
        color: colors.violet,
        desc: 'Locate hidden keywords in the letter grid',
        totalLevels: 20,
        currentLevel: 9,
    },
    {
        id: '6',
        title: 'Pattern Matrix',
        category: 'Puzzle',
        difficulty: 'HARD',
        diffColor: colors.red,
        hs: 5120,
        icon: '⚡',
        color: '#D97706',
        desc: 'Decode geometric sequences under time pressure',
        totalLevels: 20,
        currentLevel: 4,
    },
];

export default function Game({ navigation }) {
    const insets = useSafeAreaInsets();
    const [selectedCategory, setSelectedCategory] = useState('All Games');

    const filteredGames = selectedCategory === 'All Games'
        ? allGamesList
        : allGamesList.filter(g => g.category === selectedCategory || (selectedCategory === 'Puzzle' && (g.category === 'Puzzle' || g.category === 'Word Games')));

    const handleSelectGame = (game) => {
        navigation.navigate('SelectLevel', {
            game: game.title,
            title: game.title,
            difficulty: game.difficulty,
            color: game.color,
            currentLevel: game.currentLevel,
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <View style={styles.titleRow}>
                        <Text style={styles.headerTitle}>Arcade Arena</Text>
                        <View style={styles.liveBadge}>
                            <Text style={styles.liveText}>6 GAMES</Text>
                        </View>
                    </View>
                    <Text style={styles.headerSubtitle}>Select any game to view its Level Map</Text>
                </View>

                <View style={styles.headerStatPill}>
                    <Text style={styles.headerStatText}>⭐ 148 Stars</Text>
                </View>
            </View>

            {/* Scrollable Content */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Featured Game Card Banner */}
                <TouchableOpacity
                    style={styles.featuredCard}
                    activeOpacity={0.9}
                    onPress={() => handleSelectGame(allGamesList[0])}
                >
                    <View style={styles.featuredBadgeRow}>
                        <View style={styles.featuredTag}>
                            <Text style={styles.featuredTagText}>FEATURED ODYSSEY</Text>
                        </View>
                        <View style={styles.featuredActivePill}>
                            <Text style={styles.featuredActiveText}>Lv. 12 ACTIVE</Text>
                        </View>
                    </View>
                    <Text style={styles.featuredTitle}>Word Jumble Odyssey</Text>
                    <Text style={styles.featuredDesc}>Embark on a word journey through Sugar Valley, Honeycomb Hills, and Sky Castle!</Text>
                    <View style={styles.featuredPlayButton}>
                        <Text style={styles.featuredPlayText}>Open Level Map ▶</Text>
                    </View>
                </TouchableOpacity>

                {/* Categories */}
                <View style={styles.categoriesWrapper}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesScroll}>
                        {categories.map((cat) => {
                            const isActive = selectedCategory === cat;
                            return (
                                <TouchableOpacity
                                    key={cat}
                                    style={[styles.categoryPill, isActive && styles.categoryPillActive]}
                                    onPress={() => setSelectedCategory(cat)}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                                        {cat}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Games Grid List */}
                <View style={styles.gamesList}>
                    {filteredGames.map((game) => (
                        <TouchableOpacity
                            key={game.id}
                            style={styles.gameCard}
                            activeOpacity={0.88}
                            onPress={() => handleSelectGame(game)}
                        >
                            <View style={styles.gameCardTop}>
                                <View style={[styles.gameIconBox, { backgroundColor: game.color }]}>
                                    <Text style={styles.gameIconText}>{game.icon}</Text>
                                </View>
                                <View style={styles.gameCardInfo}>
                                    <View style={styles.gameTitleRow}>
                                        <Text style={styles.gameCardTitle}>{game.title}</Text>
                                        <View style={[styles.difficultyBadge, { backgroundColor: `${game.diffColor}15` }]}>
                                            <Text style={[styles.difficultyText, { color: game.diffColor }]}>
                                                {game.difficulty}
                                            </Text>
                                        </View>
                                    </View>
                                    <Text style={styles.gameDesc} numberOfLines={2}>{game.desc}</Text>
                                </View>
                            </View>

                            <View style={styles.gameCardBottom}>
                                <View style={styles.levelProgressPill}>
                                    <Text style={styles.levelProgressText}>Level {game.currentLevel}/{game.totalLevels}</Text>
                                </View>
                                <View style={styles.playMapButton}>
                                    <Text style={styles.playMapButtonText}>View Level Map ▶</Text>
                                </View>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#F1F5F9',
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: '#1E293B',
    },
    liveBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    liveText: {
        color: '#4F46E5',
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: '#64748B',
        marginTop: 2,
    },
    headerStatPill: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 14,
    },
    headerStatText: {
        color: '#D97706',
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 30,
    },
    featuredCard: {
        backgroundColor: '#4F46E5',
        borderRadius: 22,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 12,
        elevation: 8,
    },
    featuredBadgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    featuredTag: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    featuredTagText: {
        color: '#FFFFFF',
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    featuredActivePill: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 8,
    },
    featuredActiveText: {
        color: '#78350F',
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    featuredTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: fonts.bold,
        fontWeight: '900',
        marginBottom: 6,
    },
    featuredDesc: {
        color: '#E0E7FF',
        fontSize: 12,
        lineHeight: 18,
        marginBottom: 14,
    },
    featuredPlayButton: {
        backgroundColor: '#FFFFFF',
        alignSelf: 'flex-start',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 14,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    featuredPlayText: {
        color: '#4F46E5',
        fontSize: 12,
        fontFamily: fonts.bold,
        fontWeight: '900',
    },
    categoriesWrapper: {
        marginBottom: 16,
    },
    categoriesScroll: {
        gap: 8,
    },
    categoryPill: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E2E8F0',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 16,
        marginRight: 6,
    },
    categoryPillActive: {
        backgroundColor: '#4F46E5',
        borderColor: '#4F46E5',
    },
    categoryText: {
        color: '#64748B',
        fontSize: 12,
        fontFamily: fonts.medium,
        fontWeight: '600',
    },
    categoryTextActive: {
        color: '#FFFFFF',
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
    gamesList: {
        gap: 14,
    },
    gameCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        padding: 14,
        borderWidth: 1,
        borderColor: '#F1F5F9',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        marginBottom: 12,
    },
    gameCardTop: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    gameIconBox: {
        width: 50,
        height: 50,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    gameIconText: {
        fontSize: 24,
    },
    gameCardInfo: {
        flex: 1,
    },
    gameTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    gameCardTitle: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#1E293B',
    },
    difficultyBadge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 6,
    },
    difficultyText: {
        fontSize: 9,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
    gameDesc: {
        color: '#64748B',
        fontSize: 11,
        lineHeight: 15,
    },
    gameCardBottom: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: '#F8FAFC',
    },
    levelProgressPill: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 10,
    },
    levelProgressText: {
        color: '#475569',
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '700',
    },
    playMapButton: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    playMapButtonText: {
        color: '#4F46E5',
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '800',
    },
});
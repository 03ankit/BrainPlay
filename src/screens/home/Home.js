import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colour';

const { width } = Dimensions.get('window');

const categories = ['All', 'Puzzle', 'Brain', 'Memory', 'Logic'];

const games = [
    { id: '1', title: 'Word Jumble', difficulty: 'MEDIUM', diffColor: colors.orange, hs: 4500, icon: '🧩', color: colors.purplePlay },
    { id: '2', title: 'Color Match', difficulty: 'EASY', diffColor: colors.green, hs: 2100, icon: '🎨', color: colors.rose },
    { id: '3', title: 'Memory Cards', difficulty: 'HARD', diffColor: colors.red, hs: 850, icon: '🧠', color: colors.purpleLight },
    { id: '4', title: '2048', difficulty: 'MEDIUM', diffColor: colors.orange, hs: 12400, icon: '🔢', color: colors.blue },
    { id: '5', title: 'Word Search', difficulty: 'EASY', diffColor: colors.green, hs: 3200, icon: '🔍', color: colors.violet },
];

export default function Home({ navigation }) {
    const insets = useSafeAreaInsets();

    const handlePlayGame = (game) => {
        navigation.navigate('SelectLevel', {
            game: game.title,
            title: game.title,
            difficulty: game.difficulty,
            color: game.color,
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* Header */}
                <View style={styles.header}>
                    <Image source={require('../../assets/image/user.png')} style={styles.avatar} />
                    <Text style={styles.headerTitle}>BrainPlay</Text>
                    <View style={styles.levelPill}>
                        <Text style={styles.levelText}>Lv. 24 • 1,250 🏆</Text>
                    </View>
                </View>

                {/* Daily Challenge Section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Daily Challenge</Text>
                    <TouchableOpacity>
                        <Text style={styles.viewAll}>View All</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dailyScroll} contentContainerStyle={styles.dailyContent}>
                    <View style={styles.challengeCard}>
                        <Text style={styles.ongoingText}>ONGOING</Text>
                        <Text style={styles.challengeTitle}>Memory Marathon</Text>
                        <View style={styles.timerRow}>
                            <Text style={styles.timerIcon}>⏱</Text>
                            <Text style={styles.timerText}>Ends in 2h 14m</Text>
                        </View>
                    </View>
                    <View style={[styles.challengeCard, { backgroundColor: colors.darkBlue }]}>
                        <Text style={styles.ongoingText}>NEW</Text>
                        <Text style={styles.challengeTitle}>Math Genius</Text>
                        <View style={styles.timerRow}>
                            <Text style={styles.timerIcon}>⭐</Text>
                            <Text style={styles.timerText}>Reward: 500 pts</Text>
                        </View>
                    </View>
                </ScrollView>

                {/* Categories */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll} contentContainerStyle={styles.categoryContent}>
                    {categories.map((cat, index) => (
                        <TouchableOpacity key={index} style={[styles.categoryPill, index === 0 && styles.categoryPillActive]}>
                            <Text style={[styles.categoryText, index === 0 && styles.categoryTextActive]}>{cat}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Games Grid */}
                <View style={styles.gridContainer}>
                    {games.map((game) => (
                        <TouchableOpacity
                            key={game.id}
                            style={styles.gameCard}
                            activeOpacity={0.85}
                            onPress={() => handlePlayGame(game)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: game.color }]}>
                                <Text style={styles.iconText}>{game.icon}</Text>
                            </View>
                            <Text style={styles.gameTitle}>{game.title}</Text>
                            
                            <View style={styles.difficultyRow}>
                                <View style={[styles.dot, { backgroundColor: game.diffColor }]} />
                                <Text style={styles.difficultyText}>{game.difficulty}</Text>
                            </View>

                            <Text style={styles.hsText}>HS: {game.hs}</Text>

                            <View style={styles.playButton}>
                                <Text style={styles.playButtonText}>Play</Text>
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
        backgroundColor: colors.background,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        justifyContent: 'space-between',
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.avatarBg,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: colors.primary,
        flex: 1,
        marginLeft: 12,
    },
    levelPill: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    levelText: {
        color: colors.primary,
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginTop: 10,
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.darkBlue,
    },
    viewAll: {
        color: colors.primary,
        fontWeight: '600',
        fontSize: 14,
    },
    dailyScroll: {
        flexGrow: 0,
    },
    dailyContent: {
        paddingHorizontal: 20,
        gap: 16,
    },
    challengeCard: {
        width: width * 0.75,
        height: 160,
        backgroundColor: colors.darkPurple,
        borderRadius: 20,
        padding: 20,
        justifyContent: 'flex-end',
        marginRight: 16,
    },
    ongoingText: {
        color: colors.grayLight,
        fontSize: 10,
        fontWeight: 'bold',
        letterSpacing: 1,
        marginBottom: 8,
    },
    challengeTitle: {
        color: colors.white,
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    timerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timerIcon: {
        fontSize: 14,
        marginRight: 6,
    },
    timerText: {
        color: colors.grayLighter,
        fontSize: 12,
        fontWeight: '500',
    },
    categoryScroll: {
        marginTop: 24,
        flexGrow: 0,
        marginBottom: 20,
    },
    categoryContent: {
        paddingHorizontal: 20,
        gap: 12,
    },
    categoryPill: {
        backgroundColor: colors.primaryLight,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        marginRight: 12,
    },
    categoryPillActive: {
        backgroundColor: colors.primary,
    },
    categoryText: {
        color: colors.gray,
        fontWeight: '600',
        fontSize: 14,
    },
    categoryTextActive: {
        color: colors.white,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingHorizontal: 16,
        justifyContent: 'space-between',
    },
    gameCard: {
        width: (width - 48) / 2,
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 16,
        marginBottom: 16,
        shadowColor: colors.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    iconText: {
        fontSize: 24,
    },
    gameTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: colors.darkBlue,
        marginBottom: 8,
    },
    difficultyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    difficultyText: {
        fontSize: 10,
        fontWeight: 'bold',
        color: colors.grayDark,
        letterSpacing: 0.5,
    },
    hsText: {
        fontSize: 12,
        color: colors.gray,
        marginBottom: 16,
    },
    playButton: {
        backgroundColor: colors.purplePlay,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    playButtonText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 14,
    }
});
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    ScrollView,
    Image,
    SafeAreaView,
    FlatList,
    Dimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images'; 
import LevelCard from '../../components/game/LevelCard';

const { width } = Dimensions.get('window');

const filters = [
    { id: 'all', label: 'All', color: colors.primary, dotColor: null, bgColor: colors.primary, textColor: colors.white },
    { id: 'easy', label: 'Easy', color: colors.green, dotColor: colors.green, bgColor: colors.greenLight, textColor: colors.greenDark },
    { id: 'medium', label: 'Medium', color: colors.orange, dotColor: colors.orange, bgColor: colors.orangeLight, textColor: colors.orangeDark },
    { id: 'hard', label: 'Hard', color: colors.red, dotColor: colors.red, bgColor: colors.redLight, textColor: colors.redDark },
    { id: 'boss', label: 'Boss', color: colors.violet, dotColor: colors.violet, bgColor: colors.violetLight, textColor: colors.violetDark },
];

const generateLevels = () => {
    const generated = [];
    for (let i = 1; i <= 20; i++) {
        let type = 'Easy';
        let shortType = 'Easy';
        if (i > 5 && i <= 11) { type = 'Medium'; shortType = 'Med'; }
        else if (i > 11 && i <= 18) { type = 'Hard'; shortType = 'Hard'; }
        else if (i === 19) { type = 'Expert'; shortType = 'Expert'; }
        
        let isLocked = i > 12;
        let isCurrent = i === 12;
        let stars = (!isLocked && !isCurrent) ? (i === 8 || i === 11 ? 2 : 3) : 0;

        if (i === 20) {
            generated.push({ id: `lvl_empty`, isEmpty: true });
            generated.push({ id: `lvl_${i}`, level: 20, type: 'Boss', shortType: 'Boss', isLocked: true, isBoss: true, subtitle: 'Final Boss' });
        } else {
            generated.push({
                id: `lvl_${i}`,
                level: i,
                type: type,
                shortType: shortType,
                isLocked,
                isCurrent,
                stars,
                isBoss: false
            });
        }
    }
    return generated;
};

const levels = generateLevels();

export default function SelectLevel({ navigation }) {
    const insets = useSafeAreaInsets();
    const [activeFilter, setActiveFilter] = useState('all');

    const handleBack = () => {
        if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerLeft}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    {images?.back ? <Image source={images.back} style={styles.backIcon} /> : <Text style={styles.backText}>←</Text>}
                </TouchableOpacity>
                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerTitle}>Select Level</Text>
                    <Text style={styles.headerSubtitle}>BrainPlay Arcade</Text>
                </View>
            </View>
            <View style={styles.headerRight}>
                <View style={styles.starPill}>
                    <Text style={styles.starText}>⭐ 34/60</Text>
                </View>
            </View>
        </View>
    );
    
    const renderSubHeader = () => (
        <View style={styles.subHeader}>
            <View style={styles.subHeaderLeft}>
                <View style={styles.gamePill}>
                    <Text style={styles.gamePillText}>Word Jumble</Text>
                </View>
                <Text style={styles.levelsText}>Levels 1–20</Text>
            </View>
            <View style={styles.currentLevelPill}>
                <View style={styles.dotCurrent} />
                <Text style={styles.currentLevelText}>Current: Level 12</Text>
            </View>
        </View>
    );

    const renderFilters = () => (
        <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                {filters.map((filter) => {
                    const isActive = activeFilter === filter.id;
                    return (
                        <TouchableOpacity
                            key={filter.id}
                            style={[
                                styles.filterChip,
                                { backgroundColor: filter.bgColor },
                                isActive && filter.id === 'all' ? { backgroundColor: colors.primary } : null,
                                !isActive && filter.id === 'all' ? { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.primary } : null
                            ]}
                            onPress={() => setActiveFilter(filter.id)}
                        >
                            {filter.dotColor && <View style={[styles.filterDot, { backgroundColor: filter.dotColor }]} />}
                            <Text style={[styles.filterText, { color: filter.textColor }, !isActive && filter.id === 'all' ? { color: colors.primary } : null]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            {renderHeader()}
            
            {/* White wrapper for content below header */}
            <View style={styles.contentWrapper}>
                {renderSubHeader()}
                {renderFilters()}

                <View style={styles.cardsContainer}>
                    <FlatList
                        data={levels}
                        renderItem={({ item }) => <LevelCard item={item} />}
                        keyExtractor={item => item.id}
                        numColumns={3}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.cardsList}
                        columnWrapperStyle={styles.row}
                        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
                    />
                </View>
            </View>

            {/* Bottom Floating Action Bar */}
            <View style={[styles.bottomBarContainer, { paddingBottom: Math.max(insets.bottom, 20) }]}>
                <View style={styles.bottomBar}>
                    <View style={styles.bottomLeft}>
                        <View style={styles.currentStageCircle}>
                            <Text style={styles.currentStageLevel}>12</Text>
                        </View>
                        <View style={styles.currentStageTextContainer}>
                            <Text style={styles.currentStageLabel}>CURRENT STAGE</Text>
                            <Text style={styles.currentStageTitle}>Stage 12 • Prefixes & Roots</Text>
                        </View>
                    </View>
                    <TouchableOpacity style={styles.playButton} onPress={() => navigation.navigate('WordJumbleDetail')}>
                        <Text style={styles.playButtonText}>PLAY LEVEL 12 ▶</Text>
                    </TouchableOpacity>
                </View>
            </View>
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
        paddingTop: 10,
        paddingBottom: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginRight: 16,
    },
    backIcon: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
    },
    backText: {
        fontSize: 24,
        color: colors.darkGray,
    },
    headerTextContainer: {},
    headerTitle: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: colors.darkGray,
        lineHeight: 22,
    },
    headerSubtitle: {
        fontSize: 12,
        fontFamily: fonts.regular,
        color: colors.gray,
    },
    headerRight: {
        flexDirection: 'row',
        gap: 8,
    },
    coinPill: {
        backgroundColor: '#FFFBEB',
        borderWidth: 1,
        borderColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    coinText: {
        fontSize: 12,
        fontFamily: fonts.bold,
        color: '#D97706',
    },
    starPill: {
        backgroundColor: '#F5F3FF',
        borderWidth: 1,
        borderColor: '#EDE9FE',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 16,
    },
    starText: {
        fontSize: 12,
        fontFamily: fonts.bold,
        color: '#7C3AED',
    },
    contentWrapper: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        borderTopWidth: 1,
        borderTopColor: '#F1F5F9',
    },
    subHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    subHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    gamePill: {
        backgroundColor: colors.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    gamePillText: {
        color: colors.white,
        fontSize: 12,
        fontFamily: fonts.bold,
    },
    levelsText: {
        fontSize: 14,
        color: colors.darkGray,
        fontFamily: fonts.medium,
    },
    currentLevelPill: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        gap: 6,
    },
    dotCurrent: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.primary,
    },
    currentLevelText: {
        color: colors.primary,
        fontSize: 12,
        fontFamily: fonts.bold,
    },
    filterContainer: {
        marginBottom: 16,
    },
    filterScroll: {
        paddingHorizontal: 20,
        gap: 10,
    },
    filterChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginRight: 8,
    },
    filterDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginRight: 6,
    },
    filterText: {
        fontSize: 13,
        fontFamily: fonts.medium,
    },
    cardsContainer: {
        flex: 1,
        paddingBottom: 100, // Space for bottom bar
    },
    cardsList: {
        paddingHorizontal: 20,
        paddingBottom: 20,
    },
    row: {
        justifyContent: 'space-between',
    },
    bottomBarContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    bottomBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    bottomLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    currentStageCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#4F46E5', // Primary blue
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    currentStageLevel: {
        color: '#FFFFFF',
        fontSize: 20,
        fontFamily: fonts.bold,
    },
    currentStageTextContainer: {
        flex: 1,
    },
    currentStageLabel: {
        color: '#4F46E5',
        fontSize: 12,
        fontFamily: fonts.bold,
        marginBottom: 2,
    },
    currentStageTitle: {
        color: '#111827',
        fontSize: 14,
        fontFamily: fonts.bold,
    },
    playButton: {
        backgroundColor: '#4F46E5',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderRadius: 20,
        marginLeft: 10,
    },
    playButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontFamily: fonts.bold,
    },
});

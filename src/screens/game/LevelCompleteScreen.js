import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import images from '../../constants/images';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

const { width, height } = Dimensions.get('window');

export default function LevelCompleteScreen({ navigation, route }) {
    const insets = useSafeAreaInsets();

    const levelNumber = Number(route?.params?.level) || 12;
    const timeTaken = route?.params?.timeTaken || '00:12';
    const stars = Number(route?.params?.stars) || 3;
    const title = route?.params?.title || 'Mastermind!';
    const gameTitle = route?.params?.game || 'Word Jumble';

    // Continue to Next Level
    const handleContinue = () => {
        const nextLevel = levelNumber + 1;
        navigation.navigate('WordPuzzleScreen', {
            level: nextLevel,
            game: gameTitle,
        });
    };

    // Navigate to Level Map / Home
    const handleHome = () => {
        navigation.navigate('SelectLevel', {
            level: levelNumber + 1,
            game: gameTitle,
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingBottom: Math.max(insets.bottom, 24) },
                ]}
            >
                {/* 1. Top Trophy Hero Artwork Banner */}
                <View style={styles.heroBannerContainer}>
                    <Image
                        source={images.trophy}
                        style={styles.trophyBannerImage}
                        resizeMode="cover"
                    />
                </View>

                {/* 2. Main White Bottom Card */}
                <View style={styles.cardContainer}>

                    {/* Level Banner Subtitle & Title */}
                    <Text style={styles.levelSubtitle}>
                        LEVEL {levelNumber} COMPLETE
                    </Text>
                    <Text style={styles.mainTitle}>{title}</Text>

                    {/* Earned Stars Rating */}
                    <View style={styles.starsRow}>
                        {[1, 2, 3].map((starNum) => (
                            <Text
                                key={`star_${starNum}`}
                                style={[
                                    styles.starIcon,
                                    starNum > stars && styles.starDimmed,
                                ]}
                            >
                                ⭐
                            </Text>
                        ))}
                    </View>

                    {/* Time Taken Stat Card */}
                    <View style={styles.statCard}>
                        <View style={styles.statRow}>
                            <Text style={styles.clockIcon}>⏱</Text>
                            <Text style={styles.statLabel}>TIME TAKEN</Text>
                        </View>
                        <Text style={styles.statValue}>{timeTaken}</Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Continue Button */}
                        <TouchableOpacity
                            style={styles.continueButton}
                            activeOpacity={0.88}
                            onPress={handleContinue}
                        >
                            <Text style={styles.continueText}>Continue</Text>
                        </TouchableOpacity>

                        {/* Home Button */}
                        <TouchableOpacity
                            style={styles.homeButton}
                            activeOpacity={0.85}
                            onPress={handleHome}
                        >
                            <Text style={styles.homeText}>Home</Text>
                        </TouchableOpacity>
                    </View>

                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.darkPurple || '#1E1B4B', // Deep dark purple background matching top artwork
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'space-between',
    },
    heroBannerContainer: {
        width: width,
        height: height * 0.42,
        backgroundColor: colors.darkPurple || '#1E1B4B',
        position: 'relative',
    },
    trophyBannerImage: {
        width: '100%',
        height: '100%',
    },
    cardContainer: {
        flex: 1,
        backgroundColor: colors.white,
        borderTopLeftRadius: 36,
        borderTopRightRadius: 36,
        paddingHorizontal: 28,
        paddingTop: 32,
        paddingBottom: 20,
        alignItems: 'center',
        marginTop: -30, // Overlap banner smoothly
    },
    levelSubtitle: {
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.primary,
        letterSpacing: 1.5,
        marginBottom: 6,
        textAlign: 'center',
    },
    mainTitle: {
        fontSize: 30,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
        marginBottom: 8,
        textAlign: 'center',
    },
    starsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 20,
    },
    starIcon: {
        fontSize: 28,
    },
    starDimmed: {
        opacity: 0.25,
    },
    statCard: {
        width: '100%',
        backgroundColor: colors.primaryLight,
        borderRadius: 22,
        paddingVertical: 18,
        paddingHorizontal: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 32,
    },
    statRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 4,
    },
    clockIcon: {
        fontSize: 15,
        color: colors.primary,
    },
    statLabel: {
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.gray,
        letterSpacing: 1,
    },
    statValue: {
        fontSize: 28,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
    },
    buttonGroup: {
        width: '100%',
        gap: 14,
    },
    continueButton: {
        width: '100%',
        height: 56,
        borderRadius: 22,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 6,
    },
    continueText: {
        fontSize: 17,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
    homeButton: {
        width: '100%',
        height: 56,
        borderRadius: 22,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.grayBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    homeText: {
        fontSize: 17,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.primary,
    },
});

import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import streakRepository from '../../database/repositories/streakRepository';
import { executeSql } from '../../database/database';

// Custom Components
import UserProfileCard from '../../components/UserProfileCard';
import WeeklyStreakCard from '../../components/WeeklyStreakCard';

export default function Profile({ navigation }) {
    const insets = useSafeAreaInsets();

    const [userProfile, setUserProfile] = useState({
        name: 'BrainPlayer',
        level: 1,
        coins: 100,
    });

    const [streakData, setStreakData] = useState({
        completedDays: 0,
        totalDays: 7,
        days: [
            { day: 'M', status: 'Locked' },
            { day: 'T', status: 'Locked' },
            { day: 'W', status: 'Locked' },
            { day: 'T', status: 'Locked' },
            { day: 'F', status: 'Locked' },
            { day: 'S', status: 'Locked' },
            { day: 'S', status: 'Locked' },
        ],
    });

    // Fetch live SQLite streak & profile data on focus
    useFocusEffect(
        useCallback(() => {
            const loadData = async () => {
                try {
                    // Load streak
                    const sData = await streakRepository.getWeeklyStreak('local_player');
                    if (sData) {
                        setStreakData(sData);
                    }

                    // Load user profile
                    const pRes = await executeSql('SELECT * FROM profiles WHERE id = ?;', ['local_player']);
                    if (pRes && pRes.rows && pRes.rows.length > 0) {
                        const item = pRes.rows.item(0);
                        setUserProfile({
                            name: item.name || 'BrainPlayer',
                            level: item.level || 1,
                            coins: item.coins !== undefined ? item.coins : 100,
                        });
                    }
                } catch (err) {
                    console.error('Error fetching profile or streak data:', err);
                }
            };
            loadData();
        }, [])
    );

    const handleSettingsPress = () => {
        navigation.navigate('Settings');
    };

    const handleShareProgress = () => {
        Alert.alert("Share Progress", "Sharing your progress with friends!");
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>BrainPlay</Text>
                    <View style={styles.levelPill}>
                        <Text style={styles.levelText}>Lv. {userProfile.level} • {userProfile.coins} 🪙</Text>
                    </View>
                </View>

                {/* Main Profile Card (Custom Component) */}
                <UserProfileCard
                    name={userProfile.name}
                    level={userProfile.level}
                    avatarSource={images.person}
                />

                {/* Settings Button */}
                <TouchableOpacity
                    style={styles.settingsButton}
                    onPress={handleSettingsPress}
                    activeOpacity={0.8}
                >
                    <Image source={images.settings} style={styles.settingsIcon} />
                    <Text style={styles.settingsText}>Settings</Text>
                </TouchableOpacity>

                {/* Weekly Streak Card (Custom Component) */}
                <WeeklyStreakCard
                    title="Weekly Streak"
                    completedDays={streakData.completedDays}
                    totalDays={streakData.totalDays || 7}
                    onPress={() => navigation.navigate('WeeklyStreakDetail')}
                    days={streakData.days}
                />

                {/* Share Progress Button */}
                <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShareProgress}
                    activeOpacity={0.85}
                >
                    <Image source={images.share} style={styles.shareIcon} />
                    <Text style={styles.shareText}>Share Progress</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    headerAvatar: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: colors.avatarBg,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.primary,
        flex: 1,
        marginLeft: 12,
    },
    levelPill: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
    },
    levelText: {
        color: colors.primary,
        fontSize: 13,
        fontFamily: fonts.bold,
    },
    settingsButton: {
        backgroundColor: '#EEF2FF',
        borderRadius: 20,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    settingsIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
        resizeMode: 'contain',
        tintColor: colors.primary,
    },
    settingsText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.primary,
    },
    shareButton: {
        backgroundColor: colors.purplePlay,
        borderRadius: 20,
        paddingVertical: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 3,
        shadowColor: colors.purplePlay,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    shareIcon: {
        width: 16,
        height: 16,
        marginRight: 8,
        resizeMode: 'contain',
        tintColor: colors.white,
    },
    shareText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        color: colors.white,
    },
});
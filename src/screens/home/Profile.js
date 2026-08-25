import React from 'react';
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
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';

// Custom Components
import UserProfileCard from '../../components/UserProfileCard';
import WeeklyStreakCard from '../../components/WeeklyStreakCard';

export default function Profile({ navigation }) {
    const insets = useSafeAreaInsets();

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
                        <Text style={styles.levelText}>Lv. 24 • 1,250 🪙</Text>
                    </View>
                </View>

                {/* Main Profile Card (Custom Component) */}
                <UserProfileCard
                    name="Alex Rivet"
                    // role="Master of Logic • Member since June '23"
                    level={24}
                    // currentXp={2450}
                    // maxXp={3000}
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
                    completedDays={4}
                    totalDays={7}
                    onPress={() => navigation.navigate('WeeklyStreakDetail')}
                    days={[
                        { day: 'M', status: 'Done' },
                        { day: 'T', status: 'Done' },
                        { day: 'W', status: 'Done' },
                        { day: 'T', status: 'Done' },
                        { day: 'F', status: 'Next' },
                        { day: 'S', status: 'Locked' },
                        { day: 'S', status: 'Locked' },
                    ]}
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
import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
    Modal,
    Platform,
    PermissionsAndroid,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import streakRepository, { STREAK_TIERS } from '../../database/repositories/streakRepository';
import { executeSql } from '../../database/database';

// Custom Components
import UserProfileCard from '../../components/UserProfileCard';
import WeeklyStreakCard from '../../components/WeeklyStreakCard';

export default function Profile({ navigation }) {
    const insets = useSafeAreaInsets();

    const [userProfile, setUserProfile] = useState({
        name: 'BrainPlayer',
        level: 1,
        coins: 0,
    });
    const [modalVisible, setModalVisible] = useState(false);

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
                            coins: item.coins !== undefined ? item.coins : 0,
                            image: item.image || null,
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

    const requestCameraPermission = async () => {
        if (Platform.OS === 'android') {
            try {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.CAMERA,
                    {
                        title: 'Camera Permission',
                        message: 'BrainPlay needs access to your camera to take a profile picture.',
                        buttonNeutral: 'Ask Me Later',
                        buttonNegative: 'Cancel',
                        buttonPositive: 'OK',
                    },
                );
                return granted === PermissionsAndroid.RESULTS.GRANTED;
            } catch (err) {
                console.warn('Permission request error:', err);
                return false;
            }
        }
        return true;
    };

    const updateAvatar = async (uri) => {
        try {
            await executeSql(
                'UPDATE profiles SET image = ?, updated_at = datetime("now") WHERE id = ?;',
                [uri, 'local_player']
            );
            setUserProfile((prev) => ({ ...prev, image: uri }));
        } catch (err) {
            console.error('Error updating profile image:', err);
        }
    };

    const handleCameraClick = async () => {
        setModalVisible(false);
        const hasPermission = await requestCameraPermission();
        if (!hasPermission) {
            console.log('Camera permission denied');
            return;
        }

        const options = {
            mediaType: 'photo',
            saveToPhotos: true,
            quality: 0.8,
        };

        launchCamera(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera picker');
            } else if (response.errorCode) {
                console.log('Camera Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                await updateAvatar(response.assets[0].uri);
            }
        });
    };

    const handleGalleryClick = () => {
        setModalVisible(false);
        const options = {
            mediaType: 'photo',
            quality: 0.8,
            selectionLimit: 1,
        };

        launchImageLibrary(options, async (response) => {
            if (response.didCancel) {
                console.log('User cancelled library picker');
            } else if (response.errorCode) {
                console.log('Library Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                await updateAvatar(response.assets[0].uri);
            }
        });
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
                    {/* <View style={styles.levelPill}>
                        <Text style={styles.levelText}>Lv. {userProfile.level} • {userProfile.coins} 🪙</Text>
                    </View> */}
                </View>

                {/* Main Profile Card (Custom Component) */}
                <UserProfileCard
                    name={userProfile.name}
                    level={userProfile.level}
                    coins={userProfile.coins}
                    avatarSource={userProfile.image ? { uri: userProfile.image } : images.person}
                    tier={streakData?.tier}
                    onEditPhoto={() => setModalVisible(true)}
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
                    tier={streakData?.tier}
                />

                {/* Streak Ranks League Card */}
                <View style={styles.streakRanksCard}>
                    <TouchableOpacity
                        style={styles.streakRanksHeaderRow}
                        activeOpacity={0.7}
                        onPress={() => navigation.navigate('WeeklyStreakDetail')}
                    >
                        <View style={styles.streakRanksTitleContainer}>
                            <View style={styles.streakRanksTitleRow}>
                                <Image source={images.fire} style={styles.fireIconSmall} resizeMode="contain" />
                                <Text style={styles.streakRanksTitle}>Streak Ranks</Text>
                            </View>
                            <Text style={styles.streakRanksSubtitle}>
                                Rank 1 → 2 → 3 in each tier (7 days per rank)
                            </Text>
                        </View>
                        <View style={styles.streakRanksBadgeContainer}>
                            <View style={[styles.currentTierBadge, { backgroundColor: (streakData?.tier?.color || '#CD7F32') + '22' }]}>
                                <Text style={[styles.currentTierBadgeText, { color: streakData?.tier?.color || '#CD7F32' }]}>
                                    {streakData?.tier?.title || 'Bronze I'}
                                </Text>
                            </View>
                            <Text style={styles.chevronIcon}>›</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Horizontal Scroll of Ranks */}
                    <ScrollView
                        horizontal
                        nestedScrollEnabled={true}
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.tiersScrollRow}
                        keyboardShouldPersistTaps="handled"
                    >
                        {STREAK_TIERS.map((tierItem) => {
                            const isUnlocked = (streakData?.streakCount || 0) >= tierItem.minDays;
                            const isCurrent = streakData?.tier?.tierId === tierItem.id;
                            const badgeImg = images[tierItem.badgeKey];

                            return (
                                <TouchableOpacity
                                    key={tierItem.id}
                                    activeOpacity={0.8}
                                    onPress={() => navigation.navigate('WeeklyStreakDetail')}
                                    style={[
                                        styles.tierCard,
                                        isCurrent && styles.tierCardActive,
                                        !isUnlocked && styles.tierCardLocked,
                                    ]}
                                >
                                    {isCurrent && (
                                        <View style={[styles.currentTag, { backgroundColor: tierItem.color }]}>
                                            <Text style={styles.currentTagText}>{streakData?.tier?.division || 'I'}</Text>
                                        </View>
                                    )}

                                    <View style={styles.badgeWrapper}>
                                        <Image
                                            source={badgeImg}
                                            style={[
                                                styles.tierBadge,
                                                !isUnlocked && styles.tierBadgeLocked,
                                            ]}
                                            resizeMode="contain"
                                        />
                                        {!isUnlocked && (
                                            <View style={styles.lockBox}>
                                                <Image source={images.lock} style={styles.lockIcon} resizeMode="contain" />
                                            </View>
                                        )}
                                    </View>

                                    <Text style={[styles.tierName, isCurrent && { color: tierItem.color, fontWeight: 'bold' }]}>
                                        {tierItem.name}
                                    </Text>

                                    {/* Division Pills */}
                                    <View style={styles.divisionRow}>
                                        {tierItem.divisions.map((div) => {
                                            const isDivActive = isCurrent && streakData?.tier?.division === div;
                                            return (
                                                <Text
                                                    key={div}
                                                    style={[
                                                        styles.divisionText,
                                                        isDivActive && { color: tierItem.color, fontWeight: 'bold', backgroundColor: tierItem.color + '22' },
                                                    ]}
                                                >
                                                    {div}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                </TouchableOpacity>
                            );
                        })}
                    </ScrollView>
                </View>

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

            {/* Choose Profile Photo Modal */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPressOut={() => setModalVisible(false)}
                >
                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={() => {}}
                        style={styles.modalContent}
                    >
                        <Text style={styles.modalTitle}>Choose Profile Photo</Text>
                        <Text style={styles.modalSubtitle}>
                            Select a source to upload your avatar
                        </Text>

                        <View style={styles.optionRow}>
                            <TouchableOpacity
                                style={styles.optionBtn}
                                onPress={handleCameraClick}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: '#EEF2FF' }]}>
                                    <Image source={images.camera} style={[styles.optionIcon, { tintColor: colors.primary }]} />
                                </View>
                                <Text style={styles.optionText}>Camera</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.optionBtn}
                                onPress={handleGalleryClick}
                                activeOpacity={0.8}
                            >
                                <View style={[styles.iconContainer, { backgroundColor: '#F5F3FF' }]}>
                                    <Image source={images.gallery} style={[styles.optionIcon, { tintColor: '#8B5CF6' }]} />
                                </View>
                                <Text style={styles.optionText}>Gallery</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.cancelBtn}
                            onPress={() => setModalVisible(false)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.cancelBtnText}>Cancel</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                </TouchableOpacity>
            </Modal>
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxWidth: 340,
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: colors.darkGray || '#1E293B',
        marginBottom: 6,
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: fonts.regular || fonts.medium,
        color: colors.gray || '#64748B',
        marginBottom: 24,
        textAlign: 'center',
    },
    optionRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginBottom: 24,
    },
    optionBtn: {
        alignItems: 'center',
        padding: 12,
    },
    iconContainer: {
        width: 64,
        height: 64,
        borderRadius: 32,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
        shadowColor: '#4F46E5',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 2,
    },
    optionIcon: {
        width: 28,
        height: 28,
        resizeMode: 'contain',
    },
    optionText: {
        fontSize: 14,
        fontFamily: fonts.bold,
        color: colors.darkGray || '#1E293B',
    },
    cancelBtn: {
        width: '100%',
        height: 48,
        borderRadius: 12,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    cancelBtnText: {
        fontSize: 14,
        fontFamily: fonts.bold,
        color: colors.gray || '#64748B',
    },
    streakRanksCard: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    streakRanksHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    streakRanksTitleContainer: {
        flex: 1,
        marginRight: 8,
    },
    streakRanksBadgeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    chevronIcon: {
        fontSize: 18,
        color: '#94A3B8',
        fontWeight: 'bold',
    },
    streakRanksTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 2,
    },
    fireIconSmall: {
        width: 18,
        height: 18,
    },
    streakRanksTitle: {
        fontSize: 18,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#1E293B',
    },
    streakRanksSubtitle: {
        fontSize: 12,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
    },
    currentTierBadge: {
        paddingHorizontal: 12,
        paddingVertical: 5,
        borderRadius: 12,
    },
    currentTierBadgeText: {
        fontSize: 12,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
    },
    tiersScrollRow: {
        paddingVertical: 4,
        gap: 12,
    },
    tierCard: {
        width: 86,
        paddingVertical: 12,
        paddingHorizontal: 6,
        borderRadius: 16,
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        alignItems: 'center',
        position: 'relative',
    },
    tierCardActive: {
        borderColor: colors.primary,
        backgroundColor: '#EEF2FF',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.18,
        shadowRadius: 8,
        elevation: 3,
    },
    tierCardLocked: {
        opacity: 0.7,
        backgroundColor: '#F1F5F9',
    },
    currentTag: {
        position: 'absolute',
        top: -8,
        paddingHorizontal: 6,
        paddingVertical: 1.5,
        borderRadius: 6,
    },
    currentTagText: {
        color: colors.white,
        fontSize: 8,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    badgeWrapper: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
        marginTop: 2,
        position: 'relative',
    },
    tierBadge: {
        width: 42,
        height: 42,
    },
    tierBadgeLocked: {
        opacity: 0.35,
    },
    lockBox: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: '#64748B',
        borderRadius: 8,
        padding: 3,
    },
    lockIcon: {
        width: 10,
        height: 10,
        tintColor: colors.white,
    },
    tierName: {
        fontSize: 12,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#334155',
        marginBottom: 2,
        textAlign: 'center',
    },
    divisionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 3,
        marginTop: 2,
    },
    divisionText: {
        fontSize: 9.5,
        fontFamily: fonts.bold || 'Poppins-Bold',
        color: '#94A3B8',
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
    },
});



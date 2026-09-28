import React, { useState, useContext, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Switch,
    Alert,
    Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import { AuthContext } from '../../context/AuthContext';
import playerRepository from '../../database/repositories/playerRepository';

import PersonalDetailsCard from '../../components/PersonalDetailsCard';

export default function Settings({ onBack, navigation }) {
    const insets = useSafeAreaInsets();
    const { signOut } = useContext(AuthContext);

    // Profile state
    const [userProfile, setUserProfile] = useState({
        name: '',
        email: '',
        phone_number: '',
        image: null,
    });

    // Toggle states for Audio & Feedback
    const [soundEffects, setSoundEffects] = useState(true);
    const [bgMusic, setBgMusic] = useState(true);
    const [vibration, setVibration] = useState(true);

    // Logout Modal state
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    // Save Details Success Modal state
    const [saveModalVisible, setSaveModalVisible] = useState(false);

    // Load live profile from SQLite
    useFocusEffect(
        useCallback(() => {
            let isActive = true;
            const loadProfile = async () => {
                try {
                    const profile = await playerRepository.getPlayerProfile('local_player');
                    if (profile && isActive) {
                        setUserProfile({
                            name: profile.name || 'Brain Player',
                            email: profile.email || 'player@brainplay.com',
                            phone_number: profile.phone_number || '',
                            image: profile.image || null,
                        });
                    }
                } catch (err) {
                    console.error('Error fetching profile in Settings:', err);
                }
            };
            loadProfile();
            return () => {
                isActive = false;
            };
        }, [])
    );

    const handleSavePersonalDetails = async (data) => {
        try {
            await playerRepository.savePlayerProfile('local_player', {
                name: data.name,
                email: data.email,
                phone_number: data.phone,
                image: data.image,
            });
            setUserProfile({
                name: data.name,
                email: data.email,
                phone_number: data.phone,
                image: data.image,
            });
            setSaveModalVisible(true);
        } catch (err) {
            console.error('Error saving profile in Settings:', err);
            Alert.alert("Error", "Failed to save personal details. Please try again.");
        }
    };

    const handleBackPress = () => {
        if (onBack) {
            onBack();
        } else if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handleConfirmLogout = () => {
        setLogoutModalVisible(false);
        if (signOut) {
            signOut();
        } else if (navigation && navigation.reset) {
            navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
            });
        } else if (onBack) {
            onBack();
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Top Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleBackPress} activeOpacity={0.7} style={styles.headerLeft}>
                        <Image source={images.back} style={styles.headerBackIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Settings</Text>

                </View>

                {/* Personal Details Custom Component Card */}
                <PersonalDetailsCard
                    initialName={userProfile.name}
                    initialEmail={userProfile.email}
                    initialPhone={userProfile.phone_number}
                    initialImage={userProfile.image}
                    onSave={handleSavePersonalDetails}
                />

                {/* Section: Audio & Feedback */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeaderTitle}>Audio & Feedback</Text>
                    <View style={styles.card}>
                        {/* Sound Effects */}
                        <View style={styles.rowItem}>
                            <View style={styles.rowLeft}>
                                <Image source={images.volume} style={styles.rowImageIcon} />
                                <Text style={styles.rowText}>Sound Effects</Text>
                            </View>
                            <Switch
                                value={soundEffects}
                                onValueChange={setSoundEffects}
                                trackColor={{ false: '#CBD5E1', true: colors.purplePlay || '#6A4BFF' }}
                                thumbColor={colors.white}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Background Music */}
                        <View style={styles.rowItem}>
                            <View style={styles.rowLeft}>
                                <Image source={images.music} style={styles.rowImageIcon} />
                                <Text style={styles.rowText}>Background Music</Text>
                            </View>
                            <Switch
                                value={bgMusic}
                                onValueChange={setBgMusic}
                                trackColor={{ false: '#CBD5E1', true: colors.purplePlay || '#6A4BFF' }}
                                thumbColor={colors.white}
                            />
                        </View>

                        <View style={styles.divider} />

                        {/* Vibration */}
                        <View style={styles.rowItem}>
                            <View style={styles.rowLeft}>
                                <Image source={images.vibration} style={styles.rowImageIcon} />
                                <Text style={styles.rowText}>Vibration</Text>
                            </View>
                            <Switch
                                value={vibration}
                                onValueChange={setVibration}
                                trackColor={{ false: '#CBD5E1', true: colors.purplePlay || '#6A4BFF' }}
                                thumbColor={colors.white}
                            />
                        </View>
                    </View>
                </View>

                {/* Section: Preferences / About BrainPlay */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionHeaderTitle}>About BrainPlay</Text>
                    <View style={styles.card}>
                        {/* Privacy Policy */}
                        <TouchableOpacity
                            style={styles.rowItem}
                            onPress={() => Alert.alert("Privacy Policy", "Opening Privacy Policy...")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowLeft}>
                                <Image source={images.verified} style={styles.rowImageIcon} />
                                <Text style={styles.rowText}>Privacy Policy</Text>
                            </View>
                            <Image source={images.next} style={styles.chevronIcon} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Rate App */}
                        <TouchableOpacity
                            style={styles.rowItem}
                            onPress={() => Alert.alert("Rate App", "Thank you for rating BrainPlay!")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowLeft}>
                                <Image source={images.star} style={styles.rowImageIcon} />
                                <Text style={styles.rowText}>Rate App</Text>
                            </View>
                            <Image source={images.next} style={styles.chevronIcon} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Share App */}
                        <TouchableOpacity
                            style={styles.rowItem}
                            onPress={() => Alert.alert("Share App", "Sharing BrainPlay app...")}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowLeft}>
                                <Image source={images.share} style={styles.rowImageIcon} />
                                <Text style={styles.rowText}>Share App</Text>
                            </View>
                            <Image source={images.next} style={styles.chevronIcon} />
                        </TouchableOpacity>

                        <View style={styles.divider} />

                        {/* Logout */}
                        <TouchableOpacity
                            style={styles.rowItem}
                            onPress={() => setLogoutModalVisible(true)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.rowLeft}>
                                <Image source={images.exit} style={[styles.rowImageIcon, { tintColor: '#EF4444' }]} />
                                <Text style={[styles.rowText, { color: '#EF4444' }]}>Logout</Text>
                            </View>
                            <Image source={images.next} style={styles.chevronIcon} />
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>

            {/* Logout Modal */}
            <Modal
                visible={logoutModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.logoutIconBadge}>
                            <Image source={images.exit} style={styles.modalExitIcon} />
                        </View>
                        <Text style={styles.modalTitle}>Logout</Text>
                        <Text style={styles.modalSubtitle}>
                            Are you sure you want to log out of your account?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={styles.cancelModalBtn}
                                onPress={() => setLogoutModalVisible(false)}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.cancelModalBtnText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.logoutModalBtn}
                                onPress={handleConfirmLogout}
                                activeOpacity={0.85}
                            >
                                <Text style={styles.logoutModalBtnText}>Yes, Logout</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Save Details Success Modal */}
            <Modal
                visible={saveModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSaveModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.saveIconBadge}>
                            <Image source={images.save} style={styles.modalSaveIcon} />
                        </View>
                        <Text style={styles.modalTitle}>Saved Successfully!</Text>
                        <Text style={styles.modalSubtitle}>
                            Your personal details have been updated and saved to your profile.
                        </Text>
                        <TouchableOpacity
                            style={styles.saveOkBtn}
                            onPress={() => setSaveModalVisible(false)}
                            activeOpacity={0.85}
                        >
                            <Text style={styles.saveOkBtnText}>Got it</Text>
                        </TouchableOpacity>
                    </View>
                </View>
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
    headerLeft: {
        marginRight: 12,
    },
    headerBackIcon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: colors.primary,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.primary,
        flex: 1,
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
    sectionContainer: {
        marginBottom: 20,
    },
    sectionHeaderTitle: {
        fontSize: 15,
        fontFamily: fonts.medium,
        color: '#64748B',
        marginBottom: 10,
        paddingLeft: 4,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 20,
        paddingHorizontal: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 8,
    },
    rowItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
    },
    rowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    rowIcon: {
        fontSize: 20,
        marginRight: 14,
        width: 24,
        textAlign: 'center',
    },
    rowImageIcon: {
        width: 20,
        height: 20,
        marginRight: 14,
        resizeMode: 'contain',
        tintColor: colors.primary,
    },
    rowText: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: '#1E293B',
    },
    chevronIcon: {
        width: 14,
        height: 14,
        resizeMode: 'contain',
        tintColor: '#CBD5E1',
    },
    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    modalContent: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
    },
    logoutIconBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FEE2E2',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalExitIcon: {
        width: 26,
        height: 26,
        resizeMode: 'contain',
        tintColor: '#EF4444',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: fonts.bold,
        color: '#0F172A',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    modalActions: {
        flexDirection: 'row',
        width: '100%',
        columnGap: 12,
    },
    cancelModalBtn: {
        flex: 1,
        backgroundColor: '#F1F5F9',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelModalBtnText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        color: '#64748B',
    },
    logoutModalBtn: {
        flex: 1,
        backgroundColor: '#EF4444',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    logoutModalBtnText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        color: colors.white,
    },
    saveIconBadge: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#EEF2FF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    modalSaveIcon: {
        width: 26,
        height: 26,
        resizeMode: 'contain',
        tintColor: colors.purplePlay || '#6A4BFF',
    },
    saveOkBtn: {
        width: '100%',
        backgroundColor: colors.purplePlay || '#6A4BFF',
        paddingVertical: 14,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 3,
        shadowColor: colors.purplePlay || '#6A4BFF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
    },
    saveOkBtnText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        color: colors.white,
    },
});

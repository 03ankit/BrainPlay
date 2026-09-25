import React, { useState, useContext, useCallback } from 'react';
import {
    Image,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Platform,
    PermissionsAndroid,
    BackHandler,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import CommonHeader from '../../components/CommonHeader';
import colors from '../../constants/colour';
import Fonts from '../../constants/fonts';
import images from '../../constants/images';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import KeyBoardAvoidingView from '../../components/KeyBoardAvoidingView';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { AuthContext } from '../../context/AuthContext';
import { executeSql } from '../../database/database';

export default function Profile({ route, navigation }) {
    const emailParam = route?.params?.email;

    const [fullName, setFullName] = useState('');
    const [email] = useState(emailParam);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [modalVisible, setModalVisible] = useState(false);
    const [avatarUri, setAvatarUri] = useState(null);
    const { signIn } = useContext(AuthContext);

    // Focus state trackers for input icon tints
    const [isFullNameFocused, setIsFullNameFocused] = useState(false);
    const [isPhoneNumberFocused, setIsPhoneNumberFocused] = useState(false);

    // Handle hardware back button to exit app directly instead of going back to OTP screen
    useFocusEffect(
        useCallback(() => {
            const onBackPress = () => {
                BackHandler.exitApp();
                return true;
            };

            const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);
            return () => subscription.remove();
        }, [])
    );

    const handleGetStarted = async () => {
        try {
            // Save locally to SQLite profiles
            await executeSql(
                `INSERT INTO profiles (id, name, email, phone_number, image, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
                 ON CONFLICT(id) DO UPDATE SET
                 name = excluded.name,
                 email = excluded.email,
                 phone_number = excluded.phone_number,
                 image = excluded.image,
                 updated_at = datetime('now');`,
                ['local_player', fullName || 'BrainPlayer', email || '', phoneNumber || '', avatarUri || null]
            );
        } catch (err) {
            console.warn('Profile local save notice:', err?.message || err);
        }

        // Complete sign in and navigate to main tabs
        signIn({ fullName, email, phoneNumber, avatarUri });
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

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera picker');
            } else if (response.errorCode) {
                console.log('Camera Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setAvatarUri(response.assets[0].uri);
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

        launchImageLibrary(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled library picker');
            } else if (response.errorCode) {
                console.log('Library Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setAvatarUri(response.assets[0].uri);
            }
        });
    };

    return (
        <View style={styles.screen}>
            <View style={styles.bgCircleA} />
            <View style={styles.bgCircleB} />


            {/* Header */}
            <CommonHeader
                title="Complete Your Profile"
                showBack={false}
                rightComponent={
                    <Text style={styles.headerRightText}>BrainPlay</Text>
                }
            />

            {/* Progress Bar under Header */}
            <View style={styles.progressContainer}>
                <View style={styles.progressBar} />
            </View>

            <KeyBoardAvoidingView
                contentContainerStyle={styles.scrollContent}
            >
                {/* Intro Title & Subtitle */}
                <Text style={styles.title}>Almost there!</Text>
                <Text style={styles.subtitle}>
                    Let's finish setting up your account to personalize your experience.
                </Text>

                {/* Avatar Section */}
                <View style={styles.avatarSection}>
                    <TouchableOpacity
                        activeOpacity={0.9}
                        onPress={() => setModalVisible(true)}
                        style={styles.avatarContainer}
                    >
                        <Image
                            source={avatarUri ? { uri: avatarUri } : images.person}
                            style={avatarUri ? styles.avatarImageFilled : styles.avatarImage}
                        />

                        {/* Edit Button overlay */}
                        <View style={styles.editButtonContainer}>
                            <Image source={images.edit} style={styles.editIcon} />
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={0.7}
                        onPress={() => setModalVisible(true)}
                        style={styles.changePhotoBtn}
                    >
                        <Text style={styles.changePhotoText}>Upload Photo</Text>
                    </TouchableOpacity>
                </View>

                {/* Form fields */}
                <View style={styles.formContainer}>
                    <CustomInput
                        label="Full Name"
                        value={fullName}
                        onChangeText={setFullName}
                        placeholder="Enter full name"
                        onFocus={() => setIsFullNameFocused(true)}
                        onBlur={() => setIsFullNameFocused(false)}
                        rightIcon={images.person}
                    />

                    <CustomInput
                        label="Email Address"
                        value={email}
                        editable={false}
                        rightIcon={images.mail}
                    />

                    <CustomInput
                        label="Phone Number"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        onFocus={() => setIsPhoneNumberFocused(true)}
                        onBlur={() => setIsPhoneNumberFocused(false)}
                        rightIcon={images.call}
                    />
                </View>

                {/* Terms and conditions */}
                <Text style={styles.termsText}>
                    By clicking Get Started, you agree to our{' '}
                    <Text style={styles.termsLink}>Terms of Service</Text> and{' '}
                    <Text style={styles.termsLink}>Privacy Policy</Text>.
                </Text>

                {/* Submit button */}
                <View style={styles.buttonContainer}>
                    <CustomButton
                        title="Get Started "
                        onPress={handleGetStarted}
                        disabled={!fullName.trim()}
                    />
                </View>
            </KeyBoardAvoidingView>
            {/* Modal */}
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
                        onPress={() => { }}
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
    screen: {
        flex: 1,
        backgroundColor: colors.secondary,
    },
    headerRightText: {
        fontSize: 16,
        fontFamily: Fonts.bold,
        color: colors.primary,
    },
    progressContainer: {
        width: '100%',
        height: 4,
        backgroundColor: '#E2E8F0',
    },
    progressBar: {
        width: '60%',
        height: '100%',
        backgroundColor: colors.primary,
    },
    bgCircleA: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#6D28D9',
        opacity: 0.15,
        top: 60,
        left: -60,
    },
    bgCircleB: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#2563EB',
        opacity: 0.15,
        bottom: -90,
        right: -90,
    },
    scrollContent: {
        flexGrow: 1,
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: 40,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontFamily: Fonts.bold,
        color: colors.darkGray,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 20,
        marginHorizontal: 12,
        marginBottom: 24,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 32,
    },
    avatarContainer: {
        width: 130,
        height: 130,
        borderRadius: 65,
        borderWidth: 4,
        borderColor: '#E2E8F0',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        backgroundColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    avatarImageFilled: {
        width: 122,
        height: 122,
        borderRadius: 61,
        resizeMode: 'cover',
    },
    editButtonContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: colors.primary,
        borderWidth: 3,
        borderColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
    },
    editIcon: {
        height: 14,
        width: 14,
        resizeMode: 'contain',
        tintColor: colors.white,
    },
    changePhotoBtn: {
        marginTop: 14,
    },
    changePhotoText: {
        fontSize: 13,
        fontFamily: Fonts.bold,
        color: colors.primary,
        letterSpacing: 0.5,
    },
    formContainer: {
        width: '100%',
        marginBottom: 8,
    },
    termsText: {
        fontSize: 12,
        fontFamily: Fonts.regular,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 18,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 24,
    },
    termsLink: {
        color: colors.primary,
        fontFamily: Fonts.bold,
    },
    buttonContainer: {
        width: '100%',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.4)', // sleek slate-tinted overlay
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
        fontFamily: Fonts.bold,
        color: colors.darkGray,
        marginBottom: 6,
    },
    modalSubtitle: {
        fontSize: 14,
        fontFamily: Fonts.regular,
        color: colors.gray,
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
        fontFamily: Fonts.bold,
        color: colors.darkGray,
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
        fontFamily: Fonts.bold,
        color: colors.gray,
    },
});

import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Modal,
    Platform,
    PermissionsAndroid,
    Alert,
} from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import colors from '../constants/colour';
import fonts from '../constants/fonts';
import images from '../constants/images';

export default function PersonalDetailsCard({
    initialName = '',
    initialEmail = '',
    initialPhone = '',
    initialImage = null,
    onSave,
}) {
    const [name, setName] = useState(initialName || '');
    const [email, setEmail] = useState(initialEmail || '');
    const [phone, setPhone] = useState(initialPhone || '');
    const [imageUri, setImageUri] = useState(initialImage || null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        if (initialName !== undefined && initialName !== null) setName(initialName);
        if (initialEmail !== undefined && initialEmail !== null) setEmail(initialEmail);
        if (initialPhone !== undefined && initialPhone !== null) setPhone(initialPhone);
        if (initialImage !== undefined) setImageUri(initialImage || null);
    }, [initialName, initialEmail, initialPhone, initialImage]);

    const isChanged =
        (name || '').trim() !== (initialName || '').trim() ||
        (email || '').trim() !== (initialEmail || '').trim() ||
        (phone || '').trim() !== (initialPhone || '').trim() ||
        (imageUri || null) !== (initialImage || null);

    const hasData = (name || '').trim().length > 0;
    const isSaveDisabled = !isChanged || !hasData;

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
            Alert.alert('Permission Denied', 'Camera permission is required to take a picture.');
            return;
        }

        const options = {
            mediaType: 'photo',
            saveToPhotos: true,
            quality: 0.8,
        };

        launchCamera(options, (response) => {
            if (response.didCancel) {
                console.log('User cancelled camera');
            } else if (response.errorCode) {
                console.log('Camera Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setImageUri(response.assets[0].uri);
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
                console.log('User cancelled gallery');
            } else if (response.errorCode) {
                console.log('Gallery Error: ', response.errorMessage);
            } else if (response.assets && response.assets.length > 0) {
                setImageUri(response.assets[0].uri);
            }
        });
    };

    const handleRemovePhoto = () => {
        setModalVisible(false);
        setImageUri(null);
    };

    const handleSave = () => {
        if (isSaveDisabled) return;
        if (onSave) {
            onSave({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                image: imageUri,
            });
        } else {
            Alert.alert("Success", "Personal details updated successfully!");
        }
    };

    return (
        <View style={styles.card}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <Text style={styles.cardTitle}>Personal Details</Text>

                <TouchableOpacity
                    style={[
                        styles.saveButton,
                        isSaveDisabled && styles.saveButtonDisabled,
                    ]}
                    onPress={handleSave}
                    disabled={isSaveDisabled}
                    activeOpacity={0.8}
                >
                    <Image
                        source={images.save}
                        style={[
                            styles.saveIcon,
                            isSaveDisabled && styles.saveIconDisabled,
                        ]}
                    />
                    <Text style={[
                        styles.saveText,
                        isSaveDisabled && styles.saveTextDisabled,
                    ]}>
                        Save{"\n"}Changes
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Profile Avatar Edit Section */}
            <View style={styles.avatarSection}>
                <View style={styles.avatarWrapper}>
                    <Image
                        source={imageUri ? { uri: imageUri } : images.person}
                        style={styles.avatarImage}
                        resizeMode="cover"
                    />
                    <TouchableOpacity
                        style={styles.editBadgeButton}
                        onPress={() => setModalVisible(true)}
                        activeOpacity={0.85}
                    >
                        <Image source={images.camera} style={styles.cameraIcon} resizeMode="contain" />
                    </TouchableOpacity>
                </View>
                <TouchableOpacity
                    onPress={() => setModalVisible(true)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.changePhotoText}>Change Profile Photo</Text>
                </TouchableOpacity>
            </View>

            {/* Input 1: Full Name */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                    <Image source={images.person} style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter full name"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
            </View>

            {/* Input 2: Email Address */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                    <Image source={images.mail} style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
            </View>

            {/* Input 3: Phone Number */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                    <Image source={images.call} style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
            </View>

            {/* Image Selection Modal */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setModalVisible(false)}
                >
                    <View style={styles.modalContent}>
                        <View style={styles.modalIndicator} />
                        <Text style={styles.modalTitle}>Profile Photo</Text>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleCameraClick}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: '#EEF2FF' }]}>
                                <Image source={images.camera} style={[styles.optionIcon, { tintColor: colors.primary }]} />
                            </View>
                            <Text style={styles.modalOptionText}>Take Photo</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.modalOption}
                            onPress={handleGalleryClick}
                            activeOpacity={0.7}
                        >
                            <View style={[styles.optionIconBox, { backgroundColor: '#F3E8FF' }]}>
                                <Image source={images.gallery} style={[styles.optionIcon, { tintColor: '#8B5CF6' }]} />
                            </View>
                            <Text style={styles.modalOptionText}>Choose from Gallery</Text>
                        </TouchableOpacity>

                        {imageUri && (
                            <TouchableOpacity
                                style={styles.modalOption}
                                onPress={handleRemovePhoto}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.optionIconBox, { backgroundColor: '#FEE2E2' }]}>
                                    <Image source={images.close} style={[styles.optionIcon, { tintColor: '#EF4444' }]} />
                                </View>
                                <Text style={[styles.modalOptionText, { color: '#EF4444' }]}>Remove Current Photo</Text>
                            </TouchableOpacity>
                        )}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setModalVisible(false)}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#EEF2FF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 22,
        fontFamily: fonts.bold,
        color: colors.primary,
        lineHeight: 26,
    },
    saveButton: {
        backgroundColor: colors.purplePlay || '#6A4BFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveButtonDisabled: {
        backgroundColor: '#CBD5E1',
        opacity: 0.65,
    },
    saveIcon: {
        width: 20,
        height: 20,
        marginRight: 8,
        resizeMode: 'contain',
        tintColor: colors.white,
    },
    saveIconDisabled: {
        tintColor: '#94A3B8',
    },
    saveText: {
        fontSize: 13,
        fontFamily: fonts.bold,
        color: colors.white,
        textAlign: 'center',
        lineHeight: 16,
    },
    saveTextDisabled: {
        color: '#64748B',
    },

    // Avatar Section
    avatarSection: {
        alignItems: 'center',
        marginBottom: 18,
    },
    avatarWrapper: {
        position: 'relative',
        width: 88,
        height: 88,
        marginBottom: 8,
    },
    avatarImage: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: '#E2E8F0',
        borderWidth: 3,
        borderColor: colors.white,
    },
    editBadgeButton: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.purplePlay || '#6A4BFF',
        borderWidth: 2.5,
        borderColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    cameraIcon: {
        width: 14,
        height: 14,
        tintColor: colors.white,
    },
    changePhotoText: {
        fontSize: 13,
        fontFamily: fonts.bold,
        color: colors.purplePlay || '#6A4BFF',
    },

    // Form inputs
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: '#64748B',
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        resizeMode: 'contain',
        tintColor: '#64748B',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: fonts.medium,
        color: '#1E293B',
        paddingVertical: 0,
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 36,
        alignItems: 'center',
    },
    modalIndicator: {
        width: 44,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#CBD5E1',
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: fonts.bold,
        color: '#0F172A',
        marginBottom: 20,
    },
    modalOption: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        paddingVertical: 12,
        paddingHorizontal: 8,
    },
    optionIconBox: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    optionIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
    },
    modalOptionText: {
        fontSize: 16,
        fontFamily: fonts.medium,
        color: '#1E293B',
    },
    cancelButton: {
        marginTop: 16,
        paddingVertical: 14,
        width: '100%',
        backgroundColor: '#F1F5F9',
        borderRadius: 16,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        color: '#64748B',
    },
});

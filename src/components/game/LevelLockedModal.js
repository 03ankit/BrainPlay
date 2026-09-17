import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Image,
    Dimensions,
} from 'react-native';
import images from '../../constants/images';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

const { width } = Dimensions.get('window');

export default function LevelLockedModal({
    visible = false,
    targetLevel = 2,
    requiredLevel = 1,
    title = 'Level Locked',
    message,
    onClose,
}) {
    const defaultMessage = `Complete Level ${requiredLevel} first to unlock Level ${targetLevel}!`;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Top Right Close Button */}
                    <TouchableOpacity
                        style={styles.closeIconButton}
                        activeOpacity={0.7}
                        onPress={onClose}
                    >
                        <Image
                            source={images.close}
                            style={styles.closeIconImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    {/* Golden Lock Icon Circle Badge */}
                    <View style={styles.iconCircle}>
                        {images.lock ? (
                            <Image
                                source={images.lock}
                                style={styles.lockImage}
                                resizeMode="contain"
                            />
                        ) : (
                            <Text style={styles.lockEmoji}>🔒</Text>
                        )}
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>{title}</Text>

                    {/* Description Message */}
                    <Text style={styles.message}>
                        {message || defaultMessage}
                    </Text>

                    {/* Action Button: Got It / OK */}
                    <TouchableOpacity
                        style={styles.actionButton}
                        activeOpacity={0.88}
                        onPress={onClose}
                    >
                        <Text style={styles.actionButtonText}>OK</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: Math.min(width - 48, 330),
        backgroundColor: colors.white,
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 28,
        paddingBottom: 22,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 10,
        position: 'relative',
    },
    closeIconButton: {
        position: 'absolute',
        top: 16,
        right: 16,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeIconImage: {
        width: 14,
        height: 14,
        tintColor: colors.grayDark,
    },
    iconCircle: {
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FEF3C7', // Soft warm golden background
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#FDE68A',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    lockImage: {
        width: 34,
        height: 34,
        tintColor: '#D97706',
    },
    lockEmoji: {
        fontSize: 32,
    },
    title: {
        fontSize: 22,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.darkGray,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    actionButton: {
        width: '100%',
        height: 50,
        backgroundColor: colors.purplePlay || colors.primary,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
        letterSpacing: 0.5,
    },
});

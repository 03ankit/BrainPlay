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

export default function InsufficientCoinsModal({
    visible = false,
    level = 6,
    requiredCoins = 300,
    currentCoins = 0,
    onReplay,
    onClose,
}) {
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

                    {/* Warning Coins Icon Badge */}
                    <View style={styles.iconCircle}>
                        <Text style={styles.badgeEmoji}>🪙</Text>
                        <View style={styles.alertBadge}>
                            <Text style={styles.alertEmoji}>⚠️</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Insufficient Coins</Text>

                    {/* Subtitle Message */}
                    <Text style={styles.message}>
                        You need <Text style={styles.highlightText}>{requiredCoins} coins</Text> to unlock Level {level}. Replay completed levels to earn more coins!
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Primary Replay / Earn Coins Button */}
                        <TouchableOpacity
                            style={styles.replayButton}
                            activeOpacity={0.88}
                            onPress={onReplay || onClose}
                        >
                            <Image source={images.reload} style={styles.buttonIcon} resizeMode="contain" />
                            <Text style={styles.replayButtonText}>Replay to Earn Coins</Text>
                        </TouchableOpacity>

                        {/* Cancel Button */}
                        <TouchableOpacity
                            style={styles.cancelButton}
                            activeOpacity={0.7}
                            onPress={onClose}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(15, 23, 42, 0.72)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: Math.min(width - 48, 360),
        backgroundColor: colors.white,
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
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
        tintColor: '#64748B',
    },
    iconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FEF2F2',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        borderWidth: 3,
        borderColor: '#FECACA',
        position: 'relative',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    badgeEmoji: {
        fontSize: 36,
    },
    alertBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 26,
        height: 26,
        borderRadius: 13,
        backgroundColor: '#FEE2E2',
        borderWidth: 2,
        borderColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },
    alertEmoji: {
        fontSize: 12,
    },
    title: {
        fontSize: 22,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 21,
        marginBottom: 24,
        paddingHorizontal: 8,
    },
    highlightText: {
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#DC2626',
    },
    buttonGroup: {
        width: '100%',
        gap: 10,
    },
    replayButton: {
        width: '100%',
        height: 52,
        borderRadius: 18,
        backgroundColor: '#F59E0B',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonIcon: {
        width: 18,
        height: 18,
        tintColor: colors.white,
    },
    replayButtonText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
    cancelButton: {
        width: '100%',
        height: 44,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontFamily: fonts.semiBold,
        fontWeight: '700',
        color: '#64748B',
    },
});

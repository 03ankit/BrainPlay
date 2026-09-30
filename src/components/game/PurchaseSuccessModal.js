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

export default function PurchaseSuccessModal({
    visible = false,
    level = 6,
    cost = 300,
    remainingCoins = 0,
    onPlayLevel,
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

                    {/* Celebration Unlock Icon Badge */}
                    <View style={styles.iconCircle}>
                        <Text style={styles.badgeEmoji}>🎉</Text>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Level Unlocked!</Text>

                    {/* Subtitle Message */}
                    <Text style={styles.message}>
                        You successfully unlocked <Text style={styles.highlightText}>Level {level}</Text> using {cost} coins.
                    </Text>

                    {/* Remaining Coins Balance Box */}
                    <View style={styles.balanceContainer}>
                        <Text style={styles.balanceLabel}>Remaining Balance</Text>
                        <View style={styles.coinBadge}>
                            <Text style={styles.coinBadgeText}>{remainingCoins} 🪙</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Primary Play Button */}
                        <TouchableOpacity
                            style={styles.playButton}
                            activeOpacity={0.88}
                            onPress={onPlayLevel}
                        >
                            <Text style={styles.playButtonText}>Play Level {level} ▶</Text>
                        </TouchableOpacity>

                        {/* Back / Close Button */}
                        <TouchableOpacity
                            style={styles.backButton}
                            activeOpacity={0.7}
                            onPress={onClose}
                        >
                            <Text style={styles.backButtonText}>Back to Levels</Text>
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
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        borderWidth: 3,
        borderColor: '#FDE68A',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 10,
        elevation: 6,
    },
    badgeEmoji: {
        fontSize: 38,
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
        marginBottom: 20,
        paddingHorizontal: 8,
    },
    highlightText: {
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.primary,
    },
    balanceContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 12,
        marginBottom: 22,
    },
    balanceLabel: {
        fontSize: 13,
        fontFamily: fonts.semiBold,
        fontWeight: '700',
        color: '#475569',
    },
    coinBadge: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FDE68A',
        borderRadius: 14,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    coinBadgeText: {
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#B45309',
    },
    buttonGroup: {
        width: '100%',
        gap: 10,
    },
    playButton: {
        width: '100%',
        height: 52,
        borderRadius: 18,
        backgroundColor: colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    playButtonText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
    backButton: {
        width: '100%',
        height: 44,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    backButtonText: {
        fontSize: 14,
        fontFamily: fonts.semiBold,
        fontWeight: '700',
        color: '#64748B',
    },
});

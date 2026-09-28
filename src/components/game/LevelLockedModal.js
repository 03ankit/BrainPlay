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
    unlockCoinsCost = 300,
    playerCoins = 0,
    title = 'Level Locked',
    message,
    onUnlockWithCoins,
    onClose,
}) {
    const defaultMessage = `Complete Level ${requiredLevel} first to unlock Level ${targetLevel}, or unlock it instantly using coins!`;
    const hasEnoughCoins = Number(playerCoins) >= unlockCoinsCost;

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

                    {/* User Coins Balance */}
                    <View style={styles.coinBalanceRow}>
                        <Text style={styles.coinBalanceLabel}>Your Balance:</Text>
                        <View style={styles.coinBadge}>
                            <Text style={styles.coinBadgeText}>{playerCoins} 🪙</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Option 1: Instant Coin Unlock */}
                        {onUnlockWithCoins && (
                            <TouchableOpacity
                                style={[
                                    styles.coinUnlockButton,
                                    !hasEnoughCoins && styles.coinUnlockDisabled,
                                ]}
                                activeOpacity={0.88}
                                onPress={onUnlockWithCoins}
                            >
                                <Text style={styles.coinUnlockEmoji}>🪙</Text>
                                <View style={styles.coinUnlockTextGroup}>
                                    <Text style={styles.coinUnlockTitle}>
                                        Unlock with {unlockCoinsCost} Coins
                                    </Text>
                                    <Text style={styles.coinUnlockSubtitle}>
                                        {hasEnoughCoins ? 'Unlock level now' : `Need ${unlockCoinsCost - playerCoins} more coins`}
                                    </Text>
                                </View>
                            </TouchableOpacity>
                        )}

                        {/* Option 2: Default Close / Dismiss */}
                        <TouchableOpacity
                            style={styles.actionButton}
                            activeOpacity={0.88}
                            onPress={onClose}
                        >
                            <Text style={styles.actionButtonText}>
                                {`Play Level ${requiredLevel} First`}
                            </Text>
                        </TouchableOpacity>

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
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 20,
    },
    card: {
        width: Math.min(width - 36, 350),
        backgroundColor: colors.white,
        borderRadius: 28,
        paddingHorizontal: 22,
        paddingTop: 26,
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
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        borderWidth: 3,
        borderColor: '#FDE68A',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 3,
    },
    lockImage: {
        width: 32,
        height: 32,
        tintColor: '#D97706',
    },
    lockEmoji: {
        fontSize: 30,
    },
    title: {
        fontSize: 22,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkGray,
        marginBottom: 6,
        textAlign: 'center',
    },
    message: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: 14,
        paddingHorizontal: 6,
    },
    coinBalanceRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: 4,
        marginBottom: 14,
    },
    coinBalanceLabel: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.gray,
    },
    coinBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FDE68A',
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
    coinUnlockButton: {
        width: '100%',
        backgroundColor: '#F59E0B',
        borderRadius: 18,
        paddingVertical: 12,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#F59E0B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 5,
    },
    coinUnlockDisabled: {
        backgroundColor: '#FBBF24',
        opacity: 0.75,
    },
    coinUnlockEmoji: {
        fontSize: 24,
        marginRight: 10,
    },
    coinUnlockTextGroup: {
        flex: 1,
    },
    coinUnlockTitle: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.white,
    },
    coinUnlockSubtitle: {
        fontSize: 11,
        fontFamily: fonts.medium,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    actionButton: {
        width: '100%',
        height: 48,
        backgroundColor: colors.purplePlay || colors.primary,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    actionButtonText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
        letterSpacing: 0.5,
    },
    cancelButton: {
        width: '100%',
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelButtonText: {
        fontSize: 14,
        fontFamily: fonts.bold,
        fontWeight: '700',
        color: colors.gray,
    },
});

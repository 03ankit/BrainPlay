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

export default function StarRequirementModal({
    visible = false,
    requiredStars = 11,
    currentStars = 0,
    targetLevel = 6,
    previousLevelsRange = 'Levels 1–5',
    unlockCoinsCost = 300,
    playerCoins = 0,
    onUnlockWithCoins,
    onReplay,
    onClose,
}) {
    const progressRatio = Math.min(1, Math.max(0, currentStars / requiredStars));
    const starsNeeded = Math.max(0, requiredStars - currentStars);
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

                    {/* Star & Lock Icon Badge */}
                    <View style={styles.iconCircle}>
                        <Image source={images.starfilled} style={styles.starIcon} resizeMode="contain" />
                        <View style={styles.lockBadge}>
                            <Text style={styles.lockIconText}>🔒</Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text style={styles.title}>Unlock Level {targetLevel}</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        To unlock Level {targetLevel}, you can earn{' '}
                        <Text style={styles.highlightText}>{requiredStars} Stars</Text> from {previousLevelsRange} or unlock instantly with coins!
                    </Text>

                    {/* Stars Progress Box */}
                    <View style={styles.progressBox}>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Stars Progress</Text>
                            <Text style={styles.progressValue}>
                                {currentStars} / {requiredStars} ⭐
                            </Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
                        </View>
                        <Text style={styles.starsNeededText}>
                            {starsNeeded > 0
                                ? `Need ${starsNeeded} more star${starsNeeded > 1 ? 's' : ''} to qualify`
                                : 'Star requirement fulfilled!'}
                        </Text>
                    </View>

                    {/* User Coins Balance Pill */}
                    <View style={styles.coinBalanceRow}>
                        <Text style={styles.coinBalanceLabel}>Your Balance:</Text>
                        <View style={styles.coinBadge}>
                            <Text style={styles.coinBadgeText}>{playerCoins} 🪙</Text>
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Option 1: Instant Coin Unlock */}
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
                                    {hasEnoughCoins ? 'Instant level unlock' : `Need ${unlockCoinsCost - playerCoins} more coins`}
                                </Text>
                            </View>
                        </TouchableOpacity>

                        {/* Option 2: Default Replay / Earn Stars */}
                        <TouchableOpacity
                            style={styles.replayButton}
                            activeOpacity={0.88}
                            onPress={onReplay || onClose}
                        >
                            <Image source={images.reload} style={styles.buttonIcon} resizeMode="contain" />
                            <Text style={styles.replayText}>Replay & Earn Stars (Free)</Text>
                        </TouchableOpacity>

                        {/* Dismiss / Close Button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            activeOpacity={0.85}
                            onPress={onClose}
                        >
                            <Text style={styles.closeText}>Cancel</Text>
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
        padding: 24,
        alignItems: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 18,
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
        position: 'relative',
    },
    starIcon: {
        width: 40,
        height: 40,
    },
    lockBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        backgroundColor: colors.white,
        borderRadius: 12,
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 2,
    },
    lockIconText: {
        fontSize: 12,
    },
    title: {
        fontSize: 22,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
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
    },
    highlightText: {
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.primary,
    },
    progressBox: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 14,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 12,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    progressLabel: {
        fontSize: 12,
        fontFamily: fonts.semiBold,
        color: colors.gray,
    },
    progressValue: {
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#D97706',
    },
    progressBarTrack: {
        width: '100%',
        height: 8,
        borderRadius: 4,
        backgroundColor: '#E2E8F0',
        overflow: 'hidden',
        marginBottom: 4,
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
        backgroundColor: '#F59E0B',
    },
    starsNeededText: {
        fontSize: 11,
        fontFamily: fonts.medium,
        color: colors.gray,
        textAlign: 'center',
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
    replayButton: {
        width: '100%',
        height: 48,
        borderRadius: 16,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 4,
    },
    buttonIcon: {
        width: 18,
        height: 18,
        tintColor: colors.white,
    },
    replayText: {
        fontSize: 14,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
    closeButton: {
        width: '100%',
        height: 44,
        borderRadius: 14,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.grayBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: 14,
        fontFamily: fonts.bold,
        fontWeight: '700',
        color: colors.gray,
    },
});

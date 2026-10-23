import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Modal,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

const { width } = Dimensions.get('window');

const HINT_COST = 100;

export default function HintModal({
    visible = false,
    currentCoins = 0,
    title = 'Use a Hint?',
    subtitle = "Choose how you'd like to unlock this hint",
    onUseCoins,       // called when user chooses "Spend 100 Coins"
    onUseHintAfterAd, // called when user watches ad to use hint for free
    onClose,
}) {
    const [isWatching, setIsWatching] = useState(false);

    const canAfford = currentCoins >= HINT_COST;

    const handleWatchAd = () => {
        if (isWatching) return;
        setIsWatching(true);
        // Simulated ad — 2s duration, then uses hint directly
        setTimeout(() => {
            setIsWatching(false);
            if (onUseHintAfterAd) {
                onUseHintAfterAd();
            } else if (onClose) {
                onClose();
            }
        }, 2000);
    };

    const handleUseCoins = () => {
        if (!canAfford) return;
        if (onUseCoins) onUseCoins();
    };

    const resetAndClose = () => {
        setIsWatching(false);
        if (onClose) onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            statusBarTranslucent={true}
            onRequestClose={resetAndClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Top-Right Close Cross Button */}
                    <TouchableOpacity
                        style={styles.closeCrossButton}
                        activeOpacity={0.7}
                        onPress={resetAndClose}
                        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                    >
                        <Text style={styles.closeCrossText}>✕</Text>
                    </TouchableOpacity>

                    {/* Header Icon */}
                    <View style={styles.iconRow}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.iconEmoji}>💡</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>

                    {/* Coin balance pill */}
                    <View style={styles.balancePill}>
                        <Text style={styles.balanceLabel}>Your balance</Text>
                        <Text style={styles.balanceAmount}>{currentCoins} 🪙</Text>
                    </View>

                    {/* Divider */}
                    <View style={styles.divider} />

                    {/* Options */}
                    <View style={styles.optionsContainer}>

                        {/* Option 1 — Free Hint */}
                        <View style={styles.optionCard}>
                            <View style={styles.optionLeft}>
                                <View style={[styles.optionIconCircle, { backgroundColor: '#EDE9FE' }]}>
                                    <Text style={styles.optionIcon}>🎁</Text>
                                </View>
                                <View style={styles.optionTextGroup}>
                                    <Text style={styles.optionTitle}>Free Hint</Text>
                                    <Text style={styles.optionDesc}>Claim free bonus hint</Text>
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.actionBtn, styles.adBtn, isWatching && styles.adBtnLoading]}
                                activeOpacity={0.85}
                                onPress={handleWatchAd}
                                disabled={isWatching}
                            >
                                {isWatching ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Text style={styles.actionBtnText}>Claim</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Separator */}
                        <View style={styles.orRow}>
                            <View style={styles.orLine} />
                            <Text style={styles.orText}>OR</Text>
                            <View style={styles.orLine} />
                        </View>

                        {/* Option 2 — Spend Coins */}
                        <View style={[styles.optionCard, !canAfford && styles.optionCardDisabled]}>
                            <View style={styles.optionLeft}>
                                <View style={[styles.optionIconCircle, { backgroundColor: canAfford ? '#FEF9C3' : '#F1F5F9' }]}>
                                    <Text style={styles.optionIcon}>🪙</Text>
                                </View>
                                <View style={styles.optionTextGroup}>
                                    <Text style={[styles.optionTitle, !canAfford && styles.disabledText]}>
                                        Spend Coins
                                    </Text>
                                    {canAfford ? (
                                        <Text style={styles.optionDesc}>
                                            -{HINT_COST} 🪙 → {currentCoins - HINT_COST} remaining
                                        </Text>
                                    ) : (
                                        <Text style={[styles.optionDesc, styles.notEnoughText]}>
                                            Need {HINT_COST} 🪙 · You have {currentCoins}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <TouchableOpacity
                                style={[styles.actionBtn, styles.coinBtn, !canAfford && styles.coinBtnDisabled]}
                                activeOpacity={canAfford ? 0.85 : 1}
                                onPress={handleUseCoins}
                                disabled={!canAfford}
                            >
                                <Text style={[styles.actionBtnText, !canAfford && styles.coinBtnTextDisabled]}>
                                    {canAfford ? 'Use' : 'No coins'}
                                </Text>
                            </TouchableOpacity>
                        </View>
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
        justifyContent: 'flex-end',
        paddingHorizontal: 0,
    },
    card: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        paddingHorizontal: 24,
        paddingTop: 16,
        paddingBottom: 28,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -8 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
        elevation: 20,
    },

    // Handle bar
    iconRow: {
        alignItems: 'center',
        marginBottom: 4,
    },
    iconCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#FFFBEB',
        borderWidth: 2.5,
        borderColor: '#FDE047',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#EAB308',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 4,
    },
    iconEmoji: { fontSize: 26 },

    title: {
        fontSize: 22,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: '#0F172A',
        textAlign: 'center',
        marginTop: 14,
    },
    subtitle: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: '#64748B',
        textAlign: 'center',
        marginTop: 4,
        marginBottom: 16,
    },

    // Balance pill
    balancePill: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFBEB',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#FDE68A',
        marginBottom: 16,
    },
    balanceLabel: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: '#92400E',
    },
    balanceAmount: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#D97706',
    },

    divider: {
        height: 1,
        backgroundColor: '#F1F5F9',
        marginBottom: 16,
    },

    // Options container
    optionsContainer: {
        gap: 0,
        marginBottom: 16,
    },
    optionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#F8FAFC',
        borderRadius: 18,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        marginBottom: 2,
    },
    optionCardDisabled: {
        backgroundColor: '#F8FAFC',
        borderColor: '#E2E8F0',
        opacity: 0.7,
    },
    optionLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        gap: 12,
    },
    optionIconCircle: {
        width: 44,
        height: 44,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    optionIcon: { fontSize: 22 },
    optionTextGroup: {
        flex: 1,
    },
    optionTitle: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#0F172A',
    },
    optionDesc: {
        fontSize: 12,
        fontFamily: fonts.medium,
        color: '#64748B',
        marginTop: 2,
    },
    disabledText: { color: '#94A3B8' },
    notEnoughText: { color: '#DC2626' },

    // Action buttons
    actionBtn: {
        height: 38,
        paddingHorizontal: 18,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 72,
    },
    adBtn: {
        backgroundColor: '#7C3AED',
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    adBtnLoading: { backgroundColor: '#A78BFA' },
    coinBtn: {
        backgroundColor: '#D97706',
        shadowColor: '#D97706',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    coinBtnDisabled: {
        backgroundColor: '#E2E8F0',
        shadowOpacity: 0,
        elevation: 0,
    },
    actionBtnText: {
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#fff',
    },
    coinBtnTextDisabled: { color: '#94A3B8' },

    adDoneBadge: {
        height: 38,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#F0FDF4',
        borderWidth: 1.5,
        borderColor: '#86EFAC',
        alignItems: 'center',
        justifyContent: 'center',
    },
    adDoneText: {
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '700',
        color: '#16A34A',
    },
    useHintBtn: {
        height: 38,
        paddingHorizontal: 14,
        borderRadius: 12,
        backgroundColor: '#16A34A',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#16A34A',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    useHintBtnText: {
        fontSize: 13,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#fff',
    },

    // OR separator
    orRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
        paddingHorizontal: 4,
    },
    orLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    orText: {
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '700',
        color: '#94A3B8',
        marginHorizontal: 10,
        letterSpacing: 1,
    },

    // Top Right Close Cross
    closeCrossButton: {
        position: 'absolute',
        top: 16,
        right: 18,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    closeCrossText: {
        fontSize: 15,
        fontWeight: '700',
        color: '#64748B',
        lineHeight: 18,
    },
});

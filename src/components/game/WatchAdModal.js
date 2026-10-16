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
const AD_REWARD_COINS = 200;

export default function WatchAdModal({
    visible = false,
    currentCoins = 0,
    hintCost = 100,
    onAdWatched,
    onClose,
}) {
    const [isWatching, setIsWatching] = useState(false);
    const [adDone, setAdDone] = useState(false);

    const handleWatchAd = () => {
        if (isWatching || adDone) return;
        setIsWatching(true);
        setTimeout(() => {
            setIsWatching(false);
            setAdDone(true);
            if (onAdWatched) onAdWatched(AD_REWARD_COINS);
        }, 2000);
    };

    const handleClose = () => {
        setIsWatching(false);
        setAdDone(false);
        if (onClose) onClose();
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={handleClose}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    <View style={styles.iconCircle}>
                        <Text style={styles.iconEmoji}>🪙</Text>
                        <View style={styles.warningBadge}>
                            <Text style={styles.warningEmoji}>⚠️</Text>
                        </View>
                    </View>

                    <Text style={styles.title}>Not Enough Coins!</Text>

                    <Text style={styles.message}>
                        You need{' '}
                        <Text style={styles.highlight}>{hintCost} coins</Text> to use a hint.{'\n'}
                        You currently have{' '}
                        <Text style={styles.coinsText}>{currentCoins} 🪙</Text>.
                    </Text>

                    <View style={styles.rewardRow}>
                        <Text style={styles.rewardLabel}>📺  Watch an ad to earn</Text>
                        <Text style={styles.rewardAmount}>+{AD_REWARD_COINS} 🪙</Text>
                    </View>

                    <View style={styles.buttonGroup}>
                        {!adDone ? (
                            <TouchableOpacity
                                style={[styles.watchButton, isWatching && styles.watchButtonLoading]}
                                activeOpacity={0.88}
                                onPress={handleWatchAd}
                                disabled={isWatching}
                            >
                                {isWatching ? (
                                    <>
                                        <ActivityIndicator color="#fff" size="small" />
                                        <Text style={styles.watchButtonText}>Watching Ad…</Text>
                                    </>
                                ) : (
                                    <>
                                        <Text style={styles.watchIcon}>▶️</Text>
                                        <Text style={styles.watchButtonText}>Watch Ad (+{AD_REWARD_COINS} 🪙)</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.successRow}>
                                <Text style={styles.successText}>
                                    ✅ +{AD_REWARD_COINS} coins added! Hint is now available.
                                </Text>
                            </View>
                        )}

                        <TouchableOpacity
                            style={styles.cancelButton}
                            activeOpacity={0.7}
                            onPress={handleClose}
                        >
                            <Text style={styles.cancelText}>{adDone ? 'Done' : 'Cancel'}</Text>
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
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    card: {
        width: Math.min(width - 48, 360),
        backgroundColor: '#fff',
        borderRadius: 28,
        paddingHorizontal: 24,
        paddingTop: 32,
        paddingBottom: 24,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.25,
        shadowRadius: 24,
        elevation: 12,
    },
    iconCircle: {
        width: 84,
        height: 84,
        borderRadius: 42,
        backgroundColor: '#FEF9C3',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 18,
        borderWidth: 3,
        borderColor: '#FDE047',
        position: 'relative',
        shadowColor: '#EAB308',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 5,
    },
    iconEmoji: { fontSize: 38 },
    warningBadge: {
        position: 'absolute',
        bottom: -2,
        right: -2,
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: '#FEF9C3',
        borderWidth: 2,
        borderColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    warningEmoji: { fontSize: 14 },
    title: {
        fontSize: 22,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: '#0F172A',
        marginBottom: 10,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: '#64748B',
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: 16,
    },
    highlight: {
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#DC2626',
    },
    coinsText: {
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#D97706',
    },
    rewardRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        backgroundColor: '#F0FDF4',
        borderRadius: 14,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 20,
        borderWidth: 1.5,
        borderColor: '#86EFAC',
    },
    rewardLabel: {
        fontSize: 13,
        fontFamily: fonts.medium,
        color: '#166534',
    },
    rewardAmount: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#16A34A',
    },
    buttonGroup: { width: '100%', gap: 10 },
    watchButton: {
        width: '100%',
        height: 54,
        borderRadius: 18,
        backgroundColor: '#7C3AED',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: '#7C3AED',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    watchButtonLoading: { backgroundColor: '#9D73EF' },
    watchIcon: { fontSize: 16 },
    watchButtonText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: '#fff',
    },
    successRow: {
        width: '100%',
        backgroundColor: '#F0FDF4',
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderWidth: 1.5,
        borderColor: '#86EFAC',
        alignItems: 'center',
    },
    successText: {
        fontSize: 14,
        fontFamily: fonts.bold,
        fontWeight: '700',
        color: '#16A34A',
        textAlign: 'center',
    },
    cancelButton: {
        width: '100%',
        height: 44,
        borderRadius: 16,
        backgroundColor: '#F1F5F9',
        alignItems: 'center',
        justifyContent: 'center',
    },
    cancelText: {
        fontSize: 14,
        fontFamily: fonts.semiBold,
        fontWeight: '700',
        color: '#64748B',
    },
});

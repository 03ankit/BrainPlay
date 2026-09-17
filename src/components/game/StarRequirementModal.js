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
    onReplay,
    onClose,
}) {
    const progressRatio = Math.min(1, Math.max(0, currentStars / requiredStars));
    const starsNeeded = Math.max(0, requiredStars - currentStars);

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
                    <Text style={styles.title}>Stars Required!</Text>

                    {/* Message */}
                    <Text style={styles.message}>
                        To unlock <Text style={styles.highlightText}>Level {targetLevel}</Text>, you need at least{' '}
                        <Text style={styles.highlightText}>{requiredStars} Stars</Text> from {previousLevelsRange}.
                    </Text>

                    {/* Progress Bar Card */}
                    <View style={styles.progressBox}>
                        <View style={styles.progressRow}>
                            <Text style={styles.progressLabel}>Current Progress</Text>
                            <Text style={styles.progressValue}>
                                {currentStars} / {requiredStars} ⭐
                            </Text>
                        </View>
                        <View style={styles.progressBarTrack}>
                            <View style={[styles.progressBarFill, { width: `${progressRatio * 100}%` }]} />
                        </View>
                        <Text style={styles.starsNeededText}>
                            {starsNeeded > 0
                                ? `Earn ${starsNeeded} more star${starsNeeded > 1 ? 's' : ''} to unlock!`
                                : 'Ready to unlock!'}
                        </Text>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Replay / Level Map Button */}
                        <TouchableOpacity
                            style={styles.replayButton}
                            activeOpacity={0.88}
                            onPress={onReplay || onClose}
                        >
                            <Image source={images.reload} style={styles.buttonIcon} resizeMode="contain" />
                            <Text style={styles.replayText}>Replay Previous Levels</Text>
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
        width: Math.min(width - 40, 340),
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
        width: 72,
        height: 72,
        borderRadius: 36,
        backgroundColor: '#FEF3C7',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        position: 'relative',
    },
    starIcon: {
        width: 44,
        height: 44,
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
        fontSize: 13,
    },
    title: {
        fontSize: 22,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
        marginBottom: 8,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 18,
    },
    highlightText: {
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.primary,
    },
    progressBox: {
        width: '100%',
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        marginBottom: 20,
    },
    progressRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
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
        marginBottom: 6,
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
    buttonGroup: {
        width: '100%',
        gap: 10,
    },
    replayButton: {
        width: '100%',
        height: 52,
        borderRadius: 18,
        backgroundColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    buttonIcon: {
        width: 20,
        height: 20,
        tintColor: colors.white,
    },
    replayText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
    closeButton: {
        width: '100%',
        height: 48,
        borderRadius: 16,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.grayBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        fontSize: 15,
        fontFamily: fonts.bold,
        fontWeight: '700',
        color: colors.gray,
    },
});

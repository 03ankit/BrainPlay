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

export default function TimeUpModal({
    visible = false,
    level = 1,
    message,
    onRetry,
    onLevelMap,
}) {
    const defaultMessage = `Time ran out for Level ${level}. Try again!`;
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={onRetry}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Top Right Close Button */}
                    <TouchableOpacity
                        style={styles.closeIconButton}
                        activeOpacity={0.7}
                        onPress={onRetry}
                    >
                        <Image
                            source={images.close}
                            style={styles.closeIconImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    {/* Time Up Icon Badge */}
                    <View style={styles.iconCircle}>
                        <Image
                            source={images.timer}
                            style={styles.modalIconImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Title & Description */}
                    <Text style={styles.title}>Time's Up!</Text>
                    <Text style={styles.message}>
                        {message || defaultMessage}
                    </Text>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Retry Button with Reload Icon */}
                        <TouchableOpacity
                            style={styles.retryButton}
                            activeOpacity={0.88}
                            onPress={onRetry}
                        >
                            <Image source={images.reload} style={styles.reloadIcon} resizeMode="contain" />
                            <Text style={styles.retryText}>Retry</Text>
                        </TouchableOpacity>

                        {/* Level Map Button */}
                        <TouchableOpacity
                            style={styles.levelMapButton}
                            activeOpacity={0.85}
                            onPress={onLevelMap}
                        >
                            <Text style={styles.levelMapText}>Level Map</Text>
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
        width: 68,
        height: 68,
        borderRadius: 34,
        backgroundColor: colors.redLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalIconImage: {
        width: 34,
        height: 34,
        tintColor: '#EF4444',
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
        fontSize: 13,
        fontFamily: fonts.medium,
        color: colors.gray,
        textAlign: 'center',
        lineHeight: 19,
        marginBottom: 24,
    },
    buttonGroup: {
        width: '100%',
        gap: 12,
    },
    retryButton: {
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
    reloadIcon: {
        width: 22,
        height: 22,
        tintColor: colors.white,
    },
    retryText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
    levelMapButton: {
        width: '100%',
        height: 52,
        borderRadius: 18,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.grayBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    levelMapText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.primary,
    },
});

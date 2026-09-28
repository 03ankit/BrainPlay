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
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';
import images from '../../constants/images';

const { width } = Dimensions.get('window');

export default function ExitGameModal({
    visible = false,
    title = 'Exit Game?',
    message = 'Are you sure you want to exit? Your current round progress will be lost.',
    onConfirmExit,
    onCancel,
}) {
    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            statusBarTranslucent={true}
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.card}>
                    {/* Top Right Close Button */}
                    <TouchableOpacity
                        style={styles.closeIconButton}
                        activeOpacity={0.7}
                        onPress={onCancel}
                    >
                        <Image
                            source={images.close}
                            style={styles.closeIconImage}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    {/* Warning Icon Badge */}
                    <View style={styles.iconCircle}>
                        <Image
                            source={images.exit}
                            style={styles.modalIconImage}
                            resizeMode="contain"
                        />
                    </View>

                    {/* Title & Description */}
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.message}>{message}</Text>

                    {/* Action Buttons */}
                    <View style={styles.buttonGroup}>
                        {/* Resume / Cancel Button */}
                        <TouchableOpacity
                            style={styles.resumeButton}
                            activeOpacity={0.88}
                            onPress={onCancel}
                        >
                            <Text style={styles.resumeText}>Resume Game</Text>
                        </TouchableOpacity>

                        {/* Confirm Exit Button */}
                        <TouchableOpacity
                            style={styles.exitButton}
                            activeOpacity={0.85}
                            onPress={onConfirmExit}
                        >
                            <Text style={styles.exitText}>Exit Game</Text>
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
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: colors.redLight, // Soft red tint
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    modalIconImage: {
        width: 32,
        height: 32,
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
    resumeButton: {
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
    resumeText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.white,
    },
    exitButton: {
        width: '100%',
        height: 52,
        borderRadius: 18,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.red,
        alignItems: 'center',
        justifyContent: 'center',
    },
    exitText: {
        fontSize: 16,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.red,
    },
});

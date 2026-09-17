import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    Image,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import CommonHeader from '../../components/CommonHeader';
import images from '../../constants/images';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import CustomButton from '../../components/CustomButton';
import KeyBoardAvoidingView from '../../components/KeyBoardAvoidingView';
import OtpInputBox from '../../components/OtpInputBox';

const { width: screenWidth } = Dimensions.get('window');
const cellWidth = Math.min(50, Math.floor((screenWidth - 90) / 6));

export default function OtpScreen({ route, navigation }) {
    const email = route?.params?.email;
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [animating, setAnimating] = useState(false);

    const otpInputRef = useRef(null);
    const animatingRef = useRef(false);
    const shakeAnim = useRef(new Animated.Value(0)).current;

    const canVerify = useMemo(
        () => code.trim().length === 6 && !loading && !animating,
        [code, loading, animating]
    );

    // Reset OTP form and animation state (prevents stale state upon back-navigation)
    const resetOtpForm = useCallback(() => {
        animatingRef.current = false;
        setAnimating(false);
        setLoading(false);
        setError('');
        setCode('');
        otpInputRef.current?.resetAnimation?.();
    }, []);

    useEffect(() => {
        const unsubscribe = navigation?.addListener?.('focus', () => {
            resetOtpForm();
        });
        return unsubscribe;
    }, [navigation, resetOtpForm]);

    // Play Pac-Man animation on backend success, then navigate
    const playSuccessThen = (afterNavigate) => {
        if (animatingRef.current) return;
        animatingRef.current = true;
        setAnimating(true);
        setLoading(false);
        setError('');

        if (!otpInputRef.current?.playSuccessAnimation) {
            afterNavigate();
            return;
        }

        otpInputRef.current.playSuccessAnimation({
            onComplete: afterNavigate,
        });
    };

    // Trigger error shake animation
    const triggerShake = () => {
        Animated.sequence([
            Animated.timing(shakeAnim, { toValue: -12, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 12, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 8, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 4, duration: 50, useNativeDriver: true }),
            Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
        ]).start();
    };

    const handleVerify = async (otpCode) => {
        const verifyCode = otpCode || code;
        if (verifyCode.trim().length !== 6 || loading || animatingRef.current) return;

        setLoading(true);
        setError('');
        try {
            // Simulated backend verification request
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Backend success rule (111111 accepted in test/staging)
            if (verifyCode === '111111') {
                playSuccessThen(() => {
                    navigation?.navigate?.('Profile', { email });
                });
            } else {
                // Backend verification failed
                setLoading(false);
                setError('Incorrect OTP. Please try again.');
                triggerShake();
                otpInputRef.current?.focus?.();
            }
        } catch {
            setLoading(false);
            setError('Verification failed. Please try again.');
            triggerShake();
            otpInputRef.current?.focus?.();
        }
    };

    const handleResend = () => {
        if (animatingRef.current || loading) return;
        setError('');
        setCode('');
        otpInputRef.current?.resetAnimation?.();
        otpInputRef.current?.focus?.();
        console.log('Resend OTP to:', email);
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Decorative background matching BrainPlay UI */}
            <View style={styles.bgCircleA} />
            <View style={styles.bgCircleB} />

            <CommonHeader
                title="BrainPlay"
                onBack={() => navigation?.goBack?.()}
            />

            <KeyBoardAvoidingView contentContainerStyle={styles.scrollContent}>
                {/* Brand Logo Container */}
                <View style={styles.logoContainer}>
                    <Image source={images.verified} style={styles.logo} />
                </View>

                {/* White Card */}
                <View style={styles.card}>
                    <Text style={styles.title}>Verify your email</Text>
                    <Text style={styles.subtitle}>
                        {email ? `We sent a code to ${email}.` : 'Enter the 6-digit code sent to your email.'}
                    </Text>

                    {/* Animated shake wrapper for error feedback */}
                    <Animated.View
                        style={[
                            styles.otpWrapper,
                            { transform: [{ translateX: shakeAnim }] },
                        ]}
                    >
                        <OtpInputBox
                            ref={otpInputRef}
                            value={code}
                            setValue={(text) => {
                                setCode(text);
                                if (error) setError('');
                            }}
                            error={!!error}
                            cellCount={6}
                            cellWidth={cellWidth}
                            cellHeight={cellWidth * 1.18}
                            locked={loading || animating}
                            autoFocus={false}
                            onFilled={(filledCode) => {
                                handleVerify(filledCode);
                            }}
                        />
                    </Animated.View>

                    {/* Error message */}
                    {error ? (
                        <Text style={styles.errorText}>{error}</Text>
                    ) : null}

                    {/* Resend Link */}
                    <TouchableOpacity
                        onPress={handleResend}
                        style={styles.resendButton}
                        disabled={animating || loading}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.resendText,
                                (animating || loading) && styles.resendTextDisabled,
                            ]}
                        >
                            Resend OTP
                        </Text>
                    </TouchableOpacity>

                    {/* Verify Action Button */}
                    <CustomButton
                        title="Verify"
                        onPress={() => handleVerify()}
                        disabled={!canVerify}
                        loading={loading}
                    />
                </View>
            </KeyBoardAvoidingView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.secondary,
    },
    bgCircleA: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#6D28D9',
        opacity: 0.15,
        top: 60,
        left: -60,
    },
    bgCircleB: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#2563EB',
        opacity: 0.15,
        bottom: -90,
        right: -90,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
        paddingBottom: 28,
        alignItems: 'center',
    },
    logoContainer: {
        height: 90,
        width: 90,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
        marginTop: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 4,
    },
    logo: {
        width: 48,
        height: 48,
        resizeMode: 'contain',
        tintColor: colors.secondary,
    },
    card: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 24,
        paddingBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.06,
        shadowRadius: 20,
        elevation: 3,
    },
    title: {
        fontSize: 24,
        fontFamily: fonts.bold,
        color: colors.darkGray,
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
        marginBottom: 20,
        fontFamily: fonts.medium,
        lineHeight: 20,
    },
    otpWrapper: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 6,
    },
    errorText: {
        color: colors.red,
        fontSize: 13,
        fontFamily: fonts.medium,
        marginTop: 2,
        textAlign: 'center',
        marginBottom: 8,
    },
    resendButton: {
        alignSelf: 'center',
        marginVertical: 14,
    },
    resendText: {
        fontFamily: fonts.bold,
        fontSize: 14,
        color: colors.primary,
    },
    resendTextDisabled: {
        opacity: 0.5,
    },
});

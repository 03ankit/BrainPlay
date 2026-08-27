import React, { useMemo, useRef, useState } from 'react';
import {
    Dimensions,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Image
} from 'react-native';
import { OtpInput } from 'react-native-otp-entry';
import CommonHeader from '../../components/CommonHeader';
import images from '../../constants/images';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import CustomButton from '../../components/CustomButton';
import KeyBoardAvoidingView from '../../components/KeyBoardAvoidingView';
import PacmanOtpSuccessAnimation from '../../components/PacmanOtpAnimation';

const { width: screenWidth } = Dimensions.get('window');
const cellWidth = Math.min(46, Math.floor((screenWidth - 96) / 6));

export default function OtpScreen({ route, navigation }) {
    const email = route?.params?.email;
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    // State machine: 'idle' | 'verifying' | 'successAnimation' | 'verified' | 'error'
    const [status, setStatus] = useState('idle');
    const otpRef = useRef(null);

    const canVerify = useMemo(
        () => code.trim().length === 6 && !loading && status === 'idle',
        [code, loading, status]
    );

    const handleVerify = async (otpCode) => {
        const verifyCode = otpCode || code;
        if (verifyCode.trim().length !== 6 || status !== 'idle') return;

        setLoading(true);
        setStatus('verifying');
        setError('');
        try {
            // Simulate API verification call delay
            await new Promise((resolve) => setTimeout(resolve, 600));

            if (verifyCode === '111111') {
                // API CONFIRMED CORRECT -> Trigger post-verification Pac-Man animation sequence!
                setStatus('successAnimation');
            } else {
                // API WRONG OTP -> Shake + ✕, then clear OTP for retry
                setStatus('error');
                setError('Incorrect OTP');
                setTimeout(() => {
                    setStatus('idle');
                    setCode('');
                    setError('');
                    otpRef.current?.clear();
                }, 2000);
            }
        } catch (err) {
            setStatus('error');
            setError('Verification failed');
            setTimeout(() => {
                setStatus('idle');
                setCode('');
                setError('');
                otpRef.current?.clear();
            }, 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleAnimationComplete = () => {
        setStatus('verified');
        setTimeout(() => {
            navigation?.navigate?.('Profile');
        }, 800);
    };

    const handleResend = () => {
        console.log('Resend OTP');
        setStatus('idle');
        setError('');
    };

    return (
        <View style={styles.screen}>
            {/* Decorative background */}
            <View style={styles.bgCircleA} />
            <View style={styles.bgCircleB} />

            <CommonHeader
                title="BrainPlay"
                onBack={() => navigation.goBack()}
            />
            <KeyBoardAvoidingView
                contentContainerStyle={styles.scrollContent}
            >
                <View style={styles.logoContainer}>
                    <Image source={images.verified} style={styles.logo} />
                </View>

                <View style={styles.card}>
                    <Text style={styles.title}>Verify your email</Text>
                    <Text style={styles.subtitle}>
                        {email ? `We sent a code to ${email}.` : 'Enter the code sent to your email.'}
                    </Text>

                    <View style={styles.otpWrapper}>
                        <PacmanOtpSuccessAnimation
                            code={code}
                            numberOfDigits={6}
                            status={status}
                            errorMessage={error || 'Incorrect OTP'}
                            onAnimationComplete={handleAnimationComplete}
                            cellHeight={cellWidth * 1.2}
                        >
                            <OtpInput
                                ref={otpRef}
                                numberOfDigits={6}
                                onTextChange={(text) => {
                                    setCode(text);
                                    if (status !== 'idle') setStatus('idle');
                                    if (error) setError('');
                                }}
                                onFilled={(text) => {
                                    setCode(text);
                                    handleVerify(text);
                                }}
                                theme={{
                                    containerStyle: styles.otpInputContainer,
                                    pinCodeContainerStyle: [
                                        styles.otpCell,
                                        { width: cellWidth, height: cellWidth * 1.2 }
                                    ],
                                    pinCodeTextStyle: styles.otpPinCodeText,
                                    focusedPinCodeContainerStyle: styles.otpCellFocused,
                                    filledPinCodeContainerStyle: styles.otpCellFilled,
                                }}
                                textInputProps={{
                                    keyboardType: 'number-pad',
                                    maxLength: 6,
                                }}
                            />
                        </PacmanOtpSuccessAnimation>
                    </View>

                    <TouchableOpacity onPress={handleResend} style={styles.resendButton}>
                        <Text style={styles.resendText}>
                            Resend OTP
                        </Text>
                    </TouchableOpacity>

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
        width: 50,
        height: 50,
        resizeMode: 'contain',
        tintColor: colors.secondary,
    },
    card: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 28,
        paddingHorizontal: 20,
        paddingTop: 26,
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
        marginBottom: 22,
        fontFamily: fonts.medium,
        lineHeight: 20,
    },
    otpWrapper: {
        width: '100%',
        marginBottom: 10,
    },
    otpInputContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    otpCell: {
        borderRadius: 12,
        backgroundColor: colors.lightGray,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
    },
    otpCellFocused: {
        borderColor: colors.primary,
        borderWidth: 2,
        backgroundColor: colors.white,
    },
    otpCellFilled: {
        backgroundColor: colors.white,
        borderColor: colors.primary,
    },
    otpPinCodeText: {
        fontSize: 20,
        fontFamily: fonts.bold,
        color: colors.darkGray,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 13,
        fontFamily: fonts.medium,
        marginTop: 4,
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
});

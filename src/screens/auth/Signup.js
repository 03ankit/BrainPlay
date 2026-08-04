import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
    Image,
} from 'react-native';
import colors from '../../constants/colour';
import CustomButton from '../../components/CustomButton';
import CustomInput from '../../components/CustomInput';
import images from '../../constants/images';
import Fonts from '../../constants/fonts';

function isValidEmail(email) {
    // Simple, pragmatic email validation for UI feedback
    return /^\S+@\S+\.\S+$/.test(email);
}

export default function Signup({ navigation }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const canContinue = useMemo(() => !!email.trim() && !loading, [email, loading]);

    const handleContinue = async () => {
        const trimmed = email.trim();
        if (!trimmed) {
            setError('Email is required');
            return;
        }
        if (!isValidEmail(trimmed)) {
            setError('Enter a valid email');
            return;
        }

        setError('');
        setLoading(true);

        // In a real app, call your signup API here.
        // For now, just navigate to OTP if navigation is available.
        try {
            if (navigation?.navigate) {
                navigation.navigate('Otp', { email: trimmed });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />

            {/* Decorative background */}
            <View style={styles.bgCircleA} />
            <View style={styles.bgCircleB} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.logoContainer}>
                    <Image source={images.thinking} style={styles.thinking} />
                </View>
                <Text style={styles.welcomeText}>BrainPlay</Text>
                <Text style={styles.subtitleText}>Welcome to BrainPlay</Text>

                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.card}
                >
                    <Text style={styles.title}>Create account</Text>
                    <Text style={styles.subtitle}>
                        Enter your email to continue.
                    </Text>

                    <View style={styles.form}>
                        <CustomInput
                            label="Email Address"
                            value={email}
                            onChangeText={(t) => {
                                setEmail(t);
                                if (error) setError('');
                            }}
                            error={error || undefined}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            placeholder="Enter email"
                        />

                        <CustomButton
                            title="Continue"
                            onPress={handleContinue}
                            disabled={!canContinue}
                            loading={loading}
                            textStyle={styles.continueText}
                        />

                        <View style={styles.dividerRow}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <Pressable
                            onPress={() => {
                                // Placeholder for Google auth integration
                                // eslint-disable-next-line no-alert
                                // alert('Google sign-in not implemented yet');
                            }}
                            style={styles.googleButton}
                        >
                            <View style={styles.googleIcon} />
                            <Text style={styles.googleText}>Sign in with Google</Text>
                        </Pressable>

                        {/* <View style={styles.footerTextRow}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <Pressable
                                onPress={() => navigation?.navigate?.('Login')}
                            >
                                <Text style={[styles.footerText, styles.footerLink]}>
                                    Log in
                                </Text>
                            </Pressable>
                        </View> */}
                    </View>
                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.secondary,
        alignContent: 'center'
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 28,
        paddingTop: 70,
        alignItems: 'center',
    },
    logoContainer: {
        height: 90,
        width: 90,
        borderRadius: 30,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        // marginBottom: 18,
    },
    thinking: {
        height: 50,
        width: 50,
        resizeMode: 'contain',
        tintColor: colors.secondary,
    },
    welcomeText: {
        color: colors.primary,
        fontSize: 28,
        fontFamily: Fonts.semiBold,
        marginBottom: 18,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    subtitleText: {
        color: colors.black,
        fontSize: 28,
        fontFamily: Fonts.regular,
        marginBottom: 8,
        textAlign: 'center',
        letterSpacing: 0.2,
    },
    card: {
        width: '100%',
        marginTop: 50,
        backgroundColor: colors.white,
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 22,
        paddingBottom: 18,
    },
    title: {
        fontSize: 25,
        fontFamily: Fonts.bold,
        color: colors.darkGray,
        textAlign: 'center',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
        marginBottom: 18,
        fontFamily: Fonts.medium,
    },
    form: {
        width: '100%',
    },
    continueText: {
        // keep default but allows future overrides
        fontFamily: Fonts.bold,
    },
    dividerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#E2E8F0',
    },
    dividerText: {
        marginHorizontal: 12,
        color: '#94A3B8',
        fontFamily: Fonts.bold,
        fontSize: 12,
    },
    googleButton: {
        height: 56,
        width: '100%',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        backgroundColor: colors.white,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 12,
        paddingHorizontal: 16,
        marginTop: 6,
    },
    googleIcon: {
        width: 26,
        height: 26,
        borderRadius: 4,
        backgroundColor: '#E5E7EB',
    },
    googleText: {
        color: colors.darkGray,
        fontFamily: Fonts.bold,
        fontSize: 15,
    },
    footerTextRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 14,
    },
    footerText: {
        color: colors.gray,
        fontFamily: Fonts.medium,
        fontSize: 12,
    },
    footerLink: {
        color: colors.primary,
        fontFamily: Fonts.bold,
    },
    bgCircleA: {
        position: 'absolute',
        width: 220,
        height: 220,
        borderRadius: 110,
        backgroundColor: '#6D28D9',
        opacity: 0.35,
        top: 40,
        left: -60,
    },
    bgCircleB: {
        position: 'absolute',
        width: 260,
        height: 260,
        borderRadius: 130,
        backgroundColor: '#2563EB',
        opacity: 0.35,
        bottom: -90,
        right: -90,
    },
});


import React, { useMemo, useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import colors from '../../constants/colour';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
} from 'react-native-confirmation-code-field';
import CustomButton from '../../components/CustomButton';


const CELL_COUNT = 6;




export default function OtpScreen({ route, navigation }) {
    const email = route?.params?.email || '';
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const canVerify = useMemo(() => code.trim().length >= 4 && !loading, [code, loading]);

    const handleVerify = async () => {
        if (code.trim().length < 4) {
            setError('Enter the OTP code');
            return;
        }

        setError('');
        setLoading(true);
        try {
            // Placeholder for OTP verification logic
            navigation?.navigate?.('Profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.screen}>
            <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView
                    behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                    style={styles.card}
                >
                    <Text style={styles.title}>Verify your email</Text>
                    <Text style={styles.subtitle}>
                        {email ? `We sent a code to ${email}.` : 'Enter the code sent to your email.'}
                    </Text>

                    <TextInput
                        value={code}
                        onChangeText={(t) => {
                            setCode(t);
                            if (error) setError('');
                        }}
                        keyboardType="number-pad"
                        autoCapitalize="none"
                        placeholder="OTP code"
                        style={[
                            styles.otpInput,
                            { borderColor: error ? '#EF4444' : '#E2E8F0' },
                        ]}
                    />

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <CustomButton
                        title="Verify"
                        onPress={handleVerify}
                        disabled={!canVerify}
                        loading={loading}
                    />
                </KeyboardAvoidingView>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.secondary,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 28,
        paddingTop: 120,
        alignItems: 'center',
    },
    card: {
        width: '100%',
        backgroundColor: colors.white,
        borderRadius: 28,
        paddingHorizontal: 18,
        paddingTop: 22,
        paddingBottom: 18,
    },
    title: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.darkGray,
        textAlign: 'center',
        marginBottom: 6,
    },
    subtitle: {
        fontSize: 14,
        color: colors.gray,
        textAlign: 'center',
        marginBottom: 18,
        fontWeight: '500',
    },
    otpInput: {
        width: '100%',
        height: 56,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        fontSize: 16,
        fontWeight: '600',
        color: colors.darkGray,
        backgroundColor: colors.lightGray,
        marginBottom: 6,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        fontWeight: '500',
        marginTop: 4,
        textAlign: 'right',
        marginBottom: 8,
    },
});


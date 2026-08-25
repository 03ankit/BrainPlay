import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import colors from '../constants/colour';
import fonts from '../constants/fonts';
import images from '../constants/images';

export default function PersonalDetailsCard({
    initialName = "Alex Rivers",
    initialEmail = "alex.rivers@brainplay.com",
    initialPhone = "+1 (555) 012-3456",
    onSave,
}) {
    const [name, setName] = useState(initialName);
    const [email, setEmail] = useState(initialEmail);
    const [phone, setPhone] = useState(initialPhone);

    const handleSave = () => {
        if (onSave) {
            onSave({ name, email, phone });
        } else {
            Alert.alert("Success", "Personal details updated successfully!");
        }
    };

    return (
        <View style={styles.card}>
            {/* Header Row */}
            <View style={styles.headerRow}>
                <Text style={styles.cardTitle}>Personal{"\n"}Details</Text>

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                    activeOpacity={0.8}
                >
                    <Text style={styles.saveIcon}>💾</Text>
                    <Text style={styles.saveText}>Save{"\n"}Changes</Text>
                </TouchableOpacity>
            </View>

            {/* Input 1: Full Name */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <View style={styles.inputContainer}>
                    <Image source={images.person} style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter full name"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
            </View>

            {/* Input 2: Email Address */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Email Address</Text>
                <View style={styles.inputContainer}>
                    <Image source={images.mail} style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        value={email}
                        onChangeText={setEmail}
                        placeholder="Enter email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
            </View>

            {/* Input 3: Phone Number */}
            <View style={styles.inputGroup}>
                <Text style={styles.label}>Phone Number</Text>
                <View style={styles.inputContainer}>
                    <Image source={images.call} style={styles.inputIcon} />
                    <TextInput
                        style={styles.textInput}
                        value={phone}
                        onChangeText={setPhone}
                        placeholder="Enter phone number"
                        keyboardType="phone-pad"
                        placeholderTextColor="#94A3B8"
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#EEF2FF',
        borderRadius: 24,
        padding: 20,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    cardTitle: {
        fontSize: 22,
        fontFamily: fonts.bold,
        color: colors.primary,
        lineHeight: 26,
    },
    saveButton: {
        backgroundColor: colors.purplePlay || '#6A4BFF',
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
    },
    saveIcon: {
        fontSize: 16,
        marginRight: 8,
        color: colors.white,
    },
    saveText: {
        fontSize: 13,
        fontFamily: fonts.bold,
        color: colors.white,
        textAlign: 'center',
        lineHeight: 16,
    },
    inputGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        fontFamily: fonts.medium,
        color: '#64748B',
        marginBottom: 8,
    },
    inputContainer: {
        backgroundColor: colors.white,
        borderRadius: 16,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        height: 52,
    },
    inputIcon: {
        width: 20,
        height: 20,
        marginRight: 12,
        resizeMode: 'contain',
        tintColor: '#64748B',
    },
    textInput: {
        flex: 1,
        fontSize: 15,
        fontFamily: fonts.medium,
        color: '#1E293B',
        paddingVertical: 0,
    },
});

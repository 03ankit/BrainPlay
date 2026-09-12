import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import colors from '../../constants/colour';

export default function GameHeader({ level = 24, onBack }) {
    return (
        <View style={styles.headerContainer}>
            {/* Left: Avatar / Profile Icon */}
            <TouchableOpacity onPress={onBack} activeOpacity={0.8} style={styles.avatarButton}>
                <View style={styles.avatarCircle}>
                    <Image source={images.person} style={styles.avatarIcon} resizeMode="contain" />
                </View>
            </TouchableOpacity>

            {/* Center: Title */}
            <Text style={styles.titleText}>BrainPlay</Text>

            {/* Right: Level Badge Capsule */}
            <View style={styles.levelBadge}>
                <Text style={styles.levelLabel}>Lv.</Text>
                <Text style={styles.levelNumber}>{level}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        backgroundColor: 'transparent',
    },
    avatarButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary, // Vibrant blue/purple
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 4,
    },
    avatarIcon: {
        width: 24,
        height: 24,
        tintColor: colors.white,
    },
    titleText: {
        fontSize: 28,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.primaryDark || '#312E81', // Deep indigo text matching screenshot
        letterSpacing: 0.2,
    },
    levelBadge: {
        backgroundColor: colors.primaryLight, // Light blue/purple tint capsule
        borderRadius: 18,
        paddingHorizontal: 16,
        paddingVertical: 6,
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 54,
    },
    levelLabel: {
        fontSize: 11,
        fontFamily: fonts.bold,
        fontWeight: '700',
        color: colors.grayDark,
        lineHeight: 13,
    },
    levelNumber: {
        fontSize: 14,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
        lineHeight: 16,
    },
});

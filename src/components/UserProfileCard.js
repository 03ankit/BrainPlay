import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import colors from '../constants/colour';
import fonts from '../constants/fonts';
import images from '../constants/images';

export default function UserProfileCard({
    name = "Alex Rivet",
    role = "Master of Logic • Member since June '23",
    level = 24,
    currentXp = 2450,
    maxXp = 3000,
    avatarSource = images.person
}) {
    const xpPercentage = Math.min(Math.max((currentXp / maxXp) * 100, 0), 100);

    return (
        <View style={styles.card}>
            {/* Avatar with Level Badge */}
            <View style={styles.avatarWrapper}>
                <View style={styles.avatarBorder}>
                    <Image source={avatarSource} style={styles.avatarImage} />
                </View>
                <View style={styles.levelBadge}>
                    <Text style={styles.levelBadgeText}>Lv. {level}</Text>
                </View>
            </View>

            {/* User Info */}
            <Text style={styles.userName}>{name}</Text>
            {/* <Text style={styles.userRole}>{role}</Text> */}

            {/* Progress Section */}
            <View style={styles.xpSection}>
                {/* <View style={styles.xpHeader}>
                    <Text style={styles.xpTitle}>NEXT LEVEL</Text>
                    <Text style={styles.xpValue}>
                        {currentXp.toLocaleString()} / {maxXp.toLocaleString()} XP
                    </Text>
                </View> */}

                {/* Progress Bar */}
                {/* <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${xpPercentage}%` }]} />
                </View> */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        marginBottom: 16,
    },
    avatarWrapper: {
        position: 'relative',
        marginBottom: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarBorder: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 4,
        borderColor: colors.purplePlay || '#6A4BFF',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 4,
    },
    avatarImage: {
        width: 98,
        height: 98,
        borderRadius: 49,
        backgroundColor: colors.avatarBg,
    },
    levelBadge: {
        position: 'absolute',
        bottom: -6,
        backgroundColor: '#4F46E5',
        paddingHorizontal: 12,
        paddingVertical: 3,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: colors.white,
    },
    levelBadgeText: {
        color: colors.white,
        fontSize: 12,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
    },
    userName: {
        fontSize: 26,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: '800',
        color: '#1E293B',
        marginBottom: 4,
        textAlign: 'center',
    },
    userRole: {
        fontSize: 13,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
        marginBottom: 20,
        textAlign: 'center',
    },
    xpSection: {
        width: '100%',
    },
    xpHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    xpTitle: {
        fontSize: 11,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: '700',
        color: '#64748B',
        letterSpacing: 0.5,
    },
    xpValue: {
        fontSize: 12,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: '700',
        color: colors.purplePlay || '#6A4BFF',
    },
    progressBarTrack: {
        height: 10,
        backgroundColor: '#EEF2FF',
        borderRadius: 5,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: colors.purplePlay || '#6A4BFF',
        borderRadius: 5,
    },
});

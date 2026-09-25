import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import colors from '../constants/colour';
import fonts from '../constants/fonts';
import images from '../constants/images';

const defaultDays = [
    { day: 'M', status: 'Done' },
    { day: 'T', status: 'Done' },
    { day: 'W', status: 'Done' },
    { day: 'T', status: 'Done' },
    { day: 'F', status: 'Next' },
    { day: 'S', status: 'Locked' },
    { day: 'S', status: 'Locked' },
];

export default function WeeklyStreakCard({
    title = "Weekly Streak",
    days = defaultDays,
    completedDays = 4,
    totalDays = 7,
    onPress,
}) {
    const progressPercentage = Math.min(Math.max((completedDays / totalDays) * 100, 0), 100);

    return (
        <TouchableOpacity style={styles.container} activeOpacity={onPress ? 0.85 : 1} onPress={onPress}>
            {/* Section Header */}
            <View style={styles.headerRow}>
                <View style={styles.titleContainer}>
                    <Image source={images.fire} style={styles.fireIcon} resizeMode="contain" />
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Text style={styles.streakCount}>{completedDays}/{totalDays} Days</Text>
            </View>

            {/* Streak Card */}
            <View style={styles.card}>
                {/* Days Row */}
                <View style={styles.daysRow}>
                    {days.map((item, index) => {
                        const statusLower = (item.status || '').toLowerCase();
                        const isDone = statusLower === 'done' || statusLower === 'completed';
                        const isNext = statusLower === 'next' || statusLower === 'current';

                        const dayLetter = item.day ? item.day.charAt(0).toUpperCase() : `${index + 1}`;
                        const displayStatus = isDone ? 'Done' : isNext ? 'Today' : 'Locked';

                        return (
                            <View key={index} style={styles.dayColumn}>
                                <View
                                    style={[
                                        styles.dayCircle,
                                        isDone && styles.doneCircle,
                                        !isDone && styles.defaultCircle,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.dayLetter,
                                            isDone ? styles.doneLetter : styles.defaultLetter,
                                        ]}
                                    >
                                        {dayLetter}
                                    </Text>
                                </View>
                                <Text style={styles.statusText}>{displayStatus}</Text>
                            </View>
                        );
                    })}
                </View>

                {/* Progress Bar Track */}
                <View style={styles.progressTrack}>
                    <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
        paddingHorizontal: 4,
    },
    titleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    fireIcon: {
        width: 20,
        height: 20,
    },
    title: {
        fontSize: 20,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#1E293B',
    },
    streakCount: {
        fontSize: 15,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: '700',
        color: colors.purplePlay || '#6A4BFF',
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    daysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    dayColumn: {
        alignItems: 'center',
        flex: 1,
    },
    dayCircle: {
        width: 38,
        height: 38,
        borderRadius: 19,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
    },
    doneCircle: {
        backgroundColor: colors.purplePlay || '#6A4BFF',
    },
    defaultCircle: {
        backgroundColor: '#EEF2FF',
    },
    dayLetter: {
        fontSize: 14,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: '700',
    },
    doneLetter: {
        color: colors.white,
    },
    defaultLetter: {
        color: '#475569',
    },
    statusText: {
        fontSize: 11,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
    },
    progressTrack: {
        height: 8,
        backgroundColor: '#EEF2FF',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: colors.purplePlay || '#6A4BFF',
        borderRadius: 4,
    },
});

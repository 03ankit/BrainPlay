import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';
import streakRepository from '../../database/repositories/streakRepository';

export default function WeeklyStreakDetail({ onBack, navigation }) {
    const insets = useSafeAreaInsets();

    const [streakData, setStreakData] = useState({
        streakCount: 1,
        cycleDay: 1,
        completedDays: 0,
        totalDays: 7,
        isCompletedToday: false,
        days: [
            { day: 'Mon', num: '1', status: 'current', activeDot: true },
            { day: 'Tue', num: '2', status: 'locked' },
            { day: 'Wed', num: '3', status: 'locked' },
            { day: 'Thu', num: '4', status: 'locked' },
            { day: 'Fri', num: '5', status: 'locked' },
            { day: 'Sat', num: '6', status: 'locked' },
            { day: 'Sun', num: '7', status: 'locked' },
        ],
        progressPercentage: 0,
    });

    // Fetch live SQLite streak data on focus
    useFocusEffect(
        useCallback(() => {
            const loadStreak = async () => {
                try {
                    const data = await streakRepository.getWeeklyStreak('local_player');
                    setStreakData(data);
                } catch (err) {
                    console.error('Error fetching weekly streak:', err);
                }
            };
            loadStreak();
        }, [])
    );

    const handleBackPress = () => {
        if (onBack) {
            onBack();
        } else if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const handlePlayNow = () => {
        if (navigation) {
            navigation.navigate('BottomNavigation', { screen: 'Games' });
        }
    };

    const { streakCount, completedDays, totalDays, isCompletedToday, days } = streakData;

    // Calculate dynamic circular progress angle (clockwise from 12 o'clock)
    const progress = Math.max(0, Math.min(1, totalDays > 0 ? completedDays / totalDays : 0));
    const angle = progress * 360;

    // Rotation angles for 2-half clipped progress segments
    const rightRotate = Math.min(angle, 180) - 225;
    const leftRotate = Math.max(0, angle - 180) - 135;

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity
                        onPress={handleBackPress}
                        activeOpacity={0.7}
                        style={styles.backButton}
                    >
                        <Image source={images.back} style={styles.backIcon} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>BrainPlay</Text>
                    <View style={{ width: 32 }} />
                </View>

                {/* Top Weekly Streak Card */}
                <View style={styles.streakBannerCard}>
                    <Text style={styles.streakBannerTitle}>Weekly Streak</Text>
                    <Text style={styles.streakBannerSubtitle}>
                        Complete 1 level daily for 7 days to earn rewards!
                    </Text>

                    {/* Circular Progress Display */}
                    <View style={styles.circleContainer}>
                        <View style={styles.outerProgressCircle}>
                            {/* Background Ring Track */}
                            <View style={styles.trackCircle} />

                            {/* Right Half Circular Ring Progress Segment (0 - 180 deg) */}
                            <View style={styles.rightHalfContainer}>
                                <View
                                    style={[
                                        styles.rightRingSegment,
                                        {
                                            transform: [{ rotate: `${rightRotate}deg` }],
                                        },
                                    ]}
                                />
                            </View>

                            {/* Left Half Circular Ring Progress Segment (180 - 360 deg) */}
                            <View style={styles.leftHalfContainer}>
                                <View
                                    style={[
                                        styles.leftRingSegment,
                                        {
                                            transform: [{ rotate: `${leftRotate}deg` }],
                                        },
                                    ]}
                                />
                            </View>

                            {/* Center Days Count */}
                            <View style={styles.innerProgressCircle}>
                                <Text style={styles.circleDayCount}>{completedDays}</Text>
                                <Text style={styles.circleDayLabel}>DAYS</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.streakDayText}>
                        Day {completedDays} of {totalDays}
                    </Text>
                </View>

                {/* Days Horizontal Status Selector */}
                <View style={styles.daysRowContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                        {days.map((item, index) => {
                            const isCurrent = item.status === 'current';
                            const isCompleted = item.status === 'completed';
                            const isLocked = item.status === 'locked';

                            return (
                                <View key={index} style={styles.dayItemColumn}>
                                    <View
                                        style={[
                                            styles.dayCircle,
                                            isCurrent && styles.dayCircleCurrent,
                                            isCompleted && styles.dayCircleCompleted,
                                            isLocked && styles.dayCircleLocked,
                                        ]}
                                    >
                                        {isLocked ? (
                                            <Image source={images.lock} style={styles.lockIconImage} />
                                        ) : (
                                            <Text
                                                style={[
                                                    styles.dayNumberText,
                                                    isCurrent && styles.dayNumberCurrentText,
                                                    isCompleted && styles.dayNumberCompletedText,
                                                ]}
                                            >
                                                {item.num}
                                            </Text>
                                        )}
                                        {item.activeDot && <View style={styles.activeNotificationDot} />}
                                    </View>
                                    <Text style={[styles.dayNameLabel, isCurrent && styles.dayNameCurrentLabel]}>
                                        {item.day}
                                    </Text>
                                </View>
                            );
                        })}
                    </ScrollView>
                </View>

                {/* Today's Task Card */}
                <View style={styles.taskCard}>
                    <View style={styles.taskBadge}>
                        <Text style={styles.taskBadgeText}>TODAY'S TASK</Text>
                    </View>
                    <Text style={styles.taskTitle}>
                        {isCompletedToday ? 'Daily Goal Achieved! 🎉' : 'Complete 1 Game Level'}
                    </Text>
                    <Text style={styles.taskSubtitle}>
                        {isCompletedToday
                            ? 'Great job! You kept your streak alive today. Come back tomorrow!'
                            : 'Play any game (Word Jumble, Color Match, Math Quiz) to keep your streak!'}
                    </Text>

                    <View style={styles.taskProgressBarTrack}>
                        <View
                            style={[
                                styles.taskProgressBarFill,
                                { width: isCompletedToday ? '100%' : '0%' },
                            ]}
                        />
                    </View>

                    <View style={styles.taskFooterRow}>
                        <Text style={styles.taskProgressText}>
                            {isCompletedToday ? '1/1 Completed (Done)' : '0/1 Completed'}
                        </Text>
                        {!isCompletedToday && (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={handlePlayNow}
                            >
                                <Text style={styles.playNowText}>Play Now ▶</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const CIRCLE_SIZE = 170;
const RADIUS = CIRCLE_SIZE / 2;
const BORDER_WIDTH = 10;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 32,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        marginBottom: 8,
    },
    backButton: {
        width: 36,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backIcon: {
        width: 22,
        height: 22,
        resizeMode: 'contain',
        tintColor: colors.primary || '#4B3BC6',
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: colors.primary || '#4B3BC6',
    },
    // Streak Banner Card
    streakBannerCard: {
        backgroundColor: '#EEF2FF',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
        marginBottom: 20,
    },
    streakBannerTitle: {
        fontSize: 22,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 4,
    },
    streakBannerSubtitle: {
        fontSize: 13.5,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
        marginBottom: 20,
        textAlign: 'center',
    },
    circleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    outerProgressCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    trackCircle: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: RADIUS,
        borderWidth: BORDER_WIDTH,
        borderColor: '#EFF6FF',
    },
    rightHalfContainer: {
        position: 'absolute',
        top: 0,
        left: RADIUS,
        width: RADIUS,
        height: CIRCLE_SIZE,
        overflow: 'hidden',
    },
    leftHalfContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: RADIUS,
        height: CIRCLE_SIZE,
        overflow: 'hidden',
    },
    rightRingSegment: {
        position: 'absolute',
        top: 0,
        left: -RADIUS,
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: RADIUS,
        borderWidth: BORDER_WIDTH,
        borderColor: 'transparent',
        borderBottomColor: colors.primary || '#2563EB',
        borderRightColor: colors.primary || '#2563EB',
    },
    leftRingSegment: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: RADIUS,
        borderWidth: BORDER_WIDTH,
        borderColor: 'transparent',
        borderBottomColor: colors.primary || '#2563EB',
        borderLeftColor: colors.primary || '#2563EB',
    },
    innerProgressCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    circleDayCount: {
        fontSize: 48,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: colors.primary || '#2563EB',
        lineHeight: 52,
    },
    circleDayLabel: {
        fontSize: 12,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#64748B',
        letterSpacing: 1.5,
    },
    streakDayText: {
        fontSize: 18,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: colors.primary || '#2563EB',
    },
    // Days Selector
    daysRowContainer: {
        marginBottom: 20,
    },
    daysScroll: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 4,
        gap: 14,
    },
    dayItemColumn: {
        alignItems: 'center',
    },
    dayCircle: {
        width: 44,
        height: 44,
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 6,
        position: 'relative',
    },
    dayCircleCurrent: {
        backgroundColor: colors.primary,
    },
    dayCircleCompleted: {
        backgroundColor: '#EFF6FF',
    },
    dayCircleLocked: {
        backgroundColor: '#F1F5F9',
    },
    dayNumberText: {
        fontSize: 15,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#64748B',
    },
    dayNumberCurrentText: {
        color: colors.white,
    },
    dayNumberCompletedText: {
        color: colors.primary,
    },
    lockIconImage: {
        width: 20,
        height: 20,
        resizeMode: 'contain',
        tintColor: '#94A3B8',
    },
    activeNotificationDot: {
        position: 'absolute',
        top: 2,
        right: 2,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#FF4D4D',
    },
    dayNameLabel: {
        fontSize: 12,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#94A3B8',
    },
    dayNameCurrentLabel: {
        color: colors.primary,
        fontWeight: 'bold',
    },
    // Today's Task Card
    taskCard: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
    },
    taskBadge: {
        alignSelf: 'flex-start',
        backgroundColor: '#EFF6FF',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    taskBadgeText: {
        fontSize: 11,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: colors.primary,
        letterSpacing: 0.5,
    },
    taskTitle: {
        fontSize: 18,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#1E293B',
        marginBottom: 6,
    },
    taskSubtitle: {
        fontSize: 13,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
        marginBottom: 16,
    },
    taskProgressBarTrack: {
        height: 6,
        backgroundColor: '#EFF6FF',
        borderRadius: 3,
        marginBottom: 12,
        overflow: 'hidden',
    },
    taskProgressBarFill: {
        height: '100%',
        backgroundColor: colors.primary,
        borderRadius: 3,
    },
    taskFooterRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    taskProgressText: {
        fontSize: 12,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
    },
    playNowText: {
        fontSize: 13,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: colors.primary,
    },
});

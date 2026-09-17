import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import colors from '../../constants/colour';
import fonts from '../../constants/fonts';
import images from '../../constants/images';

export default function WeeklyStreakDetail({ onBack, navigation }) {
    const insets = useSafeAreaInsets();

    const handleBackPress = () => {
        if (onBack) {
            onBack();
        } else if (navigation && navigation.canGoBack()) {
            navigation.goBack();
        }
    };

    const daysData = [
        { day: 'Mon', num: '1', status: 'completed' },
        { day: 'Tue', num: '2', status: 'completed' },
        { day: 'Wed', num: '3', status: 'completed' },
        { day: 'Thu', num: '4', status: 'current', activeDot: true },
        { day: 'Fri', num: '5', status: 'locked' },
        { day: 'Sat', num: '6', status: 'locked' },
        { day: 'Sun', num: '7', status: 'locked' },
    ];

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
                    <Text style={styles.streakBannerSubtitle}>Keep it going to earn rewards!</Text>

                    {/* Circular Progress Display */}
                    <View style={styles.circleContainer}>
                        <View style={styles.outerProgressCircle}>
                            <View style={styles.innerProgressCircle}>
                                <Text style={styles.circleDayCount}>4</Text>
                                <Text style={styles.circleDayLabel}>DAYS</Text>
                            </View>
                        </View>
                    </View>

                    <Text style={styles.streakDayText}>Day 4 of 7</Text>
                </View>

                {/* Days Horizontal Status Selector */}
                <View style={styles.daysRowContainer}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScroll}>
                        {daysData.map((item, index) => {
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
                    <Text style={styles.taskTitle}>Complete 3 Math Quizzes</Text>
                    <Text style={styles.taskSubtitle}>
                        Keep your brain sharp and your streak alive.
                    </Text>

                    <View style={styles.taskProgressBarTrack}>
                        <View style={[styles.taskProgressBarFill, { width: '33%' }]} />
                    </View>

                    <View style={styles.taskFooterRow}>
                        <Text style={styles.taskProgressText}>1/3 Completed</Text>
                        <TouchableOpacity
                            activeOpacity={0.7}
                            onPress={() => Alert.alert("Play Now", "Navigating to Math Quizzes...")}
                        >
                            <Text style={styles.playNowText}>Play Now</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

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
        fontSize: 14,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
        marginBottom: 20,
    },
    circleContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    outerProgressCircle: {
        width: 170,
        height: 170,
        borderRadius: 85,
        borderWidth: 10,
        borderColor: '#EFF6FF',
        borderTopColor: colors.primary,
        borderRightColor: colors.primary,
        borderLeftColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        transform: [{ rotate: '-45deg' }],
    },
    innerProgressCircle: {
        transform: [{ rotate: '45deg' }],
        alignItems: 'center',
    },
    circleDayCount: {
        fontSize: 48,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: colors.primary,
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
        color: colors.primary,
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
    // lockIcon: {
    //     fontSize: 16,
    // },
    lockIconImage: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
        tintColor: colors.primary,
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
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
    },
    taskBadgeText: {
        fontSize: 11,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#EF4444',
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
    // Reward Card
    rewardCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    rewardIconBadge: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    rewardIconText: {
        fontSize: 24,
    },
    rewardTextContainer: {
        flex: 1,
    },
    rewardBadgeLabel: {
        fontSize: 11,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#64748B',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    rewardTitle: {
        fontSize: 16,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#1E293B',
    },
    rewardSubtitle: {
        fontSize: 12,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
    },
    // Reminder Card
    reminderCard: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.04,
        shadowRadius: 10,
    },
    reminderIconBadge: {
        width: 42,
        height: 42,
        borderRadius: 21,
        backgroundColor: '#F1F5F9',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 14,
    },
    bellIconText: {
        fontSize: 18,
    },
    reminderTextContainer: {
        flex: 1,
    },
    reminderTitle: {
        fontSize: 15,
        fontFamily: fonts.bold || 'Poppins-Bold',
        fontWeight: 'bold',
        color: '#1E293B',
    },
    reminderSubtitle: {
        fontSize: 12,
        fontFamily: fonts.medium || 'Poppins-Medium',
        color: '#64748B',
    },
});

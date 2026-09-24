import { getDayDifference, getFormattedDate } from '../src/database/repositories/streakRepository';

describe('7-Day Regular Weekly Streak Logic (Dynamic Real-Time Installation)', () => {
    test('getFormattedDate returns valid YYYY-MM-DD format for any given date', () => {
        const dateStr = getFormattedDate(new Date());
        expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('getDayDifference calculates consecutive and missed days correctly for any dates', () => {
        const today = new Date();
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        const threeDaysAgo = new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000);

        expect(getDayDifference(getFormattedDate(yesterday), getFormattedDate(today))).toBe(1);
        expect(getDayDifference(getFormattedDate(today), getFormattedDate(today))).toBe(0);
        expect(getDayDifference(getFormattedDate(threeDaysAgo), getFormattedDate(today))).toBe(3);
    });

    test('App installed on ANY random day starts Day 1 and completes 7 consecutive days', () => {
        // Dynamically create 7 consecutive days starting from any random install date
        const anyInstallDate = new Date(); // Real device install date & time
        const dynamicStreakDays = [];

        for (let i = 0; i < 7; i++) {
            const date = new Date(anyInstallDate.getTime() + i * 24 * 60 * 60 * 1000);
            dynamicStreakDays.push(getFormattedDate(date));
        }

        let currentStreak = 0;
        for (let i = 0; i < dynamicStreakDays.length; i++) {
            if (i === 0) {
                currentStreak = 1; // Started on install date
            } else {
                const diff = getDayDifference(dynamicStreakDays[i - 1], dynamicStreakDays[i]);
                if (diff === 1) {
                    currentStreak += 1; // Consecutive daily play
                } else {
                    currentStreak = 1;
                }
            }
        }

        expect(currentStreak).toBe(7);
        expect(currentStreak % 7).toBe(0);
        expect(dynamicStreakDays.length).toBe(7);
    });
});

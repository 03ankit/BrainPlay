import { executeSql } from '../database';

// Format Date object to YYYY-MM-DD string
export const getFormattedDate = (date = new Date()) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// Calculate day difference between two YYYY-MM-DD strings
export const getDayDifference = (dateStr1, dateStr2) => {
    if (!dateStr1 || !dateStr2) return Infinity;
    const d1 = new Date(dateStr1);
    const d2 = new Date(dateStr2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
};

const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Record a game level completion and automatically update the player's 7-day streak
 */
export const recordDailyActivity = async (profileId = 'local_player', gameId = '1', levelNumber = 1) => {
    try {
        const pId = String(profileId || 'local_player');
        const todayStr = getFormattedDate();

        // 1. Insert daily activity record
        const actId = `act_${pId}_${todayStr}_${gameId}_${levelNumber}_${Date.now()}`;
        await executeSql(
            `INSERT INTO daily_activities (id, profile_id, activity_date, game_id, level_number, created_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'));`,
            [actId, pId, todayStr, String(gameId), Number(levelNumber)]
        );

        // 2. Fetch current profile streak status
        const profileRes = await executeSql(
            'SELECT streak_count, coins, trophies, updated_at FROM profiles WHERE id = ?;',
            [pId]
        );

        let currentStreak = 0;
        let lastPlayedDate = null;
        let coins = 100;
        let trophies = 0;

        if (profileRes && profileRes.rows && profileRes.rows.length > 0) {
            const row = profileRes.rows.item(0);
            currentStreak = Number(row.streak_count) || 0;
            coins = Number(row.coins) || 100;
            trophies = Number(row.trophies) || 0;
        }

        // 3. Find the most recent previous activity date (before today)
        const prevRes = await executeSql(
            'SELECT activity_date FROM daily_activities WHERE profile_id = ? AND activity_date < ? ORDER BY activity_date DESC LIMIT 1;',
            [pId, todayStr]
        );

        if (prevRes && prevRes.rows && prevRes.rows.length > 0) {
            lastPlayedDate = prevRes.rows.item(0).activity_date;
        }

        // 4. Calculate new streak count
        let newStreak = 1;
        if (lastPlayedDate) {
            const dayDiff = getDayDifference(lastPlayedDate, todayStr);
            if (dayDiff === 1) {
                // Played yesterday -> streak increments!
                newStreak = currentStreak + 1;
            } else if (dayDiff === 0) {
                // Already played today -> streak stays the same
                newStreak = Math.max(1, currentStreak);
            } else {
                // Missed one or more days -> streak restarts from 1 (install/start day)
                newStreak = 1;
            }
        } else {
            // First time playing -> Day 1 start!
            newStreak = 1;
        }

        // 5. 7-Day Completion Reward Bonus
        let bonusCoins = 0;
        let bonusTrophies = 0;
        if (newStreak % 7 === 0) {
            bonusCoins = 200; // Reward 200 bonus coins for completing the 7-day regular streak
            bonusTrophies = 1;
        }

        // 6. Update player profile in SQLite
        await executeSql(
            `UPDATE profiles 
             SET streak_count = ?, 
                 coins = coins + ?, 
                 trophies = trophies + ?,
                 updated_at = datetime('now')
             WHERE id = ?;`,
            [newStreak, bonusCoins, bonusTrophies, pId]
        );

        console.log(`🔥 Streak updated: ${newStreak} days (Bonus: +${bonusCoins} coins)`);

        return {
            streakCount: newStreak,
            isCompletedToday: true,
            bonusCoins,
            bonusTrophies,
        };
    } catch (error) {
        console.error('Error recording daily activity streak:', error?.message || error);
        return {
            streakCount: 1,
            isCompletedToday: true,
            bonusCoins: 0,
            bonusTrophies: 0,
        };
    }
};

/**
 * Fetch 7-day streak progress starting from the user's install/start day
 */
export const getWeeklyStreak = async (profileId = 'local_player') => {
    try {
        const pId = String(profileId || 'local_player');
        const today = new Date();
        const todayStr = getFormattedDate(today);

        // 1. Fetch profile record
        const profileRes = await executeSql(
            'SELECT streak_count, coins, trophies, created_at, updated_at FROM profiles WHERE id = ?;',
            [pId]
        );

        let storedStreak = 0;
        if (profileRes && profileRes.rows && profileRes.rows.length > 0) {
            storedStreak = Number(profileRes.rows.item(0).streak_count) || 0;
        }

        // 2. Check total completed activities and today's activity
        const totalActsRes = await executeSql(
            'SELECT COUNT(*) as total FROM daily_activities WHERE profile_id = ?;',
            [pId]
        );
        const hasEverPlayed = (totalActsRes?.rows?.item(0)?.total || 0) > 0;

        const todayActivity = await executeSql(
            'SELECT COUNT(*) as count FROM daily_activities WHERE profile_id = ? AND activity_date = ?;',
            [pId, todayStr]
        );
        const isCompletedToday = (todayActivity?.rows?.item(0)?.count || 0) > 0;

        // 3. Check most recent activity date to determine if streak is active or reset
        const lastActRes = await executeSql(
            'SELECT activity_date FROM daily_activities WHERE profile_id = ? ORDER BY activity_date DESC LIMIT 1;',
            [pId]
        );
        const lastPlayedDate = (lastActRes && lastActRes.rows && lastActRes.rows.length > 0)
            ? lastActRes.rows.item(0).activity_date
            : null;

        let activeStreak = 0;
        let completedDays = 0;

        if (hasEverPlayed && lastPlayedDate) {
            const dayDiff = getDayDifference(lastPlayedDate, todayStr);
            if (dayDiff === 0) {
                // Completed today
                activeStreak = Math.max(1, storedStreak);
                completedDays = activeStreak % 7 === 0 ? 7 : (activeStreak % 7);
            } else if (dayDiff === 1) {
                // Completed yesterday, today is pending
                activeStreak = Math.max(1, storedStreak);
                completedDays = activeStreak % 7 === 0 ? 7 : (activeStreak % 7);
            } else {
                // Missed one or more days -> streak broken/reset to 0
                activeStreak = 0;
                completedDays = 0;
            }
        } else {
            // Never played any game level
            activeStreak = 0;
            completedDays = 0;
        }

        const progressPercentage = Math.round((completedDays / 7) * 100);

        // 4. Calculate 7 days for the weekly strip
        // todayCycleIndex: which day in the 7-day strip corresponds to today (0 to 6)
        let todayCycleIndex = completedDays;
        if (isCompletedToday) {
            todayCycleIndex = Math.max(0, completedDays - 1);
        } else {
            todayCycleIndex = Math.min(6, completedDays);
        }

        const days = [];
        for (let i = 0; i < 7; i++) {
            const dayNum = i + 1;
            const dayOffset = i - todayCycleIndex;
            const targetDate = new Date(today.getTime() + dayOffset * 24 * 60 * 60 * 1000);
            const dayName = SHORT_DAY_NAMES[targetDate.getDay()];
            const dateStr = getFormattedDate(targetDate);

            let status = 'locked';
            let activeDot = false;

            if (dayNum <= completedDays) {
                status = 'completed'; // Done
            } else if (dayNum === completedDays + 1 && !isCompletedToday) {
                status = 'current'; // Today's pending task
                activeDot = true;
            } else {
                status = 'locked';
            }

            days.push({
                day: dayName,
                num: String(dayNum),
                date: dateStr,
                status,
                activeDot,
            });
        }

        const tier = getStreakTier(activeStreak);

        return {
            streakCount: activeStreak,
            cycleDay: Math.min(7, completedDays + (isCompletedToday ? 0 : 1)),
            completedDays,
            totalDays: 7,
            isCompletedToday,
            days,
            progressPercentage,
            tier,
        };
    } catch (error) {
        console.error('Error getting weekly streak data:', error?.message || error);
        return {
            streakCount: 0,
            cycleDay: 1,
            completedDays: 0,
            totalDays: 7,
            isCompletedToday: false,
            days: Array.from({ length: 7 }, (_, i) => ({
                day: SHORT_DAY_NAMES[(new Date().getDay() + i) % 7],
                num: String(i + 1),
                status: i === 0 ? 'current' : 'locked',
                activeDot: i === 0,
            })),
            progressPercentage: 0,
            tier: getStreakTier(0),
        };
    }
};

export const STREAK_DIVISIONS = [
    // Bronze Tier
    { id: 'bronze_3', tierId: 'bronze', name: 'Bronze', division: 'III', divisionNum: 3, badgeKey: 'bronze', minDays: 0, maxDays: 6, color: '#CD7F32', title: 'Bronze III', description: 'Start your journey towards Bronze II!' },
    { id: 'bronze_2', tierId: 'bronze', name: 'Bronze', division: 'II', divisionNum: 2, badgeKey: 'bronze', minDays: 7, maxDays: 13, color: '#CD7F32', title: 'Bronze II', description: 'Promoted to Bronze II! Next up: Bronze I' },
    { id: 'bronze_1', tierId: 'bronze', name: 'Bronze', division: 'I', divisionNum: 1, badgeKey: 'bronze', minDays: 14, maxDays: 20, color: '#CD7F32', title: 'Bronze I', description: 'Top Bronze division! Push for Silver III' },

    // Silver Tier
    { id: 'silver_3', tierId: 'silver', name: 'Silver', division: 'III', divisionNum: 3, badgeKey: 'silver', minDays: 21, maxDays: 27, color: '#94A3B8', title: 'Silver III', description: 'Welcome to Silver League! Aim for Silver II' },
    { id: 'silver_2', tierId: 'silver', name: 'Silver', division: 'II', divisionNum: 2, badgeKey: 'silver', minDays: 28, maxDays: 34, color: '#94A3B8', title: 'Silver II', description: 'Silver II unlocked! One step closer to Silver I' },
    { id: 'silver_1', tierId: 'silver', name: 'Silver', division: 'I', divisionNum: 1, badgeKey: 'silver', minDays: 35, maxDays: 41, color: '#94A3B8', title: 'Silver I', description: 'Silver peak division! Next tier: Gold III' },

    // Gold Tier
    { id: 'gold_3', tierId: 'gold', name: 'Gold', division: 'III', divisionNum: 3, badgeKey: 'gold', minDays: 42, maxDays: 48, color: '#EAB308', title: 'Gold III', description: 'Gold League achieved! Push for Gold II' },
    { id: 'gold_2', tierId: 'gold', name: 'Gold', division: 'II', divisionNum: 2, badgeKey: 'gold', minDays: 49, maxDays: 55, color: '#EAB308', title: 'Gold II', description: 'Gold II reached! Outstanding consistency' },
    { id: 'gold_1', tierId: 'gold', name: 'Gold', division: 'I', divisionNum: 1, badgeKey: 'gold', minDays: 56, maxDays: 62, color: '#EAB308', title: 'Gold I', description: 'Master of Gold! Ready for Diamond III' },

    // Diamond Tier
    { id: 'diamond_3', tierId: 'diamond', name: 'Diamond', division: 'III', divisionNum: 3, badgeKey: 'diamond', minDays: 63, maxDays: 69, color: '#06B6D4', title: 'Diamond III', description: 'Diamond Tier unlocked! Brilliant logic power' },
    { id: 'diamond_2', tierId: 'diamond', name: 'Diamond', division: 'II', divisionNum: 2, badgeKey: 'diamond', minDays: 70, maxDays: 76, color: '#06B6D4', title: 'Diamond II', description: 'Diamond II achieved! Moving toward Diamond I' },
    { id: 'diamond_1', tierId: 'diamond', name: 'Diamond', division: 'I', divisionNum: 1, badgeKey: 'diamond', minDays: 77, maxDays: 83, color: '#06B6D4', title: 'Diamond I', description: 'Peak Diamond status! Crown Tier ahead' },

    // Crown Tier
    { id: 'crown_3', tierId: 'crown', name: 'Crown', division: 'III', divisionNum: 3, badgeKey: 'crown', minDays: 84, maxDays: 90, color: '#8B5CF6', title: 'Crown III', description: 'Crown royalty achieved! Master of logic' },
    { id: 'crown_2', tierId: 'crown', name: 'Crown', division: 'II', divisionNum: 2, badgeKey: 'crown', minDays: 91, maxDays: 97, color: '#8B5CF6', title: 'Crown II', description: 'Crown II rank reached! Pure dedication' },
    { id: 'crown_1', tierId: 'crown', name: 'Crown', division: 'I', divisionNum: 1, badgeKey: 'crown', minDays: 98, maxDays: 104, color: '#8B5CF6', title: 'Crown I', description: 'Highest Crown level! Push for Immortal' },

    // Immortal Tier
    { id: 'immortal_3', tierId: 'immortal', name: 'Immortal', division: 'III', divisionNum: 3, badgeKey: 'immortal', minDays: 105, maxDays: 111, color: '#EC4899', title: 'Immortal III', description: 'Immortal Tier! Legendary brain capacity' },
    { id: 'immortal_2', tierId: 'immortal', name: 'Immortal', division: 'II', divisionNum: 2, badgeKey: 'immortal', minDays: 112, maxDays: 118, color: '#EC4899', title: 'Immortal II', description: 'Immortal II achieved! Approaching peak rank' },
    { id: 'immortal_1', tierId: 'immortal', name: 'Immortal', division: 'I', divisionNum: 1, badgeKey: 'immortal', minDays: 119, maxDays: 125, color: '#EC4899', title: 'Immortal I', description: 'Final step to Grand Legend status!' },

    // Legend Tier
    { id: 'legend', tierId: 'legend', name: 'Legend', division: 'Apex', divisionNum: 1, badgeKey: 'legend', minDays: 126, maxDays: Infinity, color: '#F59E0B', title: 'Grand Legend', description: 'Ultimate Hall of Fame! Peak Champion.' },
];

export const STREAK_TIERS = [
    { id: 'bronze', name: 'Bronze', badgeKey: 'bronze', minDays: 0, color: '#CD7F32', title: 'Bronze League', divisions: ['III', 'II', 'I'] },
    { id: 'silver', name: 'Silver', badgeKey: 'silver', minDays: 21, color: '#94A3B8', title: 'Silver League', divisions: ['III', 'II', 'I'] },
    { id: 'gold', name: 'Gold', badgeKey: 'gold', minDays: 42, color: '#EAB308', title: 'Gold League', divisions: ['III', 'II', 'I'] },
    { id: 'diamond', name: 'Diamond', badgeKey: 'diamond', minDays: 63, color: '#06B6D4', title: 'Diamond League', divisions: ['III', 'II', 'I'] },
    { id: 'crown', name: 'Crown', badgeKey: 'crown', minDays: 84, color: '#8B5CF6', title: 'Crown Master', divisions: ['III', 'II', 'I'] },
    { id: 'immortal', name: 'Immortal', badgeKey: 'immortal', minDays: 105, color: '#EC4899', title: 'Immortal Tier', divisions: ['III', 'II', 'I'] },
    { id: 'legend', name: 'Legend', badgeKey: 'legend', minDays: 126, color: '#F59E0B', title: 'Grand Legend', divisions: ['Apex'] },
];

export const getStreakTier = (streakCount = 0) => {
    const count = Math.max(0, Number(streakCount) || 0);
    const index = STREAK_DIVISIONS.findIndex((div) => count >= div.minDays && count <= div.maxDays);
    const currentIndex = index !== -1 ? index : STREAK_DIVISIONS.length - 1;
    const current = STREAK_DIVISIONS[currentIndex];
    const nextDivision = currentIndex < STREAK_DIVISIONS.length - 1 ? STREAK_DIVISIONS[currentIndex + 1] : null;
    const daysToNext = nextDivision ? Math.max(1, nextDivision.minDays - count) : 0;

    return {
        ...current,
        streakCount: count,
        nextTier: nextDivision,
        daysToNext,
    };
};

export default {
    recordDailyActivity,
    getWeeklyStreak,
    getFormattedDate,
    getDayDifference,
    getStreakTier,
    STREAK_DIVISIONS,
    STREAK_TIERS,
};

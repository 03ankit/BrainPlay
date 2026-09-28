import { executeSql } from '../database';

/**
 * Calculates coin reward based on stars earned:
 * 3 Stars -> 100 Coins
 * 2 Stars -> 70 Coins
 * 1 Star  -> 50 Coins
 * 0 Stars -> 0 Coins
 */
export const getCoinRewardForStars = (stars) => {
    const s = Number(stars) || 0;
    if (s >= 3) return 100;
    if (s === 2) return 70;
    if (s === 1) return 50;
    return 0;
};

export const savePlayerProgress = async ({
    profileId = 'local_player',
    gameId = '1',
    levelNumber = 1,
    stars = 3,
    highScore = 100,
    isCompleted = 1,
}) => {
    try {
        const pId = String(profileId || 'local_player');
        const gId = String(gameId || '1');
        const lvlNum = Number(levelNumber || 1);
        const numStars = Number(stars || 0);
        const numHighScore = Number(highScore || 0);
        const id = `prog_${pId}_${gId}_${lvlNum}`;

        await executeSql(
            `INSERT INTO player_progress (id, profile_id, game_id, level_number, stars, high_score, is_completed)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON CONFLICT(id) DO UPDATE SET
             stars = MAX(COALESCE(stars, 0), excluded.stars),
             high_score = MAX(COALESCE(high_score, 0), excluded.high_score),
             is_completed = 1;`,
            [id, pId, gId, lvlNum, numStars, numHighScore, isCompleted ? 1 : 0]
        );
        console.log(`✅ Player progress updated for level ${lvlNum} with ${numStars} stars`);
        return true;
    } catch (error) {
        console.error('Error saving player progress:', error?.message || error);
        return false;
    }
};

export const getPlayerProgress = async (profileId = 'local_player', gameId = '1') => {
    try {
        const pId = String(profileId || 'local_player');
        const gId = String(gameId || '1');

        const results = await executeSql(
            'SELECT * FROM player_progress WHERE profile_id = ? AND game_id = ?;',
            [pId, gId]
        );
        const progress = [];
        if (results && results.rows) {
            for (let i = 0; i < results.rows.length; i++) {
                progress.push(results.rows.item(i));
            }
        }
        return progress;
    } catch (error) {
        console.error('Error fetching player progress:', error?.message || error);
        return [];
    }
};

/**
 * Get all level numbers unlocked with coins or special bypass for a game
 */
export const getUnlockedLevels = async (profileId = 'local_player', gameId = '1') => {
    try {
        const pId = String(profileId || 'local_player');
        const gId = String(gameId || '1');

        const results = await executeSql(
            'SELECT level_number FROM unlocked_levels WHERE profile_id = ? AND game_id = ?;',
            [pId, gId]
        );
        const levels = [];
        if (results && results.rows) {
            for (let i = 0; i < results.rows.length; i++) {
                levels.push(Number(results.rows.item(i).level_number));
            }
        }
        return levels;
    } catch (error) {
        console.error('Error fetching unlocked levels:', error?.message || error);
        return [];
    }
};

/**
 * Unlock a level using 300 coins
 * Validates player coin balance, deducts 300 coins, and adds the level to unlocked_levels
 */
export const unlockLevelWithCoins = async ({
    profileId = 'local_player',
    gameId = '1',
    levelNumber = 6,
    cost = 300,
}) => {
    try {
        const pId = String(profileId || 'local_player');
        const gId = String(gameId || '1');
        const lvlNum = Number(levelNumber || 1);
        const unlockCost = Number(cost || 300);

        // 1. Check current coins in profile
        const profileRes = await executeSql(
            'SELECT coins FROM profiles WHERE id = ?;',
            [pId]
        );

        let currentCoins = 0;
        if (profileRes && profileRes.rows && profileRes.rows.length > 0) {
            currentCoins = Number(profileRes.rows.item(0).coins) || 0;
        }

        if (currentCoins < unlockCost) {
            return {
                success: false,
                reason: 'insufficient_coins',
                currentCoins,
                requiredCoins: unlockCost,
                message: `You need ${unlockCost} coins to unlock this level (You have ${currentCoins} 🪙).`,
            };
        }

        // 2. Deduct coins from profile
        await executeSql(
            "UPDATE profiles SET coins = MAX(0, coins - ?), updated_at = datetime('now') WHERE id = ?;",
            [unlockCost, pId]
        );

        // 3. Save into unlocked_levels
        const unlockId = `unlock_${pId}_${gId}_${lvlNum}`;
        await executeSql(
            `INSERT INTO unlocked_levels (id, profile_id, game_id, level_number, unlocked_at)
             VALUES (?, ?, ?, ?, datetime('now'))
             ON CONFLICT(id) DO NOTHING;`,
            [unlockId, pId, gId, lvlNum]
        );

        const newBalance = currentCoins - unlockCost;
        console.log(`🔓 Level ${lvlNum} unlocked with ${unlockCost} coins! New balance: ${newBalance} 🪙`);

        return {
            success: true,
            levelNumber: lvlNum,
            deductedCoins: unlockCost,
            remainingCoins: newBalance,
            message: `Level ${lvlNum} unlocked successfully!`,
        };
    } catch (error) {
        console.error('Error unlocking level with coins:', error?.message || error);
        return {
            success: false,
            reason: 'error',
            message: error?.message || 'Failed to unlock level.',
        };
    }
};

export const resetPlayerProgress = async (profileId = 'local_player', gameId = '1') => {
    try {
        const pId = String(profileId || 'local_player');
        const gId = String(gameId || '1');
        await executeSql('DELETE FROM player_progress WHERE profile_id = ? AND game_id = ?;', [pId, gId]);
        await executeSql('DELETE FROM unlocked_levels WHERE profile_id = ? AND game_id = ?;', [pId, gId]);
        console.log('✅ Player progress and unlocks reset successfully');
        return true;
    } catch (error) {
        console.error('Error resetting player progress:', error?.message || error);
        return false;
    }
};

export default {
    getCoinRewardForStars,
    savePlayerProgress,
    getPlayerProgress,
    getUnlockedLevels,
    unlockLevelWithCoins,
    resetPlayerProgress,
};

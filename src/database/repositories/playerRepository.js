import { executeSql } from '../database';

export const getPlayerProfile = async (id = 'local_player') => {
    try {
        const results = await executeSql('SELECT * FROM profiles WHERE id = ?;', [id]);
        if (results.rows.length > 0) {
            return results.rows.item(0);
        }
        return null;
    } catch (error) {
        console.error('Error fetching player profile:', error);
        throw error;
    }
};

export const updatePlayerStats = async (id = 'local_player', { xp, coins, trophies }) => {
    try {
        await executeSql(
            `UPDATE profiles 
             SET xp = xp + ?, coins = coins + ?, trophies = trophies + ?, updated_at = datetime('now')
             WHERE id = ?;`,
            [xp || 0, coins || 0, trophies || 0, id]
        );
        return await getPlayerProfile(id);
    } catch (error) {
        console.error('Error updating player stats:', error);
        throw error;
    }
};

export const deductCoins = async (id = 'local_player', amount = 0) => {
    try {
        // Clamp so coins never go below 0
        await executeSql(
            `UPDATE profiles
             SET coins = MAX(0, coins - ?), updated_at = datetime('now')
             WHERE id = ?;`,
            [amount, id]
        );
        return await getPlayerProfile(id);
    } catch (error) {
        console.error('Error deducting coins:', error);
        throw error;
    }
};

export const savePlayerProfile = async (id = 'local_player', { name, email, phone_number, image }) => {
    try {
        await executeSql(
            `INSERT INTO profiles (id, name, email, phone_number, image, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
             ON CONFLICT(id) DO UPDATE SET
             name = excluded.name,
             email = excluded.email,
             phone_number = excluded.phone_number,
             image = excluded.image,
             updated_at = datetime('now');`,
            [id, name || 'Player', email || '', phone_number || '', image || null]
        );
        return await getPlayerProfile(id);
    } catch (error) {
        console.error('Error saving player profile:', error);
        throw error;
    }
};

export const syncPlayerCoins = async (id = 'local_player') => {
    try {
        const currentProfile = await getPlayerProfile(id);
        if (currentProfile && currentProfile.coins !== null && currentProfile.coins !== undefined && Number(currentProfile.coins) > 0) {
            return Number(currentProfile.coins);
        }

        const progRes = await executeSql(
            'SELECT stars FROM player_progress WHERE profile_id = ? AND is_completed = 1;',
            [id]
        );
        let earnedCoins = 0;
        if (progRes && progRes.rows) {
            for (let i = 0; i < progRes.rows.length; i++) {
                const stars = Number(progRes.rows.item(i).stars) || 0;
                if (stars >= 3) earnedCoins += 100;
                else if (stars === 2) earnedCoins += 70;
                else if (stars === 1) earnedCoins += 50;
            }
        }

        let unlockCost = 0;
        try {
            const unlockRes = await executeSql(
                'SELECT COUNT(*) as count FROM unlocked_levels WHERE profile_id = ?;',
                [id]
            );
            if (unlockRes && unlockRes.rows && unlockRes.rows.length > 0) {
                unlockCost = (Number(unlockRes.rows.item(0).count) || 0) * 300;
            }
        } catch (e) {
            // unlocked_levels table might not exist yet during first boot
        }

        const actualCoins = Math.max(0, earnedCoins - unlockCost);
        await executeSql(
            "UPDATE profiles SET coins = ?, updated_at = datetime('now') WHERE id = ?;",
            [actualCoins, id]
        );
        console.log(`🪙 Synced player coins for [${id}]: ${actualCoins} 🪙`);
        return actualCoins;
    } catch (error) {
        console.error('Error syncing player coins:', error);
        return 0;
    }
};

export default {
    getPlayerProfile,
    updatePlayerStats,
    savePlayerProfile,
    syncPlayerCoins,
    deductCoins,
};

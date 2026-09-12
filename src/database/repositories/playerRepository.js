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

export default {
    getPlayerProfile,
    updatePlayerStats,
};

import { executeSql } from '../database';

export const saveGameHistory = async ({
    profileId = 'local_player',
    gameId = '1',
    levelNumber = 1,
    score = 100,
    stars = 3,
    accuracy = 100,
}) => {
    try {
        const id = `gh_${Date.now()}`;
        await executeSql(
            `INSERT INTO game_history (id, profile_id, game_id, level_number, score, stars, accuracy, played_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'));`,
            [id, profileId, gameId, levelNumber, score, stars, accuracy]
        );
        console.log(`✅ Game history saved for level ${levelNumber}`);
        return true;
    } catch (error) {
        console.error('Error saving game history:', error);
        return false;
    }
};

export const getGameHistory = async (profileId = 'local_player', gameId = '1') => {
    try {
        const results = await executeSql(
            'SELECT * FROM game_history WHERE profile_id = ? AND game_id = ? ORDER BY played_at DESC;',
            [profileId, gameId]
        );
        const history = [];
        for (let i = 0; i < results.rows.length; i++) {
            history.push(results.rows.item(i));
        }
        return history;
    } catch (error) {
        console.error('Error fetching game history:', error);
        return [];
    }
};

export default {
    saveGameHistory,
    getGameHistory,
};

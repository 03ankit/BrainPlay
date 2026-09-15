import { executeSql } from '../database';

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
             stars = excluded.stars,
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

export const resetPlayerProgress = async (profileId = 'local_player', gameId = '1') => {
    try {
        const pId = String(profileId || 'local_player');
        const gId = String(gameId || '1');
        await executeSql('DELETE FROM player_progress WHERE profile_id = ? AND game_id = ?;', [pId, gId]);
        console.log('✅ Player progress reset successfully');
        return true;
    } catch (error) {
        console.error('Error resetting player progress:', error?.message || error);
        return false;
    }
};

export default {
    savePlayerProgress,
    getPlayerProgress,
    resetPlayerProgress,
};

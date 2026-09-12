import { executeSql } from '../database';

// Fetch questions for a specific game (e.g. game_id = '1' for Word Jumble / Word Puzzle)
export const getQuestionsForGame = async (gameId = '1') => {
    try {
        const results = await executeSql(
            'SELECT * FROM questions WHERE game_id = ? ORDER BY level_number ASC;',
            [gameId]
        );

        const questions = [];
        for (let i = 0; i < results.rows.length; i++) {
            const item = results.rows.item(i);
            let parsedOptions = [];
            try {
                parsedOptions = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            } catch (e) {
                parsedOptions = item.question ? item.question.split('') : [];
            }

            questions.push({
                ...item,
                word: item.correct_answer || item.question,
                clue: item.hint || item.explanation || item.question,
                time: item.time_limit_seconds || 15,
                options: parsedOptions,
            });
        }
        return questions;
    } catch (error) {
        console.error('Error fetching questions for game:', error);
        return [];
    }
};

// Fetch single question by level number
export const getQuestionByLevel = async (gameId = '1', levelNumber = 1) => {
    try {
        const results = await executeSql(
            'SELECT * FROM questions WHERE game_id = ? AND level_number = ? LIMIT 1;',
            [gameId, levelNumber]
        );

        if (results.rows.length > 0) {
            const item = results.rows.item(0);
            let parsedOptions = [];
            try {
                parsedOptions = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
            } catch (e) {
                parsedOptions = item.question ? item.question.split('') : [];
            }

            return {
                ...item,
                word: item.correct_answer || item.question,
                clue: item.hint || item.explanation || item.question,
                time: item.time_limit_seconds || 15,
                options: parsedOptions,
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching question by level:', error);
        return null;
    }
};

export default {
    getQuestionsForGame,
    getQuestionByLevel,
};

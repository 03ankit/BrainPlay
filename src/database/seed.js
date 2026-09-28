import { initDatabase, executeSql } from './database';
import { WORD_PUZZLE_QUESTIONS } from '../data/wordPuzzleQuestions';
import playerRepository from './repositories/playerRepository';

export const seedDatabase = async () => {
    try {
        // Guarantee tables exist before running queries
        await initDatabase();
        console.log('🌱 Checking seed data...');

        // 1. Check if categories table is empty
        const catCheck = await executeSql('SELECT COUNT(*) as count FROM categories;');
        if (catCheck.rows.item(0).count === 0) {
            console.log('🌱 Seeding initial categories...');
            await executeSql(
                `INSERT INTO categories (id, name, slug, icon, description, color, total_questions) VALUES 
                ('cat_1', 'General Knowledge', 'general-knowledge', '🧠', 'Test your everyday knowledge', '#4F46E5', 20),
                ('cat_2', 'Science & Nature', 'science-nature', '🔬', 'Discover physics, chemistry & biology', '#10B981', 20),
                ('cat_3', 'Mathematics & Logic', 'math-logic', '🔢', 'Solve fun math puzzles & riddles', '#F59E0B', 20);`
            );
        }

        // 2. Check if default user profile exists
        // const profileCheck = await executeSql('SELECT COUNT(*) as count FROM profiles;');
        // if (profileCheck.rows.item(0).count === 0) {
        //     console.log('🌱 Seeding default player profile...');
        //     await executeSql(
        //         `INSERT INTO profiles (id, name, email, phone_number, level, xp, coins, trophies, streak_count, created_at, updated_at) VALUES 
        //         ('local_player', 'Brain Player', 'player@brainplay.com', '+1 (555) 019-2834', 1, 0, 0, 0, 0, datetime('now'), datetime('now'));`
        //     );
        // }

        // 3. Seed / Sync all 20 Word Puzzle questions into SQLite questions table
        console.log('🌱 Syncing all Word Puzzle questions...');
        for (const q of WORD_PUZZLE_QUESTIONS) {
            const optionsJson = JSON.stringify(q.options);
            await executeSql(
                `INSERT INTO questions (id, game_id, category_id, level_number, question, options, correct_answer, hint, time_limit_seconds, difficulty, points)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                 ON CONFLICT(id) DO UPDATE SET
                 game_id = excluded.game_id,
                 category_id = excluded.category_id,
                 level_number = excluded.level_number,
                 question = excluded.question,
                 options = excluded.options,
                 correct_answer = excluded.correct_answer,
                 hint = excluded.hint,
                 time_limit_seconds = excluded.time_limit_seconds,
                 difficulty = excluded.difficulty,
                 points = excluded.points;`,
                [
                    q.id,
                    q.game_id,
                    q.category_id,
                    q.level_number,
                    q.word,
                    optionsJson,
                    q.word,
                    q.clue,
                    q.time_limit_seconds,
                    q.difficulty,
                    q.points,
                ]
            );
        }
        // 4. Sync player coins accurately with actual gameplay progress
        await playerRepository.syncPlayerCoins('local_player');

        console.log('✅ Seed check completed.');
    } catch (error) {
        console.error('❌ Database seed error:', error?.message || error);
    }
};

export default seedDatabase;

import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

let db = null;
let initPromise = null;

// DDL queries for all required SQLite tables
const CREATE_TABLE_QUERIES = [
    `CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        name TEXT DEFAULT 'BrainPlayer',
        email TEXT,
        phone_number TEXT,
        image TEXT,
        level INTEGER DEFAULT 1,
        xp INTEGER DEFAULT 0,
        coins INTEGER DEFAULT 0,
        trophies INTEGER DEFAULT 0,
        streak_count INTEGER DEFAULT 0,
        created_at TEXT,
        updated_at TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT UNIQUE,
        icon TEXT DEFAULT '📚',
        description TEXT,
        color TEXT DEFAULT '#4F46E5',
        total_questions INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS games (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT DEFAULT 'EASY',
        color TEXT DEFAULT '#4F46E5',
        icon TEXT DEFAULT '🎮',
        description TEXT,
        high_score INTEGER DEFAULT 0,
        total_levels INTEGER DEFAULT 20,
        current_level INTEGER DEFAULT 1
    );`,
    `CREATE TABLE IF NOT EXISTS questions (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL,
        category_id TEXT NOT NULL,
        level_number INTEGER DEFAULT 1,
        question TEXT NOT NULL,
        options TEXT NOT NULL DEFAULT '[]',
        correct_answer TEXT NOT NULL,
        hint TEXT,
        explanation TEXT,
        difficulty TEXT DEFAULT 'EASY',
        points INTEGER DEFAULT 100,
        time_limit_seconds INTEGER DEFAULT 30
    );`,
    `CREATE TABLE IF NOT EXISTS levels (
        id TEXT PRIMARY KEY,
        game_id TEXT NOT NULL,
        level_number INTEGER NOT NULL,
        title TEXT NOT NULL,
        stars INTEGER DEFAULT 0,
        status TEXT DEFAULT 'locked',
        reward_coins INTEGER DEFAULT 50,
        reward_xp INTEGER DEFAULT 100
    );`,
    `CREATE TABLE IF NOT EXISTS player_progress (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        game_id TEXT NOT NULL,
        level_number INTEGER NOT NULL,
        stars INTEGER DEFAULT 0,
        high_score INTEGER DEFAULT 0,
        is_completed INTEGER DEFAULT 0
    );`,
    `CREATE TABLE IF NOT EXISTS game_history (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        game_id TEXT NOT NULL,
        level_number INTEGER NOT NULL,
        score INTEGER DEFAULT 0,
        stars INTEGER DEFAULT 0,
        accuracy INTEGER DEFAULT 100,
        played_at TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS daily_activities (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        activity_date TEXT NOT NULL,
        game_id TEXT NOT NULL,
        level_number INTEGER NOT NULL,
        created_at TEXT
    );`,
    `CREATE TABLE IF NOT EXISTS unlocked_levels (
        id TEXT PRIMARY KEY,
        profile_id TEXT NOT NULL,
        game_id TEXT NOT NULL,
        level_number INTEGER NOT NULL,
        unlocked_at TEXT
    );`,
];

// Open database and initialize tables
export const getDatabase = async () => {
    try {
        if (!db) {
            db = await SQLite.openDatabase({
                name: 'brainplay.db',
                location: 'default',
            });
            console.log('✅ BrainPlay database opened successfully');
        }

        if (!initPromise) {
            initPromise = (async () => {
                try {
                    for (const sql of CREATE_TABLE_QUERIES) {
                        await db.executeSql(sql);
                    }
                    console.log('✅ All SQLite tables initialized & verified');
                } catch (tableErr) {
                    console.error('❌ Error creating SQLite tables:', tableErr?.message || tableErr);
                    initPromise = null; // reset to allow retry
                    throw tableErr;
                }
            })();
        }
        await initPromise;

        return db;
    } catch (error) {
        console.error('❌ Database opening error:', error?.message || error);
        throw error;
    }
};

// Close database connection
export const closeDatabase = async () => {
    try {
        if (db) {
            await db.close();
            db = null;
            initPromise = null;
            console.log('✅ BrainPlay database closed');
        }
    } catch (error) {
        console.error('❌ Database closing error:', error?.message || error);
    }
};

// Explicit table initialization
export const initDatabase = async () => {
    try {
        await getDatabase();
    } catch (error) {
        console.error('❌ Table initialization error:', error?.message || error);
    }
};

// Execute custom SQL query safely
export const executeSql = async (query, params = []) => {
    try {
        const database = await getDatabase();
        const [results] = await database.executeSql(query, params);
        return results;
    } catch (error) {
        console.error(`❌ executeSql error on query [${query}]:`, error?.message || error);
        throw error;
    }
};

// Check database status & report missing tables
export const checkDatabaseStatus = async () => {
    try {
        const database = await getDatabase();

        await database.executeSql('SELECT 1;');

        const [results] = await database.executeSql(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
        );

        const existingTables = [];
        for (let i = 0; i < results.rows.length; i++) {
            existingTables.push(results.rows.item(i).name);
        }

        const requiredTables = ['profiles', 'categories', 'games', 'questions', 'levels', 'player_progress', 'game_history'];
        const missingTables = requiredTables.filter((table) => !existingTables.includes(table));

        const isWorking = missingTables.length === 0;

        const report = {
            isWorking,
            existingTables,
            missingTables,
            status: isWorking ? 'HEALTHY' : 'INCOMPLETE',
        };

        if (isWorking) {
            console.log('✅ DATABASE CHECK PASSED: Database is correct and fully working!', report);
        } else {
            console.warn('⚠️ DATABASE CHECK WARNING: Missing tables:', missingTables, report);
        }

        return report;
    } catch (error) {
        console.error('❌ DATABASE CHECK FAILED: Database has errors!', error);
        return {
            isWorking: false,
            error: error?.message || error,
            status: 'ERROR',
        };
    }
};

export default {
    getDatabase,
    closeDatabase,
    initDatabase,
    executeSql,
    checkDatabaseStatus,
};
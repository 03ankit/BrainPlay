import SQLite from 'react-native-sqlite-storage';
import { SCHEMA } from './schema';

SQLite.enablePromise(true);

let db = null;

// Open database
export const getDatabase = async () => {
    try {
        if (!db) {
            db = await SQLite.openDatabase({
                name: 'brainplay.db',
                location: 'default',
            });
            console.log('✅ BrainPlay database opened');
        }
        return db;
    } catch (error) {
        console.error('❌ Database opening error:', error);
        throw error;
    }
};

// Close database
export const closeDatabase = async () => {
    try {
        if (db) {
            await db.close();
            db = null;
            console.log('✅ BrainPlay database closed');
        }
    } catch (error) {
        console.error('❌ Database closing error:', error);
    }
};

// Create tables automatically from schema
export const initDatabase = async () => {
    try {
        const database = await getDatabase();
        for (const [tableName, fields] of Object.entries(SCHEMA)) {
            const columns = Object.entries(fields)
                .map(([col, type]) => `${col} ${col === 'id' ? 'TEXT PRIMARY KEY' : type === 'number' ? 'INTEGER' : 'TEXT'}`)
                .join(', ');

            await database.executeSql(`CREATE TABLE IF NOT EXISTS ${tableName} (${columns});`);
        }
        console.log('✅ Tables initialized');
    } catch (error) {
        console.error('❌ Table initialization error:', error);
    }
};

// Execute custom SQL query
export const executeSql = async (query, params = []) => {
    const database = await getDatabase();
    const [results] = await database.executeSql(query, params);
    return results;
};

export default {
    getDatabase,
    closeDatabase,
    initDatabase,
    executeSql,
};
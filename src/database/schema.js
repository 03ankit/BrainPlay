// Database Schema for BrainPlay & Supabase

export const TABLES = {
    PROFILES: 'profiles',
    GAMES: 'games',
    CATEGORIES: 'categories',
    QUESTIONS: 'questions',
    LEVELS: 'levels',
    PLAYER_PROGRESS: 'player_progress',
    GAME_HISTORY: 'game_history',
};

export const SCHEMA = {
    // Supabase User Profile
    profiles: {
        id: 'string', // Supabase auth user UUID
        name: 'string',
        email: 'string',
        phone_number: 'string',
        image: 'string',
        level: 'number',
        xp: 'number',
        coins: 'number',
        trophies: 'number',
        streak_count: 'number',
        created_at: 'string',
        updated_at: 'string',
    },

    // Knowledge & Trivia Questions Bank
    questions: {
        id: 'string',
        game_id: 'string',
        category_id: 'string',
        level_number: 'number',
        question: 'string',
        options: 'array', // e.g. ["A", "B", "C", "D"]
        correct_answer: 'any', // Index or string
        hint: 'string',
        explanation: 'string',
        difficulty: 'string', // EASY, MEDIUM, HARD
        points: 'number',
        time_limit_seconds: 'number',
    },

    // Games in BrainPlay
    games: {
        id: 'string',
        title: 'string',
        category: 'string',
        difficulty: 'string',
        color: 'string',
        icon: 'string',
        description: 'string',
        high_score: 'number',
        total_levels: 'number',
        current_level: 'number',
    },

    // Levels per Game
    levels: {
        id: 'string',
        game_id: 'string',
        level_number: 'number',
        title: 'string',
        stars: 'number',
        status: 'string', // locked, active, completed
        reward_coins: 'number',
        reward_xp: 'number',
    },

    // Player Progress
    player_progress: {
        id: 'string',
        profile_id: 'string',
        game_id: 'string',
        level_number: 'number',
        stars: 'number',
        high_score: 'number',
        is_completed: 'boolean',
    },

    // Game Session History
    game_history: {
        id: 'string',
        profile_id: 'string',
        game_id: 'string',
        level_number: 'number',
        score: 'number',
        stars: 'number',
        accuracy: 'number',
        played_at: 'string',
    },
};

// SQL CREATE TABLE queries directly available in this file
export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL DEFAULT 'BrainPlayer',
    email TEXT,
    phone_number TEXT,
    image TEXT,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 100,
    trophies INTEGER DEFAULT 0,
    streak_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    icon TEXT DEFAULT '📚',
    description TEXT,
    color TEXT DEFAULT '#4F46E5',
    total_questions INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.games (
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
);

CREATE TABLE IF NOT EXISTS public.questions (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    category_id TEXT NOT NULL,
    level_number INTEGER DEFAULT 1,
    question TEXT NOT NULL,
    options JSONB NOT NULL DEFAULT '[]'::jsonb,
    correct_answer JSONB NOT NULL,
    hint TEXT,
    explanation TEXT,
    difficulty TEXT DEFAULT 'EASY',
    points INTEGER DEFAULT 100,
    time_limit_seconds INTEGER DEFAULT 30
);

CREATE TABLE IF NOT EXISTS public.levels (
    id TEXT PRIMARY KEY,
    game_id TEXT NOT NULL,
    level_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    stars INTEGER DEFAULT 0,
    status TEXT DEFAULT 'locked',
    reward_coins INTEGER DEFAULT 50,
    reward_xp INTEGER DEFAULT 100,
    UNIQUE(game_id, level_number)
);

CREATE TABLE IF NOT EXISTS public.player_progress (
    id TEXT PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    level_number INTEGER NOT NULL,
    stars INTEGER DEFAULT 0,
    high_score INTEGER DEFAULT 0,
    is_completed BOOLEAN DEFAULT FALSE,
    UNIQUE(profile_id, game_id, level_number)
);

CREATE TABLE IF NOT EXISTS public.game_history (
    id TEXT PRIMARY KEY,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    game_id TEXT NOT NULL,
    level_number INTEGER NOT NULL,
    score INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    accuracy NUMERIC DEFAULT 100,
    played_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, phone_number, image)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', 'BrainPlayer'),
        NEW.email,
        COALESCE(NEW.phone, NEW.raw_user_meta_data->>'phone', ''),
        COALESCE(NEW.raw_user_meta_data->>'image', NEW.raw_user_meta_data->>'avatar_url', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
`;

export default SCHEMA;

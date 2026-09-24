import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const SUPABASE_URL = 'https://giefmxycycfqywzqfkde.supabase.co';
export const SUPABASE_ANON_KEY = 'sb_publishable_NZyi7yCQyGThtZ6WW29xYA_NrL72KzI';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

/**
 * Fetch a profile by User ID
 */
export const getProfile = async (userId) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.warn('Supabase getProfile notice:', error.message);
            return null;
        }
        return data;
    } catch (err) {
        console.warn('Supabase getProfile notice:', err?.message || err);
        return null;
    }
};

/**
 * Upsert / Update a profile in public.profiles
 * Schema: id (uuid), email, phone, name, photo_url, created_at, updated_at
 */
export const upsertProfile = async ({ id, email, phone, name, photo_url }) => {
    try {
        const updates = {
            id,
            email,
            phone,
            name,
            photo_url,
            updated_at: new Date().toISOString(),
        };

        const { data, error } = await supabase
            .from('profiles')
            .upsert(updates, { onConflict: 'id' })
            .select()
            .single();

        if (error) {
            console.warn('Supabase upsert notice:', error.message);
            return null;
        }
        return data;
    } catch (err) {
        console.warn('Supabase upsert notice:', err?.message || err);
        return null;
    }
};

export default supabase;

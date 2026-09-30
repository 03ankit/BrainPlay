import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Vibration, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VIBRATION_STORAGE_KEY = '@brainplay_vibration_enabled';

// In-memory cache for zero-latency execution
let isEnabled = true;

// Load initial vibration preference from AsyncStorage
(async () => {
    try {
        const stored = await AsyncStorage.getItem(VIBRATION_STORAGE_KEY);
        if (stored !== null) {
            isEnabled = JSON.parse(stored);
        }
    } catch (e) {
        isEnabled = true;
    }
})();

const defaultHapticOptions = {
    enableVibrateFallback: true,
    ignoreAndroidSystemSettings: true, // Forces vibration even if system touch haptics are disabled
};

class HapticService {
    /**
     * Check whether vibration is currently enabled.
     */
    static isVibrationEnabled() {
        return isEnabled;
    }

    /**
     * Enable or disable vibration across the app.
     * @param {boolean} value
     */
    static async setVibrationEnabled(value) {
        isEnabled = Boolean(value);
        try {
            await AsyncStorage.setItem(VIBRATION_STORAGE_KEY, JSON.stringify(isEnabled));
        } catch (e) {
            console.warn('Failed to save vibration setting:', e);
        }
    }

    /**
     * Generic trigger with dual native engine execution
     * @param {string} type 
     */
    static trigger(type = 'impactLight') {
        if (!isEnabled) return;

        try {
            ReactNativeHapticFeedback.trigger(type, defaultHapticOptions);
        } catch (e) {
            // fallback handled below
        }

        // Direct vibration motor pulse for guaranteed physical feel on Android
        if (Platform.OS === 'android') {
            if (type.includes('Error')) {
                Vibration.vibrate([0, 120, 60, 140]);
            } else if (type.includes('Success')) {
                Vibration.vibrate([0, 60, 50, 100]);
            } else {
                Vibration.vibrate(40);
            }
        }
    }

    /**
     * Light tap for navigation buttons, tabs, menu items.
     */
    static selection() {
        if (!isEnabled) return;

        try {
            ReactNativeHapticFeedback.trigger('selection', defaultHapticOptions);
        } catch {
            // ignore
        }

        if (Platform.OS === 'android') {
            Vibration.vibrate(35); // 35ms crisp motor pulse
        }
    }

    /**
     * Light impact for tile selection, letter clicks.
     */
    static light() {
        if (!isEnabled) return;

        try {
            ReactNativeHapticFeedback.trigger('impactLight', defaultHapticOptions);
        } catch {
            // ignore
        }

        if (Platform.OS === 'android') {
            Vibration.vibrate(40); // 40ms noticeable pulse
        }
    }

    /**
     * Medium impact for card flips, option selection, submit.
     */
    static medium() {
        if (!isEnabled) return;

        try {
            ReactNativeHapticFeedback.trigger('impactMedium', defaultHapticOptions);
        } catch {
            // ignore
        }

        if (Platform.OS === 'android') {
            Vibration.vibrate(70); // 70ms solid pulse
        }
    }

    /**
     * Heavy impact for level unlocks, modal popups.
     */
    static heavy() {
        if (!isEnabled) return;

        try {
            ReactNativeHapticFeedback.trigger('impactHeavy', defaultHapticOptions);
        } catch {
            // ignore
        }

        if (Platform.OS === 'android') {
            Vibration.vibrate(120); // 120ms strong pulse
        }
    }

    /**
     * Positive feedback when an answer is correct or level is won.
     */
    static success() {
        if (!isEnabled) return;

        try {
            ReactNativeHapticFeedback.trigger('notificationSuccess', defaultHapticOptions);
        } catch {
            // ignore
        }

        if (Platform.OS === 'android') {
            // Double pleasant pulse: wait 0ms, vibrate 70ms, pause 60ms, vibrate 120ms
            Vibration.vibrate([0, 70, 60, 120]);
        }
    }

    /**
     * Negative feedback for wrong answers, invalid words, or mistakes.
     */
    static error() {
        if (!isEnabled) return;

        try {
            ReactNativeHapticFeedback.trigger('notificationError', defaultHapticOptions);
        } catch {
            // ignore
        }

        if (Platform.OS === 'android') {
            // Warning double-thump: wait 0ms, vibrate 120ms, pause 70ms, vibrate 160ms
            Vibration.vibrate([0, 120, 70, 160]);
        }
    }

    /**
     * Warning feedback for time up or timer low.
     */
    static warning() {
        if (!isEnabled) return;

        try {
            ReactNativeHapticFeedback.trigger('notificationWarning', defaultHapticOptions);
        } catch {
            // ignore
        }

        if (Platform.OS === 'android') {
            Vibration.vibrate(180); // 180ms solid alert
        }
    }
}

export default HapticService;

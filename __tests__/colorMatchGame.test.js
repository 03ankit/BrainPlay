import {
    STROOP_COLORS,
    COLOR_MATCH_LEVELS,
    getLevelChallenge,
} from '../src/constants/colorMatchData';

describe('Color Match Game & Stroop Engine Unit Tests (1 Level = 1 Game)', () => {
    describe('1. Stroop Palettes & Levels Config', () => {
        test('has all required base Stroop colors with hex codes', () => {
            expect(STROOP_COLORS.RED).toBeDefined();
            expect(STROOP_COLORS.RED.hex).toBe('#EF4444');
            expect(STROOP_COLORS.BLUE).toBeDefined();
            expect(STROOP_COLORS.BLUE.hex).toBe('#3B82F6');
        });

        test('provides 20 configured levels with 1 challenge per level', () => {
            expect(COLOR_MATCH_LEVELS.length).toBe(20);
            expect(COLOR_MATCH_LEVELS[0].level).toBe(1);
            expect(COLOR_MATCH_LEVELS[0].difficulty).toBe('EASY');
            expect(COLOR_MATCH_LEVELS[19].level).toBe(20);
            expect(COLOR_MATCH_LEVELS[19].difficulty).toBe('EXPERT');
        });
    });

    describe('2. Level Challenge Fetcher', () => {
        test('returns valid level challenge for each of the 20 levels', () => {
            for (let i = 1; i <= 20; i++) {
                const q = getLevelChallenge(i);
                expect(q).toBeDefined();
                expect(q.level).toBe(i);
                expect(typeof q.word).toBe('string');
                expect(typeof q.inkColorName).toBe('string');
                expect(typeof q.inkColorHex).toBe('string');
                expect(typeof q.isMatch).toBe('boolean');
                expect(q.isMatch).toBe(q.word === q.inkColorName);
            }
        });
    });
});

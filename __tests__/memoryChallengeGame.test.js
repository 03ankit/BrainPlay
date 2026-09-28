import { MEMORY_CHALLENGE_LEVELS, getLevelChallenge } from '../src/data/memoryChallengeQuestions';

describe('Memory Challenge Game Data & Logic', () => {
    test('MEMORY_CHALLENGE_LEVELS has 20 configured levels', () => {
        expect(MEMORY_CHALLENGE_LEVELS.length).toBe(20);

        MEMORY_CHALLENGE_LEVELS.forEach((level, index) => {
            expect(level.level_number).toBe(index + 1);
            expect(level.cards).toBeDefined();
            expect(Array.isArray(level.cards)).toBe(true);
            expect(level.cards.length).toBeGreaterThanOrEqual(level.pairs || 8);
            expect(level.timeLimit).toBeGreaterThan(0);
            expect(level.lives).toBeGreaterThan(0);
            expect(level.previewTime).toBeGreaterThan(0);
        });
    });

    test('getLevelChallenge returns valid level config for levels 1 to 20', () => {
        for (let lvl = 1; lvl <= 20; lvl++) {
            const config = getLevelChallenge(lvl);
            expect(config).toBeDefined();
            expect(config.level_number).toBe(lvl);
            expect(config.cards.length).toBeGreaterThanOrEqual(config.pairs || 2);
        }
    });

    test('deck generator creates correct number of paired cards', () => {
        const lvl1 = getLevelChallenge(1);
        const pairs = lvl1.pairs || 8;
        const selected = lvl1.cards.slice(0, pairs);
        const deck = [];

        selected.forEach((emoji, idx) => {
            deck.push({ id: `${idx}_A`, emoji });
            deck.push({ id: `${idx}_B`, emoji });
        });

        expect(deck.length).toBe(pairs * 2);
        
        // Ensure each emoji appears exactly twice
        const counts = {};
        deck.forEach(c => {
            counts[c.emoji] = (counts[c.emoji] || 0) + 1;
        });

        Object.values(counts).forEach(count => {
            expect(count).toBe(2);
        });
    });
});

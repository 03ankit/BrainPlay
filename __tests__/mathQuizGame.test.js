import { MATH_QUIZ_LEVELS, getLevelChallenge } from '../src/data/mathQuizData';

describe('Math Quiz Game Data & Logic (1 Level = 1 Question)', () => {
    test('MATH_QUIZ_LEVELS has 20 configured levels with valid 4 options and correct answers', () => {
        expect(MATH_QUIZ_LEVELS.length).toBe(20);

        MATH_QUIZ_LEVELS.forEach((challenge, index) => {
            expect(challenge.level).toBe(index + 1);
            expect(challenge.expression).toBeDefined();
            expect(challenge.options.length).toBe(4);
            expect(challenge.options).toContain(challenge.correctAnswer);
            expect(challenge.timeLimitSeconds).toBeGreaterThan(0);
        });
    });

    test('getLevelChallenge returns correct challenge for any level number', () => {
        for (let lvl = 1; lvl <= 20; lvl++) {
            const ch = getLevelChallenge(lvl);
            expect(ch.level).toBe(lvl);
            expect(ch.options.length).toBe(4);
            expect(ch.options).toContain(ch.correctAnswer);
        }
    });
});

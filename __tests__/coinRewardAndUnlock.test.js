import progressRepository, { getCoinRewardForStars } from '../src/database/repositories/progressRepository';
import { executeSql } from '../src/database/database';

jest.mock('../src/database/database', () => ({
    executeSql: jest.fn(),
}));

describe('Coin Reward and Level Unlock Mechanism', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Coin Rewards for Stars', () => {
        test('3 stars awards 100 coins', () => {
            expect(getCoinRewardForStars(3)).toBe(100);
            expect(getCoinRewardForStars('3')).toBe(100);
        });

        test('2 stars awards 50 coins', () => {
            expect(getCoinRewardForStars(2)).toBe(50);
            expect(getCoinRewardForStars('2')).toBe(50);
        });

        test('1 star awards 10 coins', () => {
            expect(getCoinRewardForStars(1)).toBe(10);
            expect(getCoinRewardForStars('1')).toBe(10);
        });

        test('0 stars or invalid awards 0 coins', () => {
            expect(getCoinRewardForStars(0)).toBe(0);
            expect(getCoinRewardForStars(null)).toBe(0);
            expect(getCoinRewardForStars(undefined)).toBe(0);
        });
    });

    describe('Level Unlocking with 300 Coins', () => {
        test('rejects unlock when player has less than 300 coins', async () => {
            executeSql.mockResolvedValueOnce({
                rows: {
                    length: 1,
                    item: () => ({ coins: 150 }),
                },
            });

            const result = await progressRepository.unlockLevelWithCoins({
                profileId: 'local_player',
                gameId: '1',
                levelNumber: 6,
                cost: 300,
            });

            expect(result.success).toBe(false);
            expect(result.reason).toBe('insufficient_coins');
            expect(result.currentCoins).toBe(150);
            expect(result.requiredCoins).toBe(300);
        });

        test('successfully unlocks level when player has >= 300 coins', async () => {
            executeSql
                // 1. Fetch coins
                .mockResolvedValueOnce({
                    rows: {
                        length: 1,
                        item: () => ({ coins: 400 }),
                    },
                })
                // 2. Deduct coins UPDATE
                .mockResolvedValueOnce({ rowsAffected: 1 })
                // 3. Insert into unlocked_levels
                .mockResolvedValueOnce({ rowsAffected: 1 });

            const result = await progressRepository.unlockLevelWithCoins({
                profileId: 'local_player',
                gameId: '1',
                levelNumber: 6,
                cost: 300,
            });

            expect(result.success).toBe(true);
            expect(result.levelNumber).toBe(6);
            expect(result.deductedCoins).toBe(300);
            expect(result.remainingCoins).toBe(100);

            // Verify executeSql called for deduction
            expect(executeSql).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE profiles SET coins = MAX(0, coins - ?)'),
                [300, 'local_player']
            );

            // Verify executeSql called for inserting unlock
            expect(executeSql).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO unlocked_levels'),
                ['unlock_local_player_1_6', 'local_player', '1', 6]
            );
        });

        test('fetches unlocked levels correctly', async () => {
            executeSql.mockResolvedValueOnce({
                rows: {
                    length: 2,
                    item: (idx) => (idx === 0 ? { level_number: 6 } : { level_number: 7 }),
                },
            });

            const unlocked = await progressRepository.getUnlockedLevels('local_player', '1');
            expect(unlocked).toEqual([6, 7]);
        });
    });
});

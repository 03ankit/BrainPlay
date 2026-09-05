import {
    OTP_PACMAN_TIMINGS,
    OTP_PACMAN_COLORS,
    buildPacmanProgram,
    buildReducedMotionProgram,
    canPlayPacmanAnimation,
    getPacmanDiameter,
    mouthAngleAtLoopProgress,
    boxEatScaleAt,
    getBoxCenter,
    getRowCenter,
    createParticleSeeds,
} from '../src/components/OtpInputBox';
import colors from '../src/constants/colour';

describe('OTP Pac-Man Sequence & Math Unit Tests', () => {
    describe('1. Timing Constants', () => {
        test('all timing constants match the specification table', () => {
            expect(OTP_PACMAN_TIMINGS.START_DELAY_MS).toBe(180);
            expect(OTP_PACMAN_TIMINGS.MOVE_MS).toBe(280);
            expect(OTP_PACMAN_TIMINGS.CHOMP_HOLD_MS).toBe(90);
            expect(OTP_PACMAN_TIMINGS.POST_EAT_MS).toBe(60);
            expect(OTP_PACMAN_TIMINGS.PACMAN_HOLD_MS).toBe(200);
            expect(OTP_PACMAN_TIMINGS.SUCCESS_HOLD_MS).toBe(700);
            expect(OTP_PACMAN_TIMINGS.BOX_EAT_MS).toBe(220);
            expect(OTP_PACMAN_TIMINGS.CHOMP_LOOP_MS).toBe(300);
            expect(OTP_PACMAN_TIMINGS.CIRCLE_IN_MS).toBe(380);
            expect(OTP_PACMAN_TIMINGS.CENTER_MOVE_EXTRA_MS).toBe(30);
            expect(OTP_PACMAN_TIMINGS.REDUCED_MOTION_HOLD_MS).toBe(400);
        });
    });

    describe('2. Brand UI Colors', () => {
        test('uses BrainPlay UI color scheme instead of external lime/yellow', () => {
            expect(OTP_PACMAN_COLORS.pacmanMain).toBe(colors.primary);
            expect(OTP_PACMAN_COLORS.successMain).toBe(colors.green);
            expect(OTP_PACMAN_COLORS.check).toBe('#FFFFFF');
            expect(OTP_PACMAN_COLORS.particleA).toBe(colors.primary);
            expect(OTP_PACMAN_COLORS.glow).toContain('rgba');
        });
    });

    describe('3. Program Steps Builder', () => {
        test('builds full left-to-right eating program for 6 digits', () => {
            const program = buildPacmanProgram(6);
            expect(program[0]).toEqual({ type: 'spawnAtBox', index: 0 });
            expect(program[1]).toEqual({ type: 'scaleIn', duration: 380 });

            // Check eat steps for each box 0..5
            for (let i = 0; i < 6; i++) {
                const baseIdx = 2 + i * 4;
                expect(program[baseIdx]).toEqual({ type: 'moveToBox', index: i, duration: 280 });
                expect(program[baseIdx + 1]).toEqual({ type: 'wait', duration: 90 });
                expect(program[baseIdx + 2]).toEqual({ type: 'eatBox', index: i, duration: 220 });
                expect(program[baseIdx + 3]).toEqual({ type: 'wait', duration: 60 });
            }

            // Closes mouth and moves to center
            const postEatIdx = 2 + 6 * 4;
            expect(program[postEatIdx]).toEqual({ type: 'closeMouth' });
            expect(program[postEatIdx + 1]).toEqual({ type: 'moveToRowCenter', duration: 310 });
            expect(program[postEatIdx + 2]).toEqual({ type: 'wait', duration: 200 });
            expect(program[postEatIdx + 3]).toEqual({ type: 'playSuccessEffects' });
            expect(program[postEatIdx + 4]).toEqual({ type: 'wait', duration: 700 });
            expect(program[postEatIdx + 5]).toEqual({ type: 'complete' });
        });

        test('builds reduced-motion program', () => {
            const reduced = buildReducedMotionProgram();
            expect(reduced).toEqual([
                { type: 'hideAllBoxes' },
                { type: 'showSuccessCheck' },
                { type: 'wait', duration: 400 },
                { type: 'complete' },
            ]);
        });
    });

    describe('4. Layout Measurement Validator', () => {
        test('accepts valid layouts matching cellCount', () => {
            const valid = [
                { x: 0, y: 0, width: 46, height: 54 },
                { x: 50, y: 0, width: 46, height: 54 },
                { x: 100, y: 0, width: 46, height: 54 },
                { x: 150, y: 0, width: 46, height: 54 },
            ];
            expect(canPlayPacmanAnimation(valid, 4)).toBe(true);
        });

        test('rejects layouts with missing cells, zero sizes, or non-finite coords', () => {
            expect(canPlayPacmanAnimation(null, 4)).toBe(false);
            expect(canPlayPacmanAnimation([], 4)).toBe(false);
            expect(canPlayPacmanAnimation([{ x: 0, y: 0, width: 0, height: 54 }], 1)).toBe(false);
            expect(canPlayPacmanAnimation([{ x: NaN, y: 0, width: 46, height: 54 }], 1)).toBe(false);
            expect(canPlayPacmanAnimation([{ x: 0, y: 0, width: 46, height: 54 }], 2)).toBe(false);
        });
    });

    describe('5. Curves & Geometry Helpers', () => {
        test('getPacmanDiameter returns ~1.12x of box width', () => {
            expect(getPacmanDiameter(50)).toBe(56);
        });

        test('mouthAngleAtLoopProgress follows 0° -> 64° -> 30° -> 0° curve', () => {
            expect(mouthAngleAtLoopProgress(0)).toBe(0);
            expect(Math.round(mouthAngleAtLoopProgress(1 / 3))).toBe(64);
            expect(Math.round(mouthAngleAtLoopProgress(2 / 3))).toBe(30);
            expect(Math.round(mouthAngleAtLoopProgress(1))).toBe(0);
        });

        test('boxEatScaleAt scales 1 -> 0.72 -> 0', () => {
            expect(boxEatScaleAt(0)).toBe(1);
            expect(boxEatScaleAt(0.35)).toBeCloseTo(0.72, 2);
            expect(boxEatScaleAt(1)).toBe(0);
        });

        test('getBoxCenter calculates center accurately', () => {
            expect(getBoxCenter({ x: 20, y: 10, width: 40, height: 50 })).toEqual({
                x: 40,
                y: 35,
            });
        });

        test('getRowCenter calculates midpoint between first and last box', () => {
            const boxes = [
                { x: 0, y: 0, width: 40, height: 40 },
                { x: 50, y: 0, width: 40, height: 40 },
                { x: 100, y: 0, width: 40, height: 40 },
            ];
            // first center: (20, 20), last center: (120, 20) -> row center: (70, 20)
            expect(getRowCenter(boxes)).toEqual({ x: 70, y: 20 });
        });

        test('createParticleSeeds creates 22 configured radial burst seeds', () => {
            const seeds = createParticleSeeds(22);
            expect(seeds.length).toBe(22);
            expect(seeds[0]).toHaveProperty('dx');
            expect(seeds[0]).toHaveProperty('dy');
            expect(seeds[0]).toHaveProperty('color');
        });
    });
});

import React, {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from 'react';
import {
    AccessibilityInfo,
    Animated,
    Easing,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import colors from '../constants/colour';

// ============================================================================
// SECTION 1: TIMINGS & BRAND UI COLOR PALETTE
// ============================================================================

export const OTP_PACMAN_TIMINGS = {
    START_DELAY_MS: 180,
    CIRCLE_IN_MS: 380,
    MOVE_MS: 280,
    CHOMP_HOLD_MS: 90,
    BOX_EAT_MS: 220,
    POST_EAT_MS: 60,
    PACMAN_HOLD_MS: 200,
    HOLD_ROW_CENTER_MS: 200,
    SUCCESS_HOLD_MS: 700,
    FINALE_HOLD_MS: 700,
    CHOMP_LOOP_MS: 300,
    CENTER_MOVE_EXTRA_MS: 30,
    REDUCED_MOTION_HOLD_MS: 400,
    MORPH_MS: 280,
    RIPPLE_MS: 520,
    RIPPLE_RING_MS: 520,
    PARTICLE_BURST_MS: 560,
};

export const OTP_PACMAN_COLORS = {
    // BrainPlay UI Brand Indigo / Violet
    pacmanMain: colors.primary, // #4F46E5
    pacmanHighlight: colors.primaryLight || '#818CF8',
    pacmanMouth: '#3730A3',
    glow: 'rgba(79, 70, 229, 0.24)',

    // Success emerald green
    successMain: colors.green || '#10B981',
    successHighlight: '#34D399',
    successGlow: 'rgba(16, 185, 129, 0.35)',
    check: '#FFFFFF',
    particleA: colors.primary,
    particleB: colors.green || '#10B981',

    // Burst particles
    particleColors: [
        colors.primary,
        colors.primaryLight || '#818CF8',
        colors.green || '#10B981',
        '#34D399',
        '#6366F1',
    ],
};

const PACMAN_SCALE_RELATIVE_TO_BOX = 1.12;
const PACMAN_GLOW_SCALE = 1.45;

// ============================================================================
// SECTION 2: MATH, GEOMETRY & SEQUENCE BUILDER
// ============================================================================

export function getPacmanDiameter(boxWidth) {
    const w = typeof boxWidth === 'number' && boxWidth > 0 ? boxWidth : 46;
    return Math.round(w * PACMAN_SCALE_RELATIVE_TO_BOX);
}

export function mouthAngleAtLoopProgress(progress) {
    const p = Math.max(0, Math.min(1, progress));
    if (p <= 1 / 3) return (p / (1 / 3)) * 64;
    if (p <= 2 / 3) return 64 - ((p - 1 / 3) / (1 / 3)) * 34;
    const res = 30 - ((p - 2 / 3) / (1 / 3)) * 30;
    return res <= 0 ? 0 : res;
}

export function boxEatScaleAt(progress) {
    const p = Math.max(0, Math.min(1, progress));
    if (p <= 0.35) return 1 - (p / 0.35) * 0.28;
    return 0.72 * (1 - (p - 0.35) / 0.65);
}

export function canPlayPacmanAnimation(layouts, cellCount) {
    if (!Array.isArray(layouts) || layouts.length !== cellCount) {
        return false;
    }
    return layouts.every(
        (b) =>
            b &&
            typeof b.x === 'number' &&
            Number.isFinite(b.x) &&
            typeof b.y === 'number' &&
            Number.isFinite(b.y) &&
            typeof b.width === 'number' &&
            b.width > 0 &&
            typeof b.height === 'number' &&
            b.height > 0
    );
}

export function buildPacmanProgram(cellCount) {
    const program = [];
    program.push({ type: 'spawnAtBox', index: 0 });
    program.push({ type: 'scaleIn', duration: OTP_PACMAN_TIMINGS.CIRCLE_IN_MS });

    for (let i = 0; i < cellCount; i++) {
        program.push({
            type: 'moveToBox',
            index: i,
            duration: OTP_PACMAN_TIMINGS.MOVE_MS,
        });
        program.push({
            type: 'wait',
            duration: OTP_PACMAN_TIMINGS.CHOMP_HOLD_MS,
        });
        program.push({
            type: 'eatBox',
            index: i,
            duration: OTP_PACMAN_TIMINGS.BOX_EAT_MS,
        });
        program.push({
            type: 'wait',
            duration: OTP_PACMAN_TIMINGS.POST_EAT_MS,
        });
    }

    program.push({ type: 'closeMouth' });
    program.push({
        type: 'moveToRowCenter',
        duration: OTP_PACMAN_TIMINGS.MOVE_MS + OTP_PACMAN_TIMINGS.CENTER_MOVE_EXTRA_MS,
    });
    program.push({
        type: 'wait',
        duration: OTP_PACMAN_TIMINGS.HOLD_ROW_CENTER_MS,
    });
    program.push({
        type: 'playSuccessEffects',
    });
    program.push({
        type: 'wait',
        duration: OTP_PACMAN_TIMINGS.FINALE_HOLD_MS,
    });
    program.push({ type: 'complete' });

    return program;
}

export function buildReducedMotionProgram() {
    return [
        { type: 'hideAllBoxes' },
        { type: 'showSuccessCheck' },
        { type: 'wait', duration: OTP_PACMAN_TIMINGS.REDUCED_MOTION_HOLD_MS },
        { type: 'complete' },
    ];
}

export function getBoxCenter(box) {
    if (!box) return { x: 0, y: 0 };
    return {
        x: box.x + box.width / 2,
        y: box.y + box.height / 2,
    };
}

export function getRowCenter(boxes) {
    if (!boxes || boxes.length === 0) return { x: 0, y: 0 };
    const first = boxes[0];
    const last = boxes[boxes.length - 1];
    return {
        x: (first.x + last.x + last.width) / 2,
        y: first.y + first.height / 2,
    };
}

export function getRowOverflowPadding(cellWidth) {
    const pacmanSize = getPacmanDiameter(cellWidth);
    return Math.max(16, Math.ceil((pacmanSize - cellWidth) / 2 + 10));
}

export function createParticleSeeds(count = 22) {
    const seeds = [];
    const colorsList = OTP_PACMAN_COLORS.particleColors;
    for (let i = 0; i < count; i++) {
        const angle = (i / count) * 2 * Math.PI + (i % 2 === 0 ? 0.08 : -0.08);
        const distance = 42 + (i % 4) * 14;
        seeds.push({
            id: i,
            dx: Math.cos(angle) * distance,
            dy: Math.sin(angle) * distance,
            size: 4 + (i % 3) * 2,
            color: colorsList[i % colorsList.length],
        });
    }
    return seeds;
}

// ============================================================================
// SECTION 3: PAC-MAN CHARACTER (PURE RN ANIMATED)
// ============================================================================

function PacmanCharacter({
    size = 48,
    mouthDegrees,
    morph,
    check,
}) {
    const halfSize = size / 2;
    const glowSize = size * PACMAN_GLOW_SCALE;

    const topMouthRotate = mouthDegrees
        ? mouthDegrees.interpolate({
            inputRange: [0, 64],
            outputRange: ['0deg', '-36deg'],
        })
        : '0deg';

    const bottomMouthRotate = mouthDegrees
        ? mouthDegrees.interpolate({
            inputRange: [0, 64],
            outputRange: ['0deg', '36deg'],
        })
        : '0deg';

    const glowColor = morph
        ? morph.interpolate({
            inputRange: [0, 1],
            outputRange: [OTP_PACMAN_COLORS.glow, OTP_PACMAN_COLORS.successGlow],
        })
        : OTP_PACMAN_COLORS.glow;

    const successOpacity = morph || 0;
    const successScale = morph
        ? morph.interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1],
        })
        : 1;

    const checkScale = check
        ? check.interpolate({
            inputRange: [0, 1],
            outputRange: [0.4, 1],
        })
        : 1;

    const checkOpacity = check || 0;

    return (
        <View style={[styles.pacmanWrap, { width: size, height: size }]} pointerEvents="none">
            {/* Glow halo */}
            <Animated.View
                style={[
                    styles.glow,
                    {
                        width: glowSize,
                        height: glowSize,
                        borderRadius: glowSize / 2,
                        backgroundColor: glowColor,
                        transform: [
                            { translateX: -(glowSize - size) / 2 },
                            { translateY: -(glowSize - size) / 2 },
                        ],
                    },
                ]}
            />

            {/* Pac-Man Body (Brand UI Color) */}
            <View
                style={[
                    styles.pacmanBody,
                    {
                        width: size,
                        height: size,
                        borderRadius: halfSize,
                        backgroundColor: OTP_PACMAN_COLORS.pacmanMain,
                    },
                ]}
            >
                {/* Highlight curve */}
                <View
                    style={[
                        styles.pacmanHighlight,
                        {
                            width: size * 0.7,
                            height: size * 0.7,
                            borderRadius: (size * 0.7) / 2,
                            backgroundColor: OTP_PACMAN_COLORS.pacmanHighlight,
                        },
                    ]}
                />

                {/* Eye */}
                <View
                    style={[
                        styles.pacmanEye,
                        {
                            top: size * 0.2,
                            left: size * 0.42,
                            width: Math.max(4, size * 0.12),
                            height: Math.max(4, size * 0.12),
                            borderRadius: Math.max(2, (size * 0.12) / 2),
                        },
                    ]}
                />

                {/* Top mouth wedge */}
                <Animated.View
                    style={[
                        styles.mouthWedge,
                        styles.topWedge,
                        {
                            width: halfSize + 2,
                            height: halfSize + 1,
                            borderBottomLeftRadius: halfSize,
                            transform: [{ rotate: topMouthRotate }],
                        },
                    ]}
                />

                {/* Bottom mouth wedge */}
                <Animated.View
                    style={[
                        styles.mouthWedge,
                        styles.bottomWedge,
                        {
                            width: halfSize + 2,
                            height: halfSize + 1,
                            borderTopLeftRadius: halfSize,
                            transform: [{ rotate: bottomMouthRotate }],
                        },
                    ]}
                />
            </View>

            {/* Green Success Morph Layer */}
            <Animated.View
                style={[
                    styles.successCircle,
                    {
                        width: size,
                        height: size,
                        borderRadius: halfSize,
                        backgroundColor: OTP_PACMAN_COLORS.successMain,
                        opacity: successOpacity,
                        transform: [{ scale: successScale }],
                    },
                ]}
            >
                <View
                    style={[
                        styles.successHighlight,
                        {
                            width: size * 0.75,
                            height: size * 0.75,
                            borderRadius: (size * 0.75) / 2,
                            backgroundColor: OTP_PACMAN_COLORS.successHighlight,
                        },
                    ]}
                />
            </Animated.View>

            {/* White Checkmark */}
            <Animated.View
                style={[
                    styles.checkContainer,
                    {
                        width: size,
                        height: size,
                        opacity: checkOpacity,
                        transform: [{ scale: checkScale }],
                    },
                ]}
            >
                <View style={[styles.checkMarkWrap, { width: size * 0.5, height: size * 0.35 }]}>
                    <View
                        style={[
                            styles.checkStemShort,
                            {
                                width: Math.max(3, size * 0.08),
                                height: size * 0.22,
                                borderRadius: size * 0.04,
                            },
                        ]}
                    />
                    <View
                        style={[
                            styles.checkStemLong,
                            {
                                width: Math.max(3, size * 0.08),
                                height: size * 0.42,
                                borderRadius: size * 0.04,
                            },
                        ]}
                    />
                </View>
            </Animated.View>
        </View>
    );
}

// ============================================================================
// SECTION 4: OVERLAY & SEQUENCER (BURST, RIPPLE, MOUTH LOOP)
// ============================================================================

function OtpPacmanOverlay({
    boxes = [],
    reducedMotion = false,
    onEatBox,
    onHideAllBoxes,
    onComplete,
}) {
    const boxWidth = boxes[0]?.width || 46;
    const pacmanSize = getPacmanDiameter(boxWidth);
    const particleSeeds = useRef(createParticleSeeds(22)).current;

    const posX = useRef(new Animated.Value(0)).current;
    const posY = useRef(new Animated.Value(0)).current;
    const scale = useRef(new Animated.Value(0.5)).current;
    const visible = useRef(new Animated.Value(0)).current;

    const mouthDegrees = useRef(new Animated.Value(0)).current;
    const mouthLoopRef = useRef(null);

    const morph = useRef(new Animated.Value(0)).current;
    const check = useRef(new Animated.Value(0)).current;

    const rippleScale = useRef(new Animated.Value(1)).current;
    const rippleOpacity = useRef(new Animated.Value(0)).current;
    const burstProgress = useRef(new Animated.Value(0)).current;

    const completedRef = useRef(false);
    const timersRef = useRef([]);

    const addTimer = (fn, delay) => {
        const t = setTimeout(fn, delay);
        timersRef.current.push(t);
        return t;
    };

    const clearAllTimers = () => {
        timersRef.current.forEach((t) => clearTimeout(t));
        timersRef.current = [];
        if (mouthLoopRef.current) {
            mouthLoopRef.current.stop();
            mouthLoopRef.current = null;
        }
    };

    const finish = () => {
        if (completedRef.current) return;
        completedRef.current = true;
        clearAllTimers();
        onComplete?.();
    };

    const startMouthLoop = () => {
        if (mouthLoopRef.current) mouthLoopRef.current.stop();
        mouthDegrees.setValue(0);
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(mouthDegrees, {
                    toValue: 64,
                    duration: 100,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(mouthDegrees, {
                    toValue: 30,
                    duration: 100,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
                Animated.timing(mouthDegrees, {
                    toValue: 0,
                    duration: 100,
                    easing: Easing.linear,
                    useNativeDriver: false,
                }),
            ])
        );
        mouthLoopRef.current = loop;
        loop.start();
    };

    const stopMouth = () => {
        if (mouthLoopRef.current) {
            mouthLoopRef.current.stop();
            mouthLoopRef.current = null;
        }
        Animated.timing(mouthDegrees, {
            toValue: 0,
            duration: 60,
            easing: Easing.linear,
            useNativeDriver: false,
        }).start();
    };

    useEffect(() => {
        completedRef.current = false;
        if (!boxes || boxes.length === 0) {
            finish();
            return () => clearAllTimers();
        }

        const rowCenter = getRowCenter(boxes);

        if (reducedMotion) {
            const reducedProgram = buildReducedMotionProgram();
            posX.setValue(rowCenter.x - pacmanSize / 2);
            posY.setValue(rowCenter.y - pacmanSize / 2);
            visible.setValue(1);
            scale.setValue(1);
            morph.setValue(1);
            check.setValue(1);

            let elapsed = 0;
            reducedProgram.forEach((step) => {
                if (step.type === 'hideAllBoxes') {
                    onHideAllBoxes?.();
                } else if (step.type === 'wait') {
                    elapsed += step.duration;
                } else if (step.type === 'complete') {
                    addTimer(() => finish(), elapsed);
                }
            });

            return () => clearAllTimers();
        }

        const program = buildPacmanProgram(boxes.length);

        const executeStep = (stepIdx) => {
            if (completedRef.current || stepIdx >= program.length) return;
            const step = program[stepIdx];

            switch (step.type) {
                case 'spawnAtBox': {
                    const center = getBoxCenter(boxes[step.index]);
                    posX.setValue(center.x - pacmanSize / 2);
                    posY.setValue(center.y - pacmanSize / 2);
                    visible.setValue(1);
                    startMouthLoop();
                    executeStep(stepIdx + 1);
                    break;
                }

                case 'scaleIn': {
                    Animated.spring(scale, {
                        toValue: 1,
                        friction: 6,
                        tension: 50,
                        useNativeDriver: false,
                    }).start(() => executeStep(stepIdx + 1));
                    break;
                }

                case 'moveToBox': {
                    const center = getBoxCenter(boxes[step.index]);
                    const targetX = center.x - pacmanSize / 2;
                    const targetY = center.y - pacmanSize / 2;

                    Animated.parallel([
                        Animated.timing(posX, {
                            toValue: targetX,
                            duration: step.duration,
                            easing: Easing.bezier(0.4, 0, 0.2, 1),
                            useNativeDriver: false,
                        }),
                        Animated.timing(posY, {
                            toValue: targetY,
                            duration: step.duration,
                            easing: Easing.bezier(0.4, 0, 0.2, 1),
                            useNativeDriver: false,
                        }),
                    ]).start(() => executeStep(stepIdx + 1));
                    break;
                }

                case 'eatBox': {
                    onEatBox?.(step.index);
                    addTimer(() => executeStep(stepIdx + 1), step.duration);
                    break;
                }

                case 'closeMouth': {
                    stopMouth();
                    executeStep(stepIdx + 1);
                    break;
                }

                case 'moveToRowCenter': {
                    Animated.parallel([
                        Animated.timing(posX, {
                            toValue: rowCenter.x - pacmanSize / 2,
                            duration: step.duration,
                            easing: Easing.bezier(0.4, 0, 0.2, 1),
                            useNativeDriver: false,
                        }),
                        Animated.timing(posY, {
                            toValue: rowCenter.y - pacmanSize / 2,
                            duration: step.duration,
                            easing: Easing.bezier(0.4, 0, 0.2, 1),
                            useNativeDriver: false,
                        }),
                    ]).start(() => executeStep(stepIdx + 1));
                    break;
                }

                case 'playSuccessEffects': {
                    Animated.timing(morph, {
                        toValue: 1,
                        duration: OTP_PACMAN_TIMINGS.MORPH_MS,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: false,
                    }).start();

                    Animated.timing(check, {
                        toValue: 1,
                        duration: 220,
                        delay: 60,
                        easing: Easing.out(Easing.back(1.5)),
                        useNativeDriver: false,
                    }).start();

                    rippleScale.setValue(1);
                    rippleOpacity.setValue(0.7);
                    Animated.parallel([
                        Animated.timing(rippleScale, {
                            toValue: 2.1,
                            duration: 520,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: false,
                        }),
                        Animated.timing(rippleOpacity, {
                            toValue: 0,
                            duration: 520,
                            easing: Easing.out(Easing.cubic),
                            useNativeDriver: false,
                        }),
                    ]).start();

                    burstProgress.setValue(0);
                    Animated.timing(burstProgress, {
                        toValue: 1,
                        duration: 560,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: false,
                    }).start();

                    executeStep(stepIdx + 1);
                    break;
                }

                case 'wait': {
                    addTimer(() => executeStep(stepIdx + 1), step.duration);
                    break;
                }

                case 'complete': {
                    finish();
                    break;
                }

                default:
                    executeStep(stepIdx + 1);
            }
        };

        addTimer(() => {
            executeStep(0);
        }, OTP_PACMAN_TIMINGS.START_DELAY_MS);

        const safety = setTimeout(() => {
            if (!completedRef.current) finish();
        }, 8000);

        return () => {
            clearTimeout(safety);
            clearAllTimers();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [boxes, reducedMotion]);

    const rowCenter = getRowCenter(boxes);

    return (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
            {/* Ripple ring */}
            <Animated.View
                style={[
                    styles.ripple,
                    {
                        left: rowCenter.x - pacmanSize / 2,
                        top: rowCenter.y - pacmanSize / 2,
                        width: pacmanSize,
                        height: pacmanSize,
                        borderRadius: pacmanSize / 2,
                        opacity: rippleOpacity,
                        transform: [{ scale: rippleScale }],
                    },
                ]}
            />

            {/* Particle burst */}
            <View
                style={[
                    styles.particleAnchor,
                    {
                        left: rowCenter.x,
                        top: rowCenter.y,
                    },
                ]}
            >
                {particleSeeds.map((p) => {
                    const pX = burstProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, p.dx],
                    });
                    const pY = burstProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, p.dy],
                    });
                    const pOpacity = burstProgress.interpolate({
                        inputRange: [0, 0.7, 1],
                        outputRange: [1, 0.8, 0],
                    });
                    const pScale = burstProgress.interpolate({
                        inputRange: [0, 0.3, 1],
                        outputRange: [0.6, 1.2, 0.2],
                    });

                    return (
                        <Animated.View
                            key={`p-${p.id}`}
                            style={[
                                styles.particle,
                                {
                                    width: p.size,
                                    height: p.size,
                                    borderRadius: p.size / 2,
                                    backgroundColor: p.color,
                                    opacity: pOpacity,
                                    transform: [
                                        { translateX: pX },
                                        { translateY: pY },
                                        { scale: pScale },
                                    ],
                                },
                            ]}
                        />
                    );
                })}
            </View>

            {/* Moving character */}
            <Animated.View
                style={[
                    styles.characterWrap,
                    {
                        width: pacmanSize,
                        height: pacmanSize,
                        opacity: visible,
                        transform: [
                            { translateX: posX },
                            { translateY: posY },
                            { scale: scale },
                        ],
                    },
                ]}
            >
                <PacmanCharacter
                    size={pacmanSize}
                    mouthDegrees={mouthDegrees}
                    morph={morph}
                    check={check}
                />
            </Animated.View>
        </View>
    );
}

// ============================================================================
// SECTION 5: MASTER OTP INPUT BOX COMPONENT
// ============================================================================

const OtpInputBox = forwardRef(function OtpInputBox(
    {
        value = '',
        setValue,
        cellCount = 6,
        cellWidth = 46,
        cellHeight = 56,
        locked = false,
        error = false,
        autoFocus = true,
        onFilled,
    },
    ref
) {
    const inputRef = useRef(null);
    const rowRef = useRef(null);
    const cellRefs = useRef([]);
    const layoutFallbackRef = useRef([]);

    const [playing, setPlaying] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [boxes, setBoxes] = useState([]);
    const [isFocusedInput, setIsFocusedInput] = useState(false);

    const boxScales = useRef(
        Array.from({ length: cellCount }, () => new Animated.Value(1))
    ).current;
    const boxOpacities = useRef(
        Array.from({ length: cellCount }, () => new Animated.Value(1))
    ).current;

    const onCompleteRef = useRef(null);
    const isPlayingRef = useRef(false);
    const mountedRef = useRef(true);
    const safetyTimerRef = useRef(null);

    const triggerFocus = useCallback(() => {
        if (inputRef.current) {
            inputRef.current.blur();
            setTimeout(() => {
                if (mountedRef.current && inputRef.current) {
                    inputRef.current.focus();
                }
            }, 50);
        }
    }, []);

    useEffect(() => {
        mountedRef.current = true;
        let timer;
        if (autoFocus && !locked && !playing) {
            timer = setTimeout(() => {
                if (mountedRef.current) {
                    triggerFocus();
                }
            }, 150);
        }

        const keyboardDidHideSubscription = Keyboard.addListener(
            'keyboardDidHide',
            () => {
                if (mountedRef.current) {
                    setIsFocusedInput(false);
                    inputRef.current?.blur();
                }
            }
        );

        return () => {
            mountedRef.current = false;
            if (timer) clearTimeout(timer);
            if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
            keyboardDidHideSubscription.remove();
        };
    }, [autoFocus, locked, playing, triggerFocus]);

    const resetAnimation = useCallback(() => {
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        isPlayingRef.current = false;
        onCompleteRef.current = null;
        boxScales.forEach((s) => s.setValue(1));
        boxOpacities.forEach((o) => o.setValue(1));
        setPlaying(false);
        setReducedMotion(false);
        setBoxes([]);
    }, [boxScales, boxOpacities]);

    const handleEatBox = useCallback(
        (index) => {
            if (index < 0 || index >= cellCount) return;

            Animated.parallel([
                Animated.sequence([
                    Animated.timing(boxScales[index], {
                        toValue: 0.72,
                        duration: 77,
                        easing: Easing.bezier(0.32, 0.72, 0.2, 1),
                        useNativeDriver: true,
                    }),
                    Animated.timing(boxScales[index], {
                        toValue: 0,
                        duration: 143,
                        easing: Easing.bezier(0.32, 0.72, 0.2, 1),
                        useNativeDriver: true,
                    }),
                ]),
                Animated.timing(boxOpacities[index], {
                    toValue: 0,
                    duration: 220,
                    easing: Easing.bezier(0.32, 0.72, 0.2, 1),
                    useNativeDriver: true,
                }),
            ]).start();
        },
        [cellCount, boxScales, boxOpacities]
    );

    const handleHideAllBoxes = useCallback(() => {
        boxScales.forEach((s) => s.setValue(0));
        boxOpacities.forEach((o) => o.setValue(0));
    }, [boxScales, boxOpacities]);

    const handleComplete = useCallback(() => {
        if (safetyTimerRef.current) clearTimeout(safetyTimerRef.current);
        const callback = onCompleteRef.current;
        onCompleteRef.current = null;
        if (mountedRef.current && callback) {
            callback();
        }
    }, []);

    useImperativeHandle(ref, () => ({
        playSuccessAnimation: async (options = {}) => {
            if (isPlayingRef.current) return;
            isPlayingRef.current = true;
            onCompleteRef.current = options?.onComplete || null;

            Keyboard.dismiss();
            await new Promise((r) => setTimeout(r, 40));

            let isReduceMotion = false;
            try {
                isReduceMotion = await AccessibilityInfo.isReduceMotionEnabled();
            } catch {
                isReduceMotion = false;
            }

            const measureCells = () =>
                new Promise((resolve) => {
                    if (!rowRef.current) {
                        resolve(null);
                        return;
                    }

                    rowRef.current.measureInWindow((rowX, rowY) => {
                        if (rowX === undefined || rowY === undefined) {
                            resolve(null);
                            return;
                        }

                        const measured = [];
                        let pending = cellCount;

                        for (let i = 0; i < cellCount; i++) {
                            const cell = cellRefs.current[i];
                            if (!cell) {
                                pending--;
                                if (pending === 0) resolve(measured);
                                continue;
                            }

                            cell.measureInWindow((cx, cy, cw, ch) => {
                                if (cx !== undefined && cy !== undefined && cw > 0 && ch > 0) {
                                    measured[i] = {
                                        x: cx - rowX,
                                        y: cy - rowY,
                                        width: cw,
                                        height: ch,
                                    };
                                }
                                pending--;
                                if (pending === 0) resolve(measured);
                            });
                        }

                        setTimeout(() => resolve(measured), 80);
                    });
                });

            let measuredLayouts = await measureCells();

            if (!canPlayPacmanAnimation(measuredLayouts, cellCount)) {
                if (canPlayPacmanAnimation(layoutFallbackRef.current, cellCount)) {
                    measuredLayouts = layoutFallbackRef.current;
                }
            }

            safetyTimerRef.current = setTimeout(() => {
                if (mountedRef.current && isPlayingRef.current) {
                    handleComplete();
                }
            }, 8000);

            if (canPlayPacmanAnimation(measuredLayouts, cellCount)) {
                setBoxes(measuredLayouts);
                setReducedMotion(isReduceMotion);
                setPlaying(true);
            } else {
                if (isReduceMotion) {
                    setReducedMotion(true);
                    setPlaying(true);
                } else {
                    handleComplete();
                }
            }
        },
        resetAnimation,
        focus: triggerFocus,
        blur: () => {
            setIsFocusedInput(false);
            inputRef.current?.blur();
        },
        clear: () => setValue?.(''),
    }));

    const isInputLocked = locked || playing;
    const overflowPadding = getRowOverflowPadding(cellWidth);

    const handleTextChange = (text) => {
        if (isInputLocked) return;
        const cleaned = text.replace(/[^0-9]/g, '').slice(0, cellCount);
        setValue?.(cleaned);
        if (cleaned.length === cellCount) {
            onFilled?.(cleaned);
        }
    };

    return (
        <View
            style={[
                styles.wrapper,
                {
                    paddingVertical: overflowPadding,
                    paddingHorizontal: overflowPadding / 2,
                },
            ]}
        >
            {/* Visual OTP Box Row */}
            <Pressable
                ref={rowRef}
                collapsable={false}
                style={styles.row}
                onPress={() => {
                    if (!isInputLocked) {
                        triggerFocus();
                    }
                }}
            >
                {Array.from({ length: cellCount }).map((_, index) => {
                    const digit = value[index] || '';
                    const isFocused = isFocusedInput && value.length === index && !isInputLocked;
                    const isFilled = digit.length > 0;

                    return (
                        <View
                            key={`cell-slot-${index}`}
                            ref={(el) => (cellRefs.current[index] = el)}
                            collapsable={false}
                            onLayout={(e) => {
                                layoutFallbackRef.current[index] = {
                                    x: e.nativeEvent.layout.x,
                                    y: e.nativeEvent.layout.y,
                                    width: e.nativeEvent.layout.width,
                                    height: e.nativeEvent.layout.height,
                                };
                            }}
                            style={[
                                styles.slot,
                                {
                                    width: cellWidth,
                                    height: cellHeight,
                                },
                            ]}
                        >
                            <Animated.View
                                style={[
                                    styles.boxFill,
                                    {
                                        transform: [{ scale: boxScales[index] }],
                                        opacity: boxOpacities[index],
                                    },
                                    isFilled && styles.boxFilled,
                                    isFocused && styles.boxFocused,
                                    error && styles.boxError,
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.digitText,
                                        error && styles.digitTextError,
                                    ]}
                                >
                                    {digit}
                                </Text>
                            </Animated.View>
                        </View>
                    );
                })}

                {/* Overlay mounts during playback */}
                {playing && (
                    <OtpPacmanOverlay
                        boxes={boxes}
                        reducedMotion={reducedMotion}
                        onEatBox={handleEatBox}
                        onHideAllBoxes={handleHideAllBoxes}
                        onComplete={handleComplete}
                    />
                )}
            </Pressable>

            {/* Overlaid master text input for native keyboard & touch focus */}
            {!playing && (
                <TextInput
                    ref={inputRef}
                    value={value}
                    onChangeText={handleTextChange}
                    maxLength={cellCount}
                    keyboardType="number-pad"
                    textContentType="oneTimeCode"
                    autoComplete="one-time-code"
                    importantForAutofill="yes"
                    editable={!isInputLocked}
                    caretHidden={true}
                    pointerEvents="none"
                    selection={{ start: value.length, end: value.length }}
                    onFocus={() => setIsFocusedInput(true)}
                    onBlur={() => setIsFocusedInput(false)}
                    style={[StyleSheet.absoluteFillObject, styles.hiddenInput]}
                />
            )}
        </View>
    );
});

export default OtpInputBox;

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    hiddenInput: {
        opacity: 0.01,
        color: 'transparent',
        backgroundColor: 'transparent',
        zIndex: 10,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        position: 'relative',
    },
    slot: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxFill: {
        width: '100%',
        height: '100%',
        borderRadius: 14,
        borderWidth: 1.5,
        borderColor: '#E2E8F0',
        backgroundColor: '#F8FAFC',
        justifyContent: 'center',
        alignItems: 'center',
    },
    boxFocused: {
        borderColor: colors.primary, // #4F46E5
        backgroundColor: colors.white,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25,
        shadowRadius: 6,
        elevation: 3,
    },
    boxFilled: {
        borderColor: '#CBD5E1',
        backgroundColor: colors.white,
    },
    boxError: {
        borderColor: '#EF4444',
        backgroundColor: '#FEF2F2',
    },
    digitText: {
        fontSize: 22,
        fontWeight: '700',
        color: '#0F172A',
    },
    digitTextError: {
        color: '#EF4444',
    },

    // Pacman character styles
    pacmanWrap: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    glow: {
        position: 'absolute',
        top: 0,
        left: 0,
        opacity: 0.8,
    },
    pacmanBody: {
        position: 'absolute',
        top: 0,
        left: 0,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: OTP_PACMAN_COLORS.pacmanMain,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 8,
        elevation: 6,
    },
    pacmanHighlight: {
        position: 'absolute',
        top: -4,
        left: -4,
        opacity: 0.25,
    },
    pacmanEye: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        zIndex: 10,
    },
    mouthWedge: {
        position: 'absolute',
        right: 0,
        backgroundColor: '#FFFFFF',
    },
    topWedge: {
        top: 0,
        transformOrigin: 'bottom left',
    },
    bottomWedge: {
        bottom: 0,
        transformOrigin: 'top left',
    },
    successCircle: {
        position: 'absolute',
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: OTP_PACMAN_COLORS.successMain,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
    },
    successHighlight: {
        position: 'absolute',
        top: -3,
        left: -3,
        opacity: 0.3,
    },
    checkContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 20,
    },
    checkMarkWrap: {
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    checkStemShort: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        bottom: 2,
        left: 2,
        transform: [{ rotate: '-45deg' }],
    },
    checkStemLong: {
        position: 'absolute',
        backgroundColor: '#FFFFFF',
        bottom: 2,
        left: 10,
        transform: [{ rotate: '45deg' }],
    },

    // Overlay styles
    characterWrap: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 50,
    },
    ripple: {
        position: 'absolute',
        borderWidth: 2.5,
        borderColor: OTP_PACMAN_COLORS.successMain,
        zIndex: 30,
    },
    particleAnchor: {
        position: 'absolute',
        width: 0,
        height: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 40,
    },
    particle: {
        position: 'absolute',
    },
});

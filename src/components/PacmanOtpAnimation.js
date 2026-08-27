import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    Easing,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import colors from '../constants/colour';
import fonts from '../constants/fonts';

const PACMAN_SIZE = 46;

/**
 * PacmanOtpSuccessAnimation
 *
 * KEY ARCHITECTURE DECISION:
 * When success animation starts, we SWAP the real OtpInput (which has library-internal
 * dots we cannot control) with a custom rendered row of fake OTP boxes.
 * Pac-Man then eats these fake boxes one-by-one (scale → 0, opacity → 0).
 * This guarantees: no stray dots, full position control, clean animation.
 *
 * State machine:
 *   idle          → user is typing. Render real OtpInput. No Pac-Man.
 *   verifying     → API call in progress. Render real OtpInput. No Pac-Man.
 *   successAnim   → API confirmed. Swap to fake boxes. Run Pac-Man eating sequence.
 *   verified      → All boxes eaten. Show ✓ badge.
 *   error         → Bad OTP. Shake + ✕. Render real OtpInput for retry.
 */
export function PacmanOtpSuccessAnimation({
    code = '',
    numberOfDigits = 6,
    status = 'idle',
    errorMessage = 'Incorrect OTP',
    successMessage = 'OTP Verified',
    cellHeight = 56,
    onAnimationComplete,
    children,
}) {
    // Layout of the fake-box row, measured via onLayout
    const [rowWidth, setRowWidth] = useState(0);
    const [rowHeight, setRowHeight] = useState(0);

    const isAnimatingRef = useRef(false);

    // Pac-Man movement & appearance
    const pacmanX = useRef(new Animated.Value(-PACMAN_SIZE)).current;
    const pacmanScale = useRef(new Animated.Value(0)).current;
    const mouthAnim = useRef(new Animated.Value(0)).current;

    // Container shake
    const shakeX = useRef(new Animated.Value(0)).current;

    // Result badge opacities
    const successAnim = useRef(new Animated.Value(0)).current;
    const failureAnim = useRef(new Animated.Value(0)).current;

    // Per-box animated values — OPACITY ONLY, no scale (prevents squeeze)
    const fakeBoxOpacities = useRef(
        Array.from({ length: numberOfDigits }, () => new Animated.Value(1))
    ).current;

    // Continuous mouth chomping loop
    useEffect(() => {
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(mouthAnim, { toValue: 1, duration: 110, easing: Easing.linear, useNativeDriver: true }),
                Animated.timing(mouthAnim, { toValue: 0, duration: 110, easing: Easing.linear, useNativeDriver: true }),
            ])
        );
        loop.start();
        return () => loop.stop();
    }, [mouthAnim]);

    // State machine handler
    useEffect(() => {
        if (status === 'idle' || status === 'verifying') {
            // Clean reset — Pac-Man hidden, all fake boxes visible
            isAnimatingRef.current = false;
            pacmanScale.setValue(0);
            pacmanX.setValue(-PACMAN_SIZE);
            successAnim.setValue(0);
            failureAnim.setValue(0);
            fakeBoxOpacities.forEach(o => o.setValue(1));
        } else if (status === 'successAnimation' && rowWidth > 0 && !isAnimatingRef.current) {
            isAnimatingRef.current = true;
            failureAnim.setValue(0);
            successAnim.setValue(0);

            // Reset fake boxes to fully visible
            fakeBoxOpacities.forEach(o => o.setValue(1));

            const cellW = rowWidth / numberOfDigits;
            // Start Pac-Man left of box 0
            pacmanX.setValue(-PACMAN_SIZE);
            pacmanScale.setValue(0);

            // Spawn Pac-Man
            Animated.spring(pacmanScale, {
                toValue: 1,
                friction: 6,
                tension: 50,
                useNativeDriver: true,
            }).start();

            const eatBox = (idx) => {
                if (idx >= numberOfDigits) {
                    // All boxes eaten → Pac-Man vanishes → ✓ badge
                    Animated.sequence([
                        Animated.timing(pacmanScale, {
                            toValue: 0, duration: 200, useNativeDriver: true,
                        }),
                        Animated.spring(successAnim, {
                            toValue: 1, friction: 5, tension: 40, useNativeDriver: true,
                        }),
                    ]).start(() => {
                        isAnimatingRef.current = false;
                        onAnimationComplete?.();
                    });
                    return;
                }

                // Center of box idx
                const targetX = (idx + 0.5) * cellW - PACMAN_SIZE / 2;

                // Glide to box
                Animated.timing(pacmanX, {
                    toValue: targetX,
                    duration: 220,
                    easing: Easing.out(Easing.quad),
                    useNativeDriver: true,
                }).start(() => {
                    // CHOMP: box fades out (no scale squeeze — keeps layout stable)
                    Animated.timing(fakeBoxOpacities[idx], {
                        toValue: 0, duration: 160, useNativeDriver: true,
                    }).start(() => {
                        setTimeout(() => eatBox(idx + 1), 40);
                    });
                });
            };

            // Small delay so Pac-Man renders before moving
            setTimeout(() => eatBox(0), 100);
        } else if (status === 'error') {
            isAnimatingRef.current = false;
            pacmanScale.setValue(0);
            successAnim.setValue(0);
            fakeBoxOpacities.forEach(o => o.setValue(1));

            // Shake
            Animated.sequence([
                Animated.timing(shakeX, { toValue: -14, duration: 45, useNativeDriver: true }),
                Animated.timing(shakeX, { toValue: 14, duration: 45, useNativeDriver: true }),
                Animated.timing(shakeX, { toValue: -10, duration: 45, useNativeDriver: true }),
                Animated.timing(shakeX, { toValue: 10, duration: 45, useNativeDriver: true }),
                Animated.timing(shakeX, { toValue: -6, duration: 45, useNativeDriver: true }),
                Animated.timing(shakeX, { toValue: 6, duration: 45, useNativeDriver: true }),
                Animated.timing(shakeX, { toValue: 0, duration: 45, useNativeDriver: true }),
            ]).start();

            Animated.spring(failureAnim, {
                toValue: 1, friction: 5, useNativeDriver: true,
            }).start();
        }
    }, [
        status, rowWidth, numberOfDigits,
        pacmanX, pacmanScale, fakeBoxOpacities,
        successAnim, failureAnim, shakeX, onAnimationComplete,
    ]);

    // Mouth interpolations
    const topMouthRotate = mouthAnim.interpolate({
        inputRange: [0, 1], outputRange: ['0deg', '-45deg'],
    });
    const bottomMouthRotate = mouthAnim.interpolate({
        inputRange: [0, 1], outputRange: ['0deg', '45deg'],
    });

    const isAnimationPhase = status === 'successAnimation' || status === 'verified';
    const boxH = cellHeight > 0 ? cellHeight : rowHeight || 56;
    const pacmanTop = (boxH - PACMAN_SIZE) / 2;

    // Digits to show in the fake boxes (from the captured code)
    const digits = Array.from({ length: numberOfDigits }, (_, i) => code[i] || '');

    return (
        <View style={styles.outer}>
            <Animated.View style={{ transform: [{ translateX: shakeX }] }}>

                {/* ── REAL OTP INPUT (shown while typing / error / verifying) ── */}
                {!isAnimationPhase && (
                    <View>{children}</View>
                )}

                {/* ── FAKE BOX ROW + PAC-MAN OVERLAY (shown during success animation) ── */}
                {isAnimationPhase && (
                    <View
                        style={styles.fakeRow}
                        onLayout={e => {
                            setRowWidth(e.nativeEvent.layout.width);
                            setRowHeight(e.nativeEvent.layout.height);
                        }}
                    >
                        {/* Fake animated boxes — Pac-Man eats these */}
                        {digits.map((digit, idx) => (
                            <Animated.View
                                key={`fake-box-${idx}`}
                                style={[
                                    styles.fakeBox,
                                    { height: boxH },
                                    { opacity: fakeBoxOpacities[idx] },
                                ]}
                            >
                                <Text style={styles.fakeBoxText}>{digit}</Text>
                            </Animated.View>
                        ))}

                        {/* Pac-Man slides across the fake row */}
                        {rowWidth > 0 && (
                            <Animated.View
                                style={[
                                    styles.pacmanWrapper,
                                    {
                                        top: pacmanTop,
                                        transform: [
                                            { translateX: pacmanX },
                                            { scale: pacmanScale },
                                        ],
                                    },
                                ]}
                                pointerEvents="none"
                            >
                                <View style={styles.pacmanBody}>
                                    <Animated.View
                                        style={[
                                            styles.mouthWedge,
                                            styles.topWedge,
                                            { transform: [{ rotate: topMouthRotate }] },
                                        ]}
                                    />
                                    <Animated.View
                                        style={[
                                            styles.mouthWedge,
                                            styles.bottomWedge,
                                            { transform: [{ rotate: bottomMouthRotate }] },
                                        ]}
                                    />
                                    <View style={styles.eye} />
                                </View>
                            </Animated.View>
                        )}

                        {/* ── SUCCESS ✓ tick — centered INSIDE the box row (same position as boxes) ── */}
                        <Animated.View
                            style={[
                                styles.successInRow,
                                { opacity: successAnim, transform: [{ scale: successAnim }] },
                            ]}
                            pointerEvents="none"
                        >
                            <View style={styles.bigCheckCircle}>
                                <Text style={styles.bigCheckText}>✓</Text>
                            </View>
                        </Animated.View>
                    </View>
                )}
            </Animated.View>

            {/* ── ERROR: centered ✕ + "Incorrect OTP" only ── */}
            {status === 'error' && (
                <Animated.View
                    style={[
                        styles.errorCenter,
                        { opacity: failureAnim, transform: [{ scale: failureAnim }] },
                    ]}
                >
                    <View style={styles.bigCrossCircle}>
                        <Text style={styles.bigCrossText}>✕</Text>
                    </View>
                    <Text style={styles.errorLabel}>{errorMessage}</Text>
                </Animated.View>
            )}
        </View>
    );
}

export default PacmanOtpSuccessAnimation;
export { PacmanOtpSuccessAnimation as PacmanOtpAnimation };

// ── Styles ─────────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
    outer: {
        width: '100%',
        alignItems: 'center',
    },

    // Fake box row
    fakeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        position: 'relative',
    },
    fakeBox: {
        flex: 1,
        marginHorizontal: 3,
        height: 56,
        borderRadius: 12,
        backgroundColor: colors.white,
        borderWidth: 1.5,
        borderColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    fakeBoxText: {
        fontSize: 20,
        fontFamily: fonts.bold,
        color: colors.darkGray,
    },

    // Pac-Man
    pacmanWrapper: {
        position: 'absolute',
        left: 0,
        width: PACMAN_SIZE,
        height: PACMAN_SIZE,
        zIndex: 50,
    },
    pacmanBody: {
        width: PACMAN_SIZE,
        height: PACMAN_SIZE,
        borderRadius: PACMAN_SIZE / 2,
        backgroundColor: '#FACC15',
        overflow: 'hidden',
        shadowColor: '#FACC15',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.7,
        shadowRadius: 8,
        elevation: 8,
    },
    mouthWedge: {
        position: 'absolute',
        right: 0,
        width: PACMAN_SIZE / 2 + 2,
        height: PACMAN_SIZE / 2,
        backgroundColor: colors.white,
    },
    topWedge: {
        top: 0,
        borderBottomLeftRadius: PACMAN_SIZE / 2,
    },
    bottomWedge: {
        bottom: 0,
        borderTopLeftRadius: PACMAN_SIZE / 2,
    },
    eye: {
        position: 'absolute',
        top: 8,
        left: 18,
        width: 7,
        height: 7,
        borderRadius: 3.5,
        backgroundColor: '#1E293B',
        zIndex: 60,
    },

    // Result displays — tick sits in the SAME SPOT as the OTP boxes
    successInRow: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 50,
    },
    bigCheckCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#10B981',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
    },
    bigCheckText: {
        color: '#FFFFFF',
        fontSize: 32,
        fontWeight: 'bold',
    },
    errorCenter: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 16,
    },
    bigCrossCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#EF4444',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#EF4444',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 6,
        marginBottom: 10,
    },
    bigCrossText: {
        color: '#FFFFFF',
        fontSize: 28,
        fontWeight: 'bold',
    },
    errorLabel: {
        color: '#EF4444',
        fontSize: 15,
        fontFamily: fonts.bold,
        marginTop: 2,
    },
});

import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

export default function GameTimer({ initialSeconds = 15, onTimeUp, questionId, isPaused = false, resetKey = 0 }) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const timerRef = useRef(null);
    const onTimeUpRef = useRef(onTimeUp);
    const hasCalledTimeUpRef = useRef(false);

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    // Reset countdown state when questionId, initialSeconds, or resetKey changes
    useEffect(() => {
        setTimeLeft(initialSeconds);
    }, [questionId, initialSeconds, resetKey]);

    // Re-enable TimeUp trigger only after time has been reset to a positive value
    useEffect(() => {
        if (timeLeft > 0) {
            hasCalledTimeUpRef.current = false;
        }
    }, [timeLeft]);

    // Trigger onTimeUp callback when timer hits 0 safely outside of render phase
    useEffect(() => {
        if (timeLeft === 0 && !isPaused && !hasCalledTimeUpRef.current && initialSeconds > 0) {
            hasCalledTimeUpRef.current = true;
            if (onTimeUpRef.current) {
                onTimeUpRef.current();
            }
        }
    }, [timeLeft, isPaused, initialSeconds]);

    // Interval handler for counting down every second
    useEffect(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (isPaused || timeLeft <= 0) {
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isPaused, questionId, timeLeft <= 0]);

    // Compute dynamic progress ratio (1.0 at full time -> 0.0 at end)
    const progress = Math.max(0, Math.min(1, initialSeconds > 0 ? timeLeft / initialSeconds : 0));
    const angle = progress * 360;

    // Calculate rotation angles for circular progress half-clip segments
    const rightRotate = angle >= 180 ? 0 : 180 - angle;
    const leftRotate = angle >= 180 ? 360 - angle : 180;

    // Dynamic color transition: Green (>50% time left) -> Orange (25%-50% time left) -> Red (Danger <= 25% time left)
    let ringColor = '#10B981'; // Green (3 Stars)
    if (progress <= 0.25) {
        ringColor = '#EF4444'; // Red (1 Star)
    } else if (progress <= 0.5) {
        ringColor = '#F97316'; // Orange (2 Stars)
    }

    return (
        <View style={styles.container}>
            <View style={styles.outerCircle}>
                {/* Background Ring Track */}
                <View style={styles.trackCircle} />

                {/* Right Half Circular Ring Progress Segment */}
                <View style={styles.rightHalfContainer}>
                    <View
                        style={[
                            styles.rightRingSegment,
                            {
                                borderColor: ringColor,
                                transform: [{ rotate: `${rightRotate}deg` }],
                            },
                        ]}
                    />
                </View>

                {/* Left Half Circular Ring Progress Segment */}
                <View style={styles.leftHalfContainer}>
                    <View
                        style={[
                            styles.leftRingSegment,
                            {
                                borderColor: ringColor,
                                transform: [{ rotate: `${leftRotate}deg` }],
                            },
                        ]}
                    />
                </View>

                {/* Center Content */}
                <View style={styles.innerCircle}>
                    <Text
                        style={[
                            styles.timerNumber,
                            (progress <= 0.25 || timeLeft <= 4) && styles.timerNumberLow,
                        ]}
                    >
                        {timeLeft}
                    </Text>
                    <Text style={styles.timerLabel}>SEC</Text>
                </View>
            </View>
        </View>
    );
}

const CIRCLE_SIZE = 110;
const RADIUS = CIRCLE_SIZE / 2;
const BORDER_WIDTH = 6;

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 18,
    },
    outerCircle: {
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: RADIUS,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: colors.background,
    },
    trackCircle: {
        position: 'absolute',
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: RADIUS,
        borderWidth: BORDER_WIDTH,
        borderColor: colors.grayBorder || '#E5E7EB',
    },
    rightHalfContainer: {
        position: 'absolute',
        top: 0,
        left: RADIUS,
        width: RADIUS,
        height: CIRCLE_SIZE,
        overflow: 'hidden',
    },
    leftHalfContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: RADIUS,
        height: CIRCLE_SIZE,
        overflow: 'hidden',
    },
    leftRingSegment: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: RADIUS,
        borderWidth: BORDER_WIDTH,
    },
    rightRingSegment: {
        position: 'absolute',
        top: 0,
        left: -RADIUS,
        width: CIRCLE_SIZE,
        height: CIRCLE_SIZE,
        borderRadius: RADIUS,
        borderWidth: BORDER_WIDTH,
    },
    innerCircle: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    timerNumber: {
        fontSize: 32,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
    },
    timerNumberLow: {
        color: '#EF4444',
    },
    timerLabel: {
        fontSize: 10,
        fontFamily: fonts.bold,
        fontWeight: '800',
        color: colors.gray,
        letterSpacing: 1,
        marginTop: -2,
    },
});



import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import fonts from '../../constants/fonts';
import colors from '../../constants/colour';

export default function GameTimer({ initialSeconds = 10, onTimeUp, questionId, isPaused = false }) {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const timerRef = useRef(null);
    const onTimeUpRef = useRef(onTimeUp);

    useEffect(() => {
        onTimeUpRef.current = onTimeUp;
    }, [onTimeUp]);

    // Reset and start timer whenever initialSeconds or questionId changes
    useEffect(() => {
        setTimeLeft(initialSeconds);

        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (isPaused) {
            return;
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    if (onTimeUpRef.current) {
                        onTimeUpRef.current();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
        };
    }, [initialSeconds, questionId, isPaused]);

    // Compute progress ratio (1 at start -> 0 at end)
    const progress = initialSeconds > 0 ? timeLeft / initialSeconds : 0;

    return (
        <View style={styles.container}>
            {/* Outer Circular Ring Background */}
            <View style={styles.outerCircle}>
                {/* Top Active Indicator Arc Segment */}
                <View
                    style={[
                        styles.activeArc,
                        {
                            opacity: progress > 0 ? 1 : 0.2,
                            transform: [{ scale: 0.95 + progress * 0.05 }],
                        },
                    ]}
                />

                {/* Center Content */}
                <View style={styles.innerCircle}>
                    <Text style={styles.timerNumber}>{timeLeft}</Text>
                    <Text style={styles.timerLabel}>SEC</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 18,
    },
    outerCircle: {
        width: 110,
        height: 110,
        borderRadius: 55,
        borderWidth: 6,
        borderColor: colors.grayBorder, // Soft circle outline from screenshot
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        backgroundColor: colors.background,
    },
    activeArc: {
        position: 'absolute',
        top: -6,
        width: 32,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.purplePlay || colors.primary, // Purple top indicator pill matching screenshot
    },
    innerCircle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerNumber: {
        fontSize: 32,
        fontFamily: fonts.bold,
        fontWeight: '900',
        color: colors.darkBlue,
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

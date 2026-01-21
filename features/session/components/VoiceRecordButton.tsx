/**
 * @file VoiceRecordButton.tsx
 * @description Bouton d'enregistrement vocal - Monochrome "AI Driver" Theme
 *
 * REWORK:
 * - Removed colored glow rings (Cyan, Violet, Rose, Green)
 * - Single white/black pulse animation
 * - Clean minimalist aesthetic
 */

import React, { memo, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withRepeat,
    withTiming,
    Easing,
    interpolate,
    Extrapolation,
    withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { GlassColors, Shadows } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

interface VoiceRecordButtonProps {
    isRecording: boolean;
    audioLevel: number; // 0 to 1
    onPress: () => void;
    size?: number;
    disabled?: boolean;
}

// Monochrome pulse configuration (single ring, no colors)
const PULSE_CONFIG = {
    color: GlassColors.text.primary, // White in dark mode
    maxScale: 2.5,
    minOpacity: 0,
    maxOpacity: 0.3,
};

// ═══════════════════════════════════════════════════════════════════════════
// PULSE RING COMPONENT (Monochrome)
// ═══════════════════════════════════════════════════════════════════════════

interface PulseRingProps {
    size: number;
    audioLevel: number;
    isActive: boolean;
    delay?: number;
}

const PulseRing = memo(function PulseRing({
                                              size,
                                              audioLevel,
                                              isActive,
                                              delay = 0,
                                          }: PulseRingProps) {
    const scale = useSharedValue(1);
    const opacity = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            // Fade in
            opacity.value = withTiming(PULSE_CONFIG.maxOpacity, { duration: 300 });

            // Pulse animation based on audio level
            const targetScale = 1 + (audioLevel * (PULSE_CONFIG.maxScale - 1));
            scale.value = withSpring(targetScale, {
                damping: 10,
                stiffness: 80,
                mass: 0.5,
            });
        } else {
            opacity.value = withTiming(0, { duration: 200 });
            scale.value = withTiming(1, { duration: 200 });
        }
    }, [isActive, audioLevel]);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                styles.pulseRing,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    borderColor: PULSE_CONFIG.color,
                },
                animatedStyle,
            ]}
        />
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const VoiceRecordButton = memo(function VoiceRecordButton({
                                                                     isRecording,
                                                                     audioLevel,
                                                                     onPress,
                                                                     size = 100,
                                                                     disabled = false,
                                                                 }: VoiceRecordButtonProps) {
    // Animation values
    const buttonScale = useSharedValue(1);
    const breathe = useSharedValue(1);

    // Haptic feedback
    useEffect(() => {
        if (isRecording) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [isRecording]);

    // Breathing animation when idle
    useEffect(() => {
        if (!isRecording) {
            breathe.value = withRepeat(
                withTiming(1.03, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            );
        } else {
            breathe.value = withTiming(1, { duration: 200 });
        }
    }, [isRecording]);

    // Button press animation
    const handlePressIn = () => {
        buttonScale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        buttonScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    // Animated styles
    const buttonAnimatedStyle = useAnimatedStyle(() => {
        const scale = isRecording ? 1 : breathe.value;
        return {
            transform: [{ scale: buttonScale.value * scale }],
        };
    });

    // Determine button appearance based on state
    const buttonBackground = isRecording
        ? GlassColors.text.primary // Solid white when recording
        : GlassColors.glass.background; // Glass when idle

    const buttonBorder = isRecording
        ? GlassColors.text.primary
        : GlassColors.glass.borderLight;

    const textColor = isRecording
        ? (GlassColors.glass.background === 'rgba(255, 255, 255, 0.06)' ? '#000000' : '#FFFFFF')
        : GlassColors.text.primary;

    return (
        <View style={[styles.container, { width: size * 2.5, height: size * 2.5 }]}>
            {/* Pulse Rings (Monochrome - only visible when recording) */}
            <View style={styles.pulseContainer}>
                <PulseRing
                    size={size}
                    audioLevel={audioLevel}
                    isActive={isRecording}
                />
                {/* Second ring with offset for depth */}
                <PulseRing
                    size={size * 1.2}
                    audioLevel={audioLevel * 0.7}
                    isActive={isRecording}
                    delay={100}
                />
            </View>

            {/* Main Button */}
            <Animated.View style={[styles.buttonWrapper, buttonAnimatedStyle]}>
                <TouchableOpacity
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    activeOpacity={0.9}
                    disabled={disabled}
                    style={[
                        styles.button,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                            backgroundColor: buttonBackground,
                            borderWidth: 2,
                            borderColor: buttonBorder,
                        },
                        Shadows.glass,
                    ]}
                >
                    {/* Inner Ring */}
                    <View
                        style={[
                            styles.innerRing,
                            {
                                width: size - 8,
                                height: size - 8,
                                borderRadius: (size - 8) / 2,
                                borderColor: isRecording
                                    ? 'rgba(0, 0, 0, 0.1)'
                                    : 'rgba(255, 255, 255, 0.1)',
                            },
                        ]}
                    />

                    {/* Icon: Stop square when recording, "PARLER" text when idle */}
                    {isRecording ? (
                        <View
                            style={[
                                styles.stopIcon,
                                {
                                    backgroundColor: textColor,
                                },
                            ]}
                        />
                    ) : (
                        <Text style={[styles.buttonText, { color: textColor }]}>
                            PARLER
                        </Text>
                    )}
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    pulseContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },

    pulseRing: {
        position: 'absolute',
        borderWidth: 2,
    },

    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },

    button: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    innerRing: {
        position: 'absolute',
        borderWidth: 1,
    },

    stopIcon: {
        width: 24,
        height: 24,
        borderRadius: 4,
    },

    buttonText: {
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 1,
    },
});

export default VoiceRecordButton;
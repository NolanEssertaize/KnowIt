/**
 * @file VoiceRecordButton.tsx
 * @description Bouton d'enregistrement vocal avec animation réactive à l'intensité sonore
 * Style inspiré du mode vocal ChatGPT avec lueurs colorées
 */

import React, { memo, useEffect, useRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { GlassColors, Shadows } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface VoiceRecordButtonProps {
    /** État d'enregistrement */
    isRecording: boolean;
    /** Intensité sonore (0 à 1) */
    audioLevel: number;
    /** Action au clic */
    onPress: () => void;
    /** Taille du bouton principal */
    size?: number;
    /** Désactivé */
    disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const GLOW_COLORS = {
    // Couleurs style ChatGPT vocal mode
    layer1: ['#00D4FF', '#0EA5E9'], // Cyan - couche externe
    layer2: ['#6366F1', '#8B5CF6'], // Violet/Indigo
    layer3: ['#EC4899', '#F43F5E'], // Rose/Rouge
    layer4: ['#10B981', '#34D399'], // Vert émeraude
};

const IDLE_COLORS = ['#00D4FF', '#0EA5E9'];
const RECORDING_COLORS = ['#EC4899', '#F43F5E'];

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT GLOW RING
// ═══════════════════════════════════════════════════════════════════════════

interface GlowRingProps {
    size: number;
    colors: string[];
    scale: Animated.Value;
    opacity: Animated.Value;
    rotation?: Animated.Value;
    blur?: number;
}

const GlowRing = memo(function GlowRing({
                                            size,
                                            colors,
                                            scale,
                                            opacity,
                                            rotation,
                                            blur = 20,
                                        }: GlowRingProps) {
    const animatedStyle = {
        transform: [
            { scale },
            ...(rotation
                ? [
                    {
                        rotate: rotation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '360deg'],
                        }),
                    },
                ]
                : []),
        ],
        opacity,
    };

    return (
        <Animated.View
            style={[
                styles.glowRing,
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                },
                animatedStyle,
            ]}
        >
            <LinearGradient
                colors={[...colors.map((c) => c + '80'), 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[
                    styles.glowGradient,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                    },
                ]}
            />
        </Animated.View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT ORBITING PARTICLE
// ═══════════════════════════════════════════════════════════════════════════

interface OrbitingParticleProps {
    orbitRadius: number;
    size: number;
    color: string;
    duration: number;
    delay: number;
    isActive: boolean;
}

const OrbitingParticle = memo(function OrbitingParticle({
                                                            orbitRadius,
                                                            size,
                                                            color,
                                                            duration,
                                                            delay,
                                                            isActive,
                                                        }: OrbitingParticleProps) {
    const rotation = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (isActive) {
            // Fade in
            Animated.timing(opacity, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Rotation continue
            const rotationAnim = Animated.loop(
                Animated.timing(rotation, {
                    toValue: 1,
                    duration,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );

            setTimeout(() => rotationAnim.start(), delay);

            return () => rotationAnim.stop();
        } else {
            Animated.timing(opacity, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive, duration, delay, opacity, rotation]);

    const animatedStyle = {
        opacity,
        transform: [
            {
                rotate: rotation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0deg', '360deg'],
                }),
            },
            { translateX: orbitRadius },
        ],
    };

    return (
        <Animated.View style={[styles.particleContainer, animatedStyle]}>
            <View
                style={[
                    styles.particle,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        backgroundColor: color,
                        shadowColor: color,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.8,
                        shadowRadius: 10,
                    },
                ]}
            />
        </Animated.View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const VoiceRecordButton = memo(function VoiceRecordButton({
                                                                     isRecording,
                                                                     audioLevel,
                                                                     onPress,
                                                                     size = 120,
                                                                     disabled = false,
                                                                 }: VoiceRecordButtonProps) {
    // Animations refs
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const glowScale1 = useRef(new Animated.Value(1)).current;
    const glowScale2 = useRef(new Animated.Value(1)).current;
    const glowScale3 = useRef(new Animated.Value(1)).current;
    const glowScale4 = useRef(new Animated.Value(1)).current;
    const glowOpacity1 = useRef(new Animated.Value(0)).current;
    const glowOpacity2 = useRef(new Animated.Value(0)).current;
    const glowOpacity3 = useRef(new Animated.Value(0)).current;
    const glowOpacity4 = useRef(new Animated.Value(0)).current;
    const rotation1 = useRef(new Animated.Value(0)).current;
    const rotation2 = useRef(new Animated.Value(0)).current;
    const breatheAnim = useRef(new Animated.Value(1)).current;

    // Animation idle (respiration douce)
    useEffect(() => {
        if (!isRecording) {
            const breatheLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(breatheAnim, {
                        toValue: 1.05,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                    Animated.timing(breatheAnim, {
                        toValue: 1,
                        duration: 2000,
                        easing: Easing.inOut(Easing.ease),
                        useNativeDriver: true,
                    }),
                ])
            );
            breatheLoop.start();
            return () => breatheLoop.stop();
        } else {
            breatheAnim.setValue(1);
        }
    }, [isRecording, breatheAnim]);

    // Animation d'activation/désactivation des glows
    useEffect(() => {
        if (isRecording) {
            // Activation des glows avec décalage
            Animated.stagger(100, [
                Animated.timing(glowOpacity1, {
                    toValue: 0.6,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity2, {
                    toValue: 0.5,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity3, {
                    toValue: 0.4,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(glowOpacity4, {
                    toValue: 0.3,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            // Rotations continues
            const rot1 = Animated.loop(
                Animated.timing(rotation1, {
                    toValue: 1,
                    duration: 8000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            const rot2 = Animated.loop(
                Animated.timing(rotation2, {
                    toValue: 1,
                    duration: 12000,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            rot1.start();
            rot2.start();

            return () => {
                rot1.stop();
                rot2.stop();
            };
        } else {
            // Désactivation
            Animated.parallel([
                Animated.timing(glowOpacity1, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(glowOpacity2, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(glowOpacity3, { toValue: 0, duration: 200, useNativeDriver: true }),
                Animated.timing(glowOpacity4, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        }
    }, [isRecording, glowOpacity1, glowOpacity2, glowOpacity3, glowOpacity4, rotation1, rotation2]);

    // Réaction à l'intensité audio
    useEffect(() => {
        if (isRecording) {
            // Ajuster les scales en fonction de l'audio level
            const baseScale = 1;
            const maxExpansion = 0.5;
            const level = Math.min(1, Math.max(0, audioLevel));

            const targetScale1 = baseScale + level * maxExpansion * 0.8;
            const targetScale2 = baseScale + level * maxExpansion * 1.0;
            const targetScale3 = baseScale + level * maxExpansion * 1.2;
            const targetScale4 = baseScale + level * maxExpansion * 1.4;

            Animated.parallel([
                Animated.spring(glowScale1, {
                    toValue: targetScale1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(glowScale2, {
                    toValue: targetScale2,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(glowScale3, {
                    toValue: targetScale3,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(glowScale4, {
                    toValue: targetScale4,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(pulseAnim, {
                    toValue: 1 + level * 0.1,
                    friction: 8,
                    tension: 100,
                    useNativeDriver: true,
                }),
            ]).start();
        } else {
            glowScale1.setValue(1);
            glowScale2.setValue(1);
            glowScale3.setValue(1);
            glowScale4.setValue(1);
            pulseAnim.setValue(1);
        }
    }, [audioLevel, isRecording, glowScale1, glowScale2, glowScale3, glowScale4, pulseAnim]);

    // Tailles des anneaux
    const ringSize1 = size * 1.4;
    const ringSize2 = size * 1.7;
    const ringSize3 = size * 2.0;
    const ringSize4 = size * 2.3;

    return (
        <View style={[styles.container, { width: ringSize4, height: ringSize4 }]}>
            {/* Anneaux de glow */}
            <View style={styles.glowContainer}>
                <GlowRing
                    size={ringSize4}
                    colors={GLOW_COLORS.layer1}
                    scale={glowScale4}
                    opacity={glowOpacity4}
                    rotation={rotation1}
                />
                <GlowRing
                    size={ringSize3}
                    colors={GLOW_COLORS.layer2}
                    scale={glowScale3}
                    opacity={glowOpacity3}
                    rotation={rotation2}
                />
                <GlowRing
                    size={ringSize2}
                    colors={GLOW_COLORS.layer3}
                    scale={glowScale2}
                    opacity={glowOpacity2}
                />
                <GlowRing
                    size={ringSize1}
                    colors={GLOW_COLORS.layer4}
                    scale={glowScale1}
                    opacity={glowOpacity1}
                />
            </View>

            {/* Particules orbitantes */}
            <View style={styles.particlesContainer}>
                <OrbitingParticle
                    orbitRadius={size * 0.9}
                    size={8}
                    color={GLOW_COLORS.layer1[0]}
                    duration={4000}
                    delay={0}
                    isActive={isRecording}
                />
                <OrbitingParticle
                    orbitRadius={size * 1.1}
                    size={6}
                    color={GLOW_COLORS.layer2[0]}
                    duration={5000}
                    delay={200}
                    isActive={isRecording}
                />
                <OrbitingParticle
                    orbitRadius={size * 0.85}
                    size={5}
                    color={GLOW_COLORS.layer3[0]}
                    duration={6000}
                    delay={400}
                    isActive={isRecording}
                />
                <OrbitingParticle
                    orbitRadius={size * 1.05}
                    size={4}
                    color={GLOW_COLORS.layer4[0]}
                    duration={7000}
                    delay={600}
                    isActive={isRecording}
                />
            </View>

            {/* Bouton principal */}
            <Animated.View
                style={[
                    styles.buttonWrapper,
                    {
                        transform: [{ scale: isRecording ? pulseAnim : breatheAnim }],
                    },
                ]}
            >
                <TouchableOpacity
                    onPress={onPress}
                    activeOpacity={0.8}
                    disabled={disabled}
                    style={styles.touchable}
                >
                    <LinearGradient
                        colors={isRecording ? RECORDING_COLORS : IDLE_COLORS}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.button,
                            {
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                            },
                            Shadows.glow(isRecording ? RECORDING_COLORS[0] : IDLE_COLORS[0]),
                        ]}
                    >
                        {/* Inner glow effect */}
                        <View
                            style={[
                                styles.innerGlow,
                                {
                                    width: size * 0.7,
                                    height: size * 0.7,
                                    borderRadius: size * 0.35,
                                },
                            ]}
                        />
                        <Text style={styles.buttonText}>
                            {isRecording ? 'STOP' : 'PARLER'}
                        </Text>
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            {/* Audio level indicator (debug - peut être retiré en prod) */}
            {/* <Text style={styles.debugText}>{Math.round(audioLevel * 100)}%</Text> */}
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
    glowContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowRing: {
        position: 'absolute',
    },
    glowGradient: {
        flex: 1,
    },
    particlesContainer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
    },
    particleContainer: {
        position: 'absolute',
    },
    particle: {
        elevation: 5,
    },
    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    touchable: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 10,
    },
    innerGlow: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
    },
    buttonText: {
        color: GlassColors.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
    debugText: {
        position: 'absolute',
        bottom: -30,
        color: GlassColors.text.secondary,
        fontSize: 12,
    },
});

export default VoiceRecordButton;
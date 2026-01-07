/**
 * @file VoiceRecordButton.tsx
 * @description Bouton d'enregistrement vocal avec animation de vague circulaire
 * Les pics fluctuent de manière organique autour du cercle central
 */

import React, { memo, useEffect, useRef, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Animated,
    Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
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

const WAVE_POINTS = 64; // Nombre de points pour la vague
const BASE_AMPLITUDE = 15; // Amplitude de base des vagues
const MAX_AMPLITUDE = 40; // Amplitude maximum avec audio
const WAVE_SPEED = 2000; // Vitesse de rotation (ms)

// Couleurs du gradient
const GRADIENT_COLORS = {
    light: '#FFFFFF',
    primary: '#00D4FF',
    secondary: '#0EA5E9',
    dark: '#0369A1',
    darker: '#1E3A5F',
};

const IDLE_BUTTON_COLORS = ['#00D4FF', '#0EA5E9'];
const RECORDING_BUTTON_COLORS = ['#00D4FF', '#0EA5E9'];

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT WAVE VISUALIZER
// ═══════════════════════════════════════════════════════════════════════════

interface WaveVisualizerProps {
    size: number;
    buttonSize: number;
    isActive: boolean;
    audioLevel: number;
}

const WaveVisualizer = memo(function WaveVisualizer({
                                                        size,
                                                        buttonSize,
                                                        isActive,
                                                        audioLevel,
                                                    }: WaveVisualizerProps) {
    // Animation de rotation
    const rotationAnim = useRef(new Animated.Value(0)).current;
    // Animation d'opacité pour l'apparition
    const opacityAnim = useRef(new Animated.Value(0)).current;

    // État pour forcer le re-render avec les nouvelles valeurs
    const [waveValues, setWaveValues] = React.useState<number[]>(
        Array(WAVE_POINTS).fill(0)
    );

    // Animation de rotation continue
    useEffect(() => {
        if (isActive) {
            // Fade in
            Animated.timing(opacityAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();

            // Rotation continue
            const rotationLoop = Animated.loop(
                Animated.timing(rotationAnim, {
                    toValue: 1,
                    duration: WAVE_SPEED * 3,
                    easing: Easing.linear,
                    useNativeDriver: true,
                })
            );
            rotationLoop.start();

            return () => rotationLoop.stop();
        } else {
            // Fade out
            Animated.timing(opacityAnim, {
                toValue: 0,
                duration: 200,
                useNativeDriver: true,
            }).start();
        }
    }, [isActive, rotationAnim, opacityAnim]);

    // Animation des fluctuations aléatoires
    useEffect(() => {
        if (!isActive) {
            setWaveValues(Array(WAVE_POINTS).fill(0));
            return;
        }

        let animationFrameId: number;
        let lastTime = Date.now();

        const animate = () => {
            const currentTime = Date.now();
            const deltaTime = currentTime - lastTime;

            if (deltaTime > 50) { // ~20fps pour les fluctuations
                lastTime = currentTime;

                setWaveValues(prev => {
                    return prev.map((val, i) => {
                        // Variation sinusoïdale de base pour un mouvement fluide
                        const baseWave = Math.sin((currentTime / 500) + (i * 0.3)) * 0.3;

                        // Ajouter du bruit aléatoire
                        const noise = (Math.random() - 0.5) * 0.4;

                        // Facteur audio
                        const audioFactor = audioLevel * 1.5;

                        // Combiner le tout avec lissage
                        const target = baseWave + noise + audioFactor;

                        // Lissage pour éviter les sauts brusques
                        return val * 0.7 + target * 0.3;
                    });
                });
            }

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [isActive, audioLevel]);

    // Générer le path SVG pour la vague
    const wavePath = useMemo(() => {
        const centerX = size / 2;
        const centerY = size / 2;
        const baseRadius = buttonSize / 2 + 10; // Rayon de base (juste autour du bouton)

        let path = '';

        for (let i = 0; i <= WAVE_POINTS; i++) {
            const index = i % WAVE_POINTS;
            const angle = (index / WAVE_POINTS) * Math.PI * 2 - Math.PI / 2;

            // Amplitude basée sur l'audio et les fluctuations
            const waveValue = waveValues[index] || 0;
            const amplitude = BASE_AMPLITUDE + (waveValue * MAX_AMPLITUDE);

            const radius = baseRadius + amplitude;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            if (i === 0) {
                path += `M ${x} ${y}`;
            } else {
                // Utiliser des courbes pour un rendu plus fluide
                const prevIndex = (i - 1) % WAVE_POINTS;
                const prevAngle = (prevIndex / WAVE_POINTS) * Math.PI * 2 - Math.PI / 2;
                const prevWaveValue = waveValues[prevIndex] || 0;
                const prevAmplitude = BASE_AMPLITUDE + (prevWaveValue * MAX_AMPLITUDE);
                const prevRadius = baseRadius + prevAmplitude;

                const prevX = centerX + Math.cos(prevAngle) * prevRadius;
                const prevY = centerY + Math.sin(prevAngle) * prevRadius;

                // Points de contrôle pour la courbe de Bézier
                const cpRadius = (radius + prevRadius) / 2;
                const cpAngle = (angle + prevAngle) / 2;
                const cpX = centerX + Math.cos(cpAngle) * cpRadius;
                const cpY = centerY + Math.sin(cpAngle) * cpRadius;

                path += ` Q ${cpX} ${cpY} ${x} ${y}`;
            }
        }

        path += ' Z';

        return path;
    }, [size, buttonSize, waveValues]);

    const rotation = rotationAnim.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <Animated.View
            style={[
                styles.waveContainer,
                {
                    width: size,
                    height: size,
                    opacity: opacityAnim,
                    transform: [{ rotate: rotation }],
                },
            ]}
            pointerEvents="none"
        >
            <Svg width={size} height={size}>
                <Defs>
                    <SvgGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <Stop offset="0%" stopColor={GRADIENT_COLORS.light} stopOpacity="0.15" />
                        <Stop offset="30%" stopColor={GRADIENT_COLORS.primary} stopOpacity="0.8" />
                        <Stop offset="60%" stopColor={GRADIENT_COLORS.secondary} stopOpacity="0.9" />
                        <Stop offset="85%" stopColor={GRADIENT_COLORS.dark} stopOpacity="0.95" />
                        <Stop offset="100%" stopColor={GRADIENT_COLORS.darker} stopOpacity="1" />
                    </SvgGradient>
                    <SvgGradient id="waveGradient2" x1="100%" y1="0%" x2="0%" y2="100%">
                        <Stop offset="0%" stopColor={GRADIENT_COLORS.primary} stopOpacity="0.6" />
                        <Stop offset="50%" stopColor={GRADIENT_COLORS.secondary} stopOpacity="0.8" />
                        <Stop offset="100%" stopColor={GRADIENT_COLORS.darker} stopOpacity="0.9" />
                    </SvgGradient>
                </Defs>

                {/* Vague principale */}
                <Path
                    d={wavePath}
                    fill="url(#waveGradient)"
                />

                {/* Vague secondaire légèrement décalée pour plus de profondeur */}
                <Path
                    d={wavePath}
                    fill="url(#waveGradient2)"
                    opacity={0.5}
                    transform={`rotate(180 ${size/2} ${size/2})`}
                />
            </Svg>
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
    // Animation de respiration pour l'état idle
    const breatheAnim = useRef(new Animated.Value(1)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Animation idle (respiration douce)
    useEffect(() => {
        if (!isRecording) {
            const breatheLoop = Animated.loop(
                Animated.sequence([
                    Animated.timing(breatheAnim, {
                        toValue: 1.03,
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

    // Réaction légère à l'audio
    useEffect(() => {
        if (isRecording) {
            const level = Math.min(1, Math.max(0, audioLevel));
            Animated.spring(pulseAnim, {
                toValue: 1 + level * 0.05,
                friction: 10,
                tension: 100,
                useNativeDriver: true,
            }).start();
        } else {
            pulseAnim.setValue(1);
        }
    }, [audioLevel, isRecording, pulseAnim]);

    // Taille du container pour la vague
    const waveContainerSize = size * 2.5;

    return (
        <View style={[styles.container, { width: waveContainerSize, height: waveContainerSize }]}>
            {/* Visualiseur de vague */}
            <WaveVisualizer
                size={waveContainerSize}
                buttonSize={size}
                isActive={isRecording}
                audioLevel={audioLevel}
            />

            {/* Glow effect derrière le bouton */}
            {isRecording && (
                <View
                    style={[
                        styles.glowEffect,
                        {
                            width: size * 1.3,
                            height: size * 1.3,
                            borderRadius: size * 0.65,
                            backgroundColor: GRADIENT_COLORS.primary,
                            shadowColor: GRADIENT_COLORS.primary,
                        }
                    ]}
                    pointerEvents="none"
                />
            )}

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
                    style={[
                        styles.touchable,
                        {
                            width: size,
                            height: size,
                            borderRadius: size / 2,
                        },
                    ]}
                >
                    <LinearGradient
                        colors={isRecording ? RECORDING_BUTTON_COLORS : IDLE_BUTTON_COLORS}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={[
                            styles.button,
                            {
                                width: size,
                                height: size,
                                borderRadius: size / 2,
                            },
                            Shadows.glow(GRADIENT_COLORS.primary),
                        ]}
                    >
                        {/* Inner highlight */}
                        <View
                            style={[
                                styles.innerHighlight,
                                {
                                    width: size * 0.8,
                                    height: size * 0.8,
                                    borderRadius: size * 0.4,
                                },
                            ]}
                        />
                        {/* Inner circle */}
                        <View
                            style={[
                                styles.innerCircle,
                                {
                                    width: size * 0.6,
                                    height: size * 0.6,
                                    borderRadius: size * 0.3,
                                },
                            ]}
                        />
                        <Text style={styles.buttonText}>
                            {isRecording ? 'STOP' : 'PARLER'}
                        </Text>
                    </LinearGradient>
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
    waveContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    glowEffect: {
        position: 'absolute',
        opacity: 0.3,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 30,
        elevation: 15,
    },
    buttonWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
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
    innerHighlight: {
        position: 'absolute',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    innerCircle: {
        position: 'absolute',
        backgroundColor: 'rgba(0, 150, 200, 0.3)',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    buttonText: {
        color: GlassColors.text.primary,
        fontSize: 18,
        fontWeight: 'bold',
        letterSpacing: 1,
        zIndex: 1,
    },
});

export default VoiceRecordButton;
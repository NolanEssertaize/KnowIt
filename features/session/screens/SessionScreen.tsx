/**
 * @file SessionScreen.tsx
 * @description Écran d'enregistrement vocal avec animation réactive
 * Version mise à jour avec VoiceRecordButton et useAudioRecording
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenWrapper, GlassView } from '@/shared/components';
import { GlassColors, Spacing, BorderRadius } from '@/theme';

import { VoiceRecordButton } from '../components/VoiceRecordButton';
import { useSessionWithAudio } from '../hooks/useSessionWithAudio';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const SessionScreen = memo(function SessionScreen() {
    // Setup Hook - Logic Controller
    const logic = useSessionWithAudio();
    const insets = useSafeAreaInsets();

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const formatDuration = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // GUARD: Topic not found
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.topic) {
        return (
            <ScreenWrapper centered>
                <Text style={styles.errorText}>Topic introuvable</Text>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea={false} padding={0}>
            <LinearGradient
                colors={[GlassColors.gradient.start, GlassColors.gradient.middle, GlassColors.gradient.end]}
                style={styles.gradient}
            >
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <Pressable style={styles.closeButton} onPress={logic.handleClose}>
                            <MaterialIcons
                                name="close"
                                size={24}
                                color={GlassColors.text.primary}
                            />
                        </Pressable>
                        <Text style={styles.headerTitle}>Session</Text>
                        <View style={styles.placeholder} />
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {/* Topic Badge */}
                        <GlassView style={styles.topicBadge} borderRadius="full">
                            <Text style={styles.topicTitle}>{logic.topic.title}</Text>
                        </GlassView>

                        {/* Permission Error */}
                        {logic.error && (
                            <View style={styles.errorContainer}>
                                <MaterialIcons
                                    name="mic-off"
                                    size={24}
                                    color={GlassColors.semantic.error}
                                />
                                <Text style={styles.errorMessage}>{logic.error}</Text>
                                <Pressable
                                    style={styles.retryButton}
                                    onPress={logic.requestPermission}
                                >
                                    <Text style={styles.retryButtonText}>Autoriser le micro</Text>
                                </Pressable>
                            </View>
                        )}

                        {/* Status */}
                        {logic.isAnalyzing ? (
                            <View style={styles.analyzingContainer}>
                                <ActivityIndicator size="large" color={GlassColors.accent.primary} />
                                <Text style={styles.analyzingText}>Analyse en cours...</Text>
                                <Text style={styles.analyzingHint}>
                                    Traitement de votre enregistrement
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Status Text */}
                                <View style={styles.statusContainer}>
                                    <Text style={styles.statusText}>
                                        {logic.isRecording ? 'Enregistrement...' : 'Prêt à enregistrer'}
                                    </Text>
                                    <Text style={styles.statusHint}>
                                        {logic.isRecording
                                            ? 'Expliquez le sujet avec vos mots'
                                            : 'Appuyez sur le bouton pour commencer'}
                                    </Text>
                                </View>

                                {/* Duration Timer */}
                                {logic.isRecording && (
                                    <View style={styles.timerContainer}>
                                        <View style={styles.timerDot} />
                                        <Text style={styles.timerText}>
                                            {formatDuration(logic.duration)}
                                        </Text>
                                    </View>
                                )}

                                {/* Voice Record Button avec Animation */}
                                <View style={styles.recordButtonContainer}>
                                    <VoiceRecordButton
                                        isRecording={logic.isRecording}
                                        audioLevel={logic.audioLevel}
                                        onPress={logic.toggleRecording}
                                        size={120}
                                    />
                                </View>

                                {/* Audio Level Indicator (Visual feedback) */}
                                {logic.isRecording && (
                                    <View style={styles.levelIndicatorContainer}>
                                        <View style={styles.levelBarBackground}>
                                            <View
                                                style={[
                                                    styles.levelBarFill,
                                                    { width: `${logic.audioLevel * 100}%` }
                                                ]}
                                            />
                                        </View>
                                        <Text style={styles.levelText}>
                                            Niveau: {Math.round(logic.audioLevel * 100)}%
                                        </Text>
                                    </View>
                                )}

                                {/* Instructions */}
                                {!logic.isRecording && (
                                    <View style={styles.instructionsContainer}>
                                        <Text style={styles.instructionText}>
                                            💡 Conseil: Parlez clairement et à un rythme normal
                                        </Text>
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </LinearGradient>
        </ScreenWrapper>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
    },
    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: GlassColors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: GlassColors.text.primary,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.xl,
    },
    topicBadge: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: GlassColors.text.primary,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    statusText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: GlassColors.text.primary,
        marginBottom: Spacing.xs,
    },
    statusHint: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        textAlign: 'center',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    timerDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: GlassColors.semantic.error,
        marginRight: Spacing.sm,
    },
    timerText: {
        fontSize: 32,
        fontWeight: '300',
        color: GlassColors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    recordButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.xl,
    },
    analyzingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingText: {
        fontSize: 20,
        fontWeight: '600',
        color: GlassColors.text.primary,
        marginTop: Spacing.lg,
    },
    analyzingHint: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        marginTop: Spacing.sm,
    },
    errorText: {
        fontSize: 16,
        color: GlassColors.semantic.error,
    },
    errorContainer: {
        alignItems: 'center',
        padding: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    errorMessage: {
        fontSize: 14,
        color: GlassColors.semantic.error,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: Spacing.md,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm,
        backgroundColor: GlassColors.accent.primary,
        borderRadius: BorderRadius.md,
    },
    retryButtonText: {
        color: GlassColors.text.primary,
        fontWeight: '600',
    },
    levelIndicatorContainer: {
        alignItems: 'center',
        width: '80%',
        marginTop: Spacing.lg,
    },
    levelBarBackground: {
        width: '100%',
        height: 4,
        backgroundColor: GlassColors.glass.background,
        borderRadius: 2,
        overflow: 'hidden',
    },
    levelBarFill: {
        height: '100%',
        backgroundColor: GlassColors.accent.primary,
        borderRadius: 2,
    },
    levelText: {
        fontSize: 12,
        color: GlassColors.text.tertiary,
        marginTop: Spacing.xs,
    },
    instructionsContainer: {
        position: 'absolute',
        bottom: Spacing.xxl,
        paddingHorizontal: Spacing.lg,
    },
    instructionText: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        textAlign: 'center',
    },
});

export default SessionScreen;
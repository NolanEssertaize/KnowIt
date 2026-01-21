/**
 * @file SessionScreen.tsx
 * @description Écran d'enregistrement vocal avec animation réactive
 * Version mise à jour avec VoiceRecordButton et useAudioRecording
 *
 * FIXES:
 * - Added close button to "Topic introuvable" error state
 * - Uses currentTopic from store instead of selectTopicById
 * - Added useSafeAreaInsets for proper header spacing
 */

import React, { memo, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { LinearGradient } from 'expo-linear-gradient';

import { ScreenWrapper } from '@/shared/components';
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
    const router = useRouter();

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const formatDuration = useCallback((seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    // ─────────────────────────────────────────────────────────────────────────
    // GUARD: Topic not found - FIX: Added close button
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.topic) {
        return (
            <ScreenWrapper useSafeArea={false} padding={0}>
                <LinearGradient
                    colors={[GlassColors.gradient.start, GlassColors.gradient.middle, GlassColors.gradient.end]}
                    style={styles.gradient}
                >
                    {/* Header with close button */}
                    <View style={[styles.header, { paddingTop: insets.top + Spacing.md }]}>
                        <Pressable style={styles.closeButton} onPress={handleClose}>
                            <MaterialIcons name="close" size={24} color={GlassColors.text.primary} />
                        </Pressable>
                        <Text style={styles.topicTitle}>Session</Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Error content */}
                    <View style={styles.errorContainer}>
                        <MaterialIcons
                            name="error-outline"
                            size={64}
                            color={GlassColors.text.tertiary}
                        />
                        <Text style={styles.errorText}>Topic introuvable</Text>
                        <Text style={styles.errorHint}>
                            Le sujet n'a pas pu être chargé. Veuillez réessayer.
                        </Text>
                    </View>
                </LinearGradient>
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
                    {/* Header avec bouton fermer */}
                    <View style={styles.header}>
                        <Pressable style={styles.closeButton} onPress={logic.handleClose}>
                            <MaterialIcons name="close" size={24} color={GlassColors.text.primary} />
                        </Pressable>
                        <Text style={styles.topicTitle} numberOfLines={1}>
                            {logic.topic.title}
                        </Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Contenu principal */}
                    <View style={styles.content}>
                        {logic.isAnalyzing ? (
                            // État d'analyse
                            <View style={styles.analyzingContainer}>
                                <ActivityIndicator size="large" color={GlassColors.accent.primary} />
                                <Text style={styles.analyzingText}>Analyse en cours...</Text>
                                <Text style={styles.analyzingHint}>
                                    Veuillez patienter pendant que nous analysons votre réponse
                                </Text>
                            </View>
                        ) : (
                            <>
                                {/* Status */}
                                <View style={styles.statusContainer}>
                                    <View style={styles.statusRow}>
                                        <MaterialIcons
                                            name={logic.isRecording ? 'mic' : 'mic-none'}
                                            size={24}
                                            color={
                                                logic.isRecording
                                                    ? GlassColors.semantic.error
                                                    : GlassColors.text.secondary
                                            }
                                        />
                                        <Text style={styles.statusText}>
                                            {logic.isRecording ? 'Enregistrement...' : 'Prêt à enregistrer'}
                                        </Text>
                                    </View>
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

                                {/* Audio Level Indicator - SIMPLIFIÉ: Barre blanche uniquement */}
                                {logic.isRecording && (
                                    <View style={styles.levelIndicatorContainer}>
                                        {/* Label */}
                                        <View style={styles.levelLabelRow}>
                                            <Text style={styles.levelLabel}>NIVEAU AUDIO</Text>
                                            <Text style={styles.levelPercentage}>
                                                {Math.round(logic.audioLevel * 100)}%
                                            </Text>
                                        </View>
                                        {/* Barre de niveau */}
                                        <View style={styles.levelBarBackground}>
                                            <View
                                                style={[
                                                    styles.levelBarFill,
                                                    { width: `${logic.audioLevel * 100}%` },
                                                ]}
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Instructions (only when not recording) */}
                                {!logic.isRecording && (
                                    <View style={styles.instructionsContainer}>
                                        <View style={styles.instructionRow}>
                                            <MaterialIcons
                                                name="lightbulb-outline"
                                                size={18}
                                                color={GlassColors.text.secondary}
                                                style={styles.instructionIcon}
                                            />
                                            <Text style={styles.instructionText}>
                                                Conseil: Parlez clairement et à un rythme normal
                                            </Text>
                                        </View>
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
    topicTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: GlassColors.text.primary,
        textAlign: 'center',
        marginHorizontal: Spacing.md,
    },
    headerSpacer: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    // Error state styles - NEW
    errorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    errorText: {
        fontSize: 18,
        fontWeight: '600',
        color: GlassColors.text.primary,
        marginTop: Spacing.lg,
    },
    errorHint: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
    // Status styles
    statusContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    statusText: {
        fontSize: 24,
        fontWeight: '700',
        color: GlassColors.text.primary,
    },
    statusHint: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        textAlign: 'center',
    },
    // Timer styles
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    timerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: GlassColors.semantic.error,
    },
    timerText: {
        fontSize: 32,
        fontWeight: '700',
        color: GlassColors.text.primary,
        fontVariant: ['tabular-nums'],
    },
    // Record button
    recordButtonContainer: {
        marginBottom: Spacing.xxl,
    },
    // Level indicator
    levelIndicatorContainer: {
        width: '100%',
        maxWidth: 280,
        marginBottom: Spacing.xl,
    },
    levelLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    levelLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: GlassColors.text.secondary,
        letterSpacing: 1,
    },
    levelPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
        color: GlassColors.text.primary,
    },
    levelBarBackground: {
        height: 16,
        backgroundColor: GlassColors.glass.background,
        borderRadius: 8,
        overflow: 'hidden',
    },
    levelBarFill: {
        height: '100%',
        borderRadius: 8,
        backgroundColor: '#FFFFFF',
    },
    // Analyzing state
    analyzingContainer: {
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
        textAlign: 'center',
    },
    // Instructions
    instructionsContainer: {
        marginTop: Spacing.xl,
        paddingHorizontal: Spacing.lg,
    },
    instructionRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    instructionIcon: {
        marginRight: Spacing.xs,
    },
    instructionText: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        textAlign: 'center',
    },
});

export default SessionScreen;
/**
 * @file SessionScreen.tsx
 * @description Session Recording Screen - Theme Aware, Internationalized
 *
 * UPDATED: All hardcoded strings replaced with i18n translations
 */

import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { formatDuration } from '@/i18n';

import { useSessionWithAudio } from '../hooks/useSessionWithAudio';
import { VoiceRecordButton } from '../components/VoiceRecordButton';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function SessionScreenComponent() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();

    const logic = useSessionWithAudio();

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER: ANALYZING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (logic.isAnalyzing) {
        return (
            <ScreenWrapper useSafeArea={false}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <View style={styles.headerSpacer} />
                        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                            {t('session.title')}
                        </Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Analyzing Content */}
                    <View style={styles.content}>
                        <View style={styles.analyzingContainer}>
                            <ActivityIndicator size="large" color={colors.text.primary} />
                            <Text style={[styles.analyzingText, { color: colors.text.primary }]}>
                                {t('session.status.analyzing')}
                            </Text>
                            <Text style={[styles.analyzingHint, { color: colors.text.secondary }]}>
                                {t('session.instructions.analyzing')}
                            </Text>
                        </View>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER: ERROR STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (logic.recordingState === 'error') {
        return (
            <ScreenWrapper useSafeArea={false}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                            <MaterialIcons name="close" size={24} color={colors.text.primary} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                            {t('session.error.title')}
                        </Text>
                        <View style={styles.headerSpacer} />
                    </View>

                    {/* Error Content */}
                    <View style={styles.content}>
                        <View style={styles.analyzingContainer}>
                            <MaterialCommunityIcons
                                name="alert-circle-outline"
                                size={64}
                                color={colors.text.muted}
                            />
                            <Text style={[styles.errorText, { color: colors.text.secondary }]}>
                                {t('session.error.generic')}
                            </Text>
                            <TouchableOpacity
                                style={[styles.closeButtonLarge, { backgroundColor: colors.surface.glass }]}
                                onPress={handleClose}
                            >
                                <Text style={[styles.closeButtonText, { color: colors.text.primary }]}>
                                    {t('common.close')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea={false}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <View style={[styles.container, { paddingTop: insets.top }]}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <MaterialIcons name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        {t('session.title')}
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Topic Info */}
                {logic.topic && (
                    <View style={styles.topicInfo}>
                        <GlassView style={styles.topicCard} showBorder>
                            <MaterialCommunityIcons
                                name="book-open-variant"
                                size={20}
                                color={colors.text.primary}
                            />
                            <Text
                                style={[styles.topicTitle, { color: colors.text.primary }]}
                                numberOfLines={1}
                            >
                                {logic.topic.title}
                            </Text>
                        </GlassView>
                    </View>
                )}

                {/* Main Content */}
                <View style={styles.content}>
                    {/* Status Indicator */}
                    <View style={styles.statusContainer}>
                        <View style={styles.statusRow}>
                            <View
                                style={[
                                    styles.statusDot,
                                    {
                                        backgroundColor: logic.isRecording
                                            ? '#EF4444'
                                            : colors.text.muted,
                                    },
                                ]}
                            />
                            <Text style={[styles.statusText, { color: colors.text.primary }]}>
                                {logic.isRecording
                                    ? t('session.status.recording')
                                    : t('session.status.idle')}
                            </Text>
                        </View>
                        <Text style={[styles.statusHint, { color: colors.text.secondary }]}>
                            {logic.isRecording
                                ? t('session.instructions.recording')
                                : t('session.instructions.idle')}
                        </Text>
                    </View>

                    {/* Duration Timer */}
                    {logic.isRecording && (
                        <View style={styles.timerContainer}>
                            <View style={[styles.timerDot, { backgroundColor: colors.text.primary }]} />
                            <Text style={[styles.timerText, { color: colors.text.primary }]}>
                                {formatDuration(logic.duration)}
                            </Text>
                        </View>
                    )}

                    {/* Voice Record Button */}
                    <View style={styles.recordButtonContainer}>
                        <VoiceRecordButton
                            isRecording={logic.isRecording}
                            audioLevel={logic.audioLevel}
                            onPress={logic.toggleRecording}
                            size={120}
                        />
                    </View>

                    {/* Audio Level Indicator */}
                    {logic.isRecording && (
                        <View style={styles.levelIndicatorContainer}>
                            <View style={styles.levelLabelRow}>
                                <Text style={[styles.levelLabel, { color: colors.text.secondary }]}>
                                    {t('session.audioLevel')}
                                </Text>
                                <Text style={[styles.levelPercentage, { color: colors.text.primary }]}>
                                    {Math.round(logic.audioLevel * 100)}%
                                </Text>
                            </View>
                            <View
                                style={[
                                    styles.levelBarBackground,
                                    { backgroundColor: colors.surface.glass },
                                ]}
                            >
                                <View
                                    style={[
                                        styles.levelBarFill,
                                        {
                                            backgroundColor: colors.text.primary,
                                            width: `${logic.audioLevel * 100}%`,
                                        },
                                    ]}
                                />
                            </View>
                        </View>
                    )}

                    {/* Instructions (when idle) */}
                    {!logic.isRecording && (
                        <View style={styles.instructionsContainer}>
                            <View style={styles.instructionRow}>
                                <MaterialCommunityIcons
                                    name="microphone"
                                    size={16}
                                    color={colors.text.muted}
                                    style={styles.instructionIcon}
                                />
                                <Text style={[styles.instructionText, { color: colors.text.muted }]}>
                                    {t('session.hint')}
                                </Text>
                            </View>
                        </View>
                    )}
                </View>
            </View>
        </ScreenWrapper>
    );
}

export const SessionScreen = memo(SessionScreenComponent);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
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
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    headerSpacer: {
        width: 40,
    },
    topicInfo: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    topicCard: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
    },
    topicTitle: {
        fontSize: 14,
        fontWeight: '500',
        flex: 1,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.lg,
    },
    statusContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xs,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    statusText: {
        fontSize: 18,
        fontWeight: '600',
    },
    statusHint: {
        fontSize: 14,
        textAlign: 'center',
    },
    timerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.xl,
    },
    timerDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    timerText: {
        fontSize: 32,
        fontWeight: '700',
        fontVariant: ['tabular-nums'],
    },
    recordButtonContainer: {
        marginBottom: Spacing.xxl,
    },
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
        letterSpacing: 1,
    },
    levelPercentage: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    levelBarBackground: {
        height: 16,
        borderRadius: 8,
        overflow: 'hidden',
    },
    levelBarFill: {
        height: '100%',
        borderRadius: 8,
    },
    analyzingContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    analyzingText: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: Spacing.lg,
    },
    analyzingHint: {
        fontSize: 14,
        marginTop: Spacing.sm,
        textAlign: 'center',
    },
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
        textAlign: 'center',
        flex: 1,
    },
    errorText: {
        fontSize: 16,
        marginBottom: Spacing.lg,
    },
    closeButtonLarge: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.md,
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default SessionScreen;
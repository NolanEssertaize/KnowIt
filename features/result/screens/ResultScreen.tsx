/**
 * @file ResultScreen.tsx
 * @description Session Result Screen - Theme Aware, Internationalized
 *
 * UPDATED: All hardcoded strings replaced with i18n translations
 */

import React, { memo, useCallback, useState, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    StatusBar,
    Share,
    Clipboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useLanguage, formatDate } from '@/i18n';

import { useSessionResult } from '../hooks/useSessionResult';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

type TabType = 'transcription' | 'analysis';

// ═══════════════════════════════════════════════════════════════════════════
// SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface AnalysisSectionProps {
    title: string;
    items: string[];
    emptyText: string;
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    iconColor: string;
}

const AnalysisSection = memo(function AnalysisSection({
                                                          title,
                                                          items,
                                                          emptyText,
                                                          icon,
                                                          iconColor,
                                                      }: AnalysisSectionProps) {
    const { colors } = useTheme();

    return (
        <GlassView style={styles.analysisSection} showBorder>
            <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name={icon} size={20} color={iconColor} />
                <Text style={[styles.sectionTitle, { color: colors.text.primary }]}>
                    {title}
                </Text>
            </View>
            {items.length > 0 ? (
                <View style={styles.itemsList}>
                    {items.map((item, index) => (
                        <View key={index} style={styles.itemRow}>
                            <View
                                style={[
                                    styles.itemBullet,
                                    { backgroundColor: iconColor },
                                ]}
                            />
                            <Text style={[styles.itemText, { color: colors.text.secondary }]}>
                                {item}
                            </Text>
                        </View>
                    ))}
                </View>
            ) : (
                <Text style={[styles.emptyText, { color: colors.text.muted }]}>
                    {emptyText}
                </Text>
            )}
        </GlassView>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ResultScreenComponent() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const { language } = useLanguage();

    const [activeTab, setActiveTab] = useState<TabType>('analysis');
    const [copied, setCopied] = useState(false);

    const logic = useSessionResult(params.sessionId as string);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleClose = useCallback(() => {
        router.back();
    }, [router]);

    const handleNewSession = useCallback(() => {
        router.replace(`/${params.topicId}/session`);
    }, [router, params.topicId]);

    const handleBackToTopic = useCallback(() => {
        router.replace(`/${params.topicId}`);
    }, [router, params.topicId]);

    const handleCopyTranscription = useCallback(async () => {
        if (logic.session?.transcription) {
            Clipboard.setString(logic.session.transcription);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [logic.session?.transcription]);

    const handleShare = useCallback(async () => {
        if (!logic.session) return;

        const content = `
${t('result.transcription.title')}:
${logic.session.transcription || t('result.transcription.empty')}

${t('result.analysis.correctPoints')}:
${logic.analysis?.correctPoints?.join('\n• ') || t('result.analysis.noCorrectPoints')}

${t('result.analysis.corrections')}:
${logic.analysis?.corrections?.join('\n• ') || t('result.analysis.noCorrections')}
        `.trim();

        try {
            await Share.share({
                message: content,
                title: t('result.title'),
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    }, [logic.session, logic.analysis, t]);

    // ─────────────────────────────────────────────────────────────────────────
    // COMPUTED VALUES
    // ─────────────────────────────────────────────────────────────────────────

    const scoreLabel = useMemo(() => {
        const score = logic.analysis?.score;
        if (score === undefined) return '';
        if (score >= 80) return t('result.score.excellent');
        if (score >= 60) return t('result.score.good');
        return t('result.score.needsWork');
    }, [logic.analysis?.score, t]);

    const scoreColor = useMemo(() => {
        const score = logic.analysis?.score;
        if (score === undefined) return colors.text.muted;
        if (score >= 80) return '#10B981'; // green
        if (score >= 60) return '#F59E0B'; // amber
        return '#EF4444'; // red
    }, [logic.analysis?.score, colors.text.muted]);

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (logic.isLoading) {
        return (
            <ScreenWrapper useSafeArea={false}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.text.primary} />
                        <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                            {t('result.loading')}
                        </Text>
                    </View>
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ERROR STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.session) {
        return (
            <ScreenWrapper useSafeArea={false}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={[styles.container, { paddingTop: insets.top }]}>
                    <View style={styles.loadingContainer}>
                        <MaterialCommunityIcons
                            name="alert-circle-outline"
                            size={48}
                            color={colors.text.muted}
                        />
                        <Text style={[styles.errorText, { color: colors.text.secondary }]}>
                            {t('result.analysis.empty')}
                        </Text>
                        <GlassButton
                            title={t('common.back')}
                            onPress={handleClose}
                            variant="secondary"
                        />
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
                    <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
                        <MaterialIcons name="close" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        {t('result.title')}
                    </Text>
                    <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
                        <MaterialIcons name="share" size={24} color={colors.text.primary} />
                    </TouchableOpacity>
                </View>

                {/* Score Card */}
                {logic.analysis?.score !== undefined && (
                    <View style={styles.scoreContainer}>
                        <GlassView style={styles.scoreCard} showBorder>
                            <View style={styles.scoreContent}>
                                <Text style={[styles.scoreValue, { color: scoreColor }]}>
                                    {logic.analysis.score}%
                                </Text>
                                <Text style={[styles.scoreLabel, { color: scoreColor }]}>
                                    {scoreLabel}
                                </Text>
                            </View>
                        </GlassView>
                    </View>
                )}

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <GlassView style={styles.tabsWrapper}>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'analysis' && {
                                    backgroundColor: colors.text.primary,
                                },
                            ]}
                            onPress={() => setActiveTab('analysis')}
                        >
                            <MaterialCommunityIcons
                                name="chart-bar"
                                size={18}
                                color={activeTab === 'analysis' ? colors.text.inverse : colors.text.muted}
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color: activeTab === 'analysis'
                                            ? colors.text.inverse
                                            : colors.text.muted,
                                    },
                                ]}
                            >
                                {t('result.tabs.analysis')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.tab,
                                activeTab === 'transcription' && {
                                    backgroundColor: colors.text.primary,
                                },
                            ]}
                            onPress={() => setActiveTab('transcription')}
                        >
                            <MaterialCommunityIcons
                                name="text"
                                size={18}
                                color={
                                    activeTab === 'transcription'
                                        ? colors.text.inverse
                                        : colors.text.muted
                                }
                            />
                            <Text
                                style={[
                                    styles.tabText,
                                    {
                                        color:
                                            activeTab === 'transcription'
                                                ? colors.text.inverse
                                                : colors.text.muted,
                                    },
                                ]}
                            >
                                {t('result.tabs.transcription')}
                            </Text>
                        </TouchableOpacity>
                    </GlassView>
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'analysis' ? (
                        <>
                            {/* Correct Points */}
                            <AnalysisSection
                                title={t('result.analysis.correctPoints')}
                                items={logic.analysis?.correctPoints || []}
                                emptyText={t('result.analysis.noCorrectPoints')}
                                icon="check-circle"
                                iconColor="#10B981"
                            />

                            {/* Corrections */}
                            <AnalysisSection
                                title={t('result.analysis.corrections')}
                                items={logic.analysis?.corrections || []}
                                emptyText={t('result.analysis.noCorrections')}
                                icon="alert-circle"
                                iconColor="#F59E0B"
                            />

                            {/* Missing Elements */}
                            <AnalysisSection
                                title={t('result.analysis.missingElements')}
                                items={logic.analysis?.missingElements || []}
                                emptyText={t('result.analysis.noMissingElements')}
                                icon="help-circle"
                                iconColor="#3B82F6"
                            />
                        </>
                    ) : (
                        /* Transcription Tab */
                        <GlassView style={styles.transcriptionCard} showBorder>
                            <View style={styles.transcriptionHeader}>
                                <Text style={[styles.transcriptionTitle, { color: colors.text.primary }]}>
                                    {t('result.transcription.title')}
                                </Text>
                                <TouchableOpacity
                                    onPress={handleCopyTranscription}
                                    style={[
                                        styles.copyButton,
                                        { backgroundColor: colors.surface.glass },
                                    ]}
                                >
                                    <MaterialIcons
                                        name={copied ? 'check' : 'content-copy'}
                                        size={16}
                                        color={colors.text.primary}
                                    />
                                    <Text style={[styles.copyButtonText, { color: colors.text.primary }]}>
                                        {copied ? t('result.transcription.copied') : t('result.transcription.copy')}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            <Text style={[styles.transcriptionText, { color: colors.text.secondary }]}>
                                {logic.session.transcription || t('result.transcription.empty')}
                            </Text>
                        </GlassView>
                    )}
                </ScrollView>

                {/* Bottom Actions */}
                <View style={[styles.bottomActions, { paddingBottom: insets.bottom + Spacing.md }]}>
                    <TouchableOpacity
                        style={[
                            styles.secondaryButton,
                            {
                                backgroundColor: colors.surface.glass,
                                borderColor: colors.glass.border,
                            },
                        ]}
                        onPress={handleBackToTopic}
                    >
                        <MaterialIcons name="arrow-back" size={20} color={colors.text.primary} />
                        <Text style={[styles.secondaryButtonText, { color: colors.text.primary }]}>
                            {t('result.actions.backToTopic')}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: colors.text.primary }]}
                        onPress={handleNewSession}
                    >
                        <MaterialCommunityIcons
                            name="microphone"
                            size={20}
                            color={colors.text.inverse}
                        />
                        <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>
                            {t('result.actions.newSession')}
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScreenWrapper>
    );
}

export const ResultScreen = memo(ResultScreenComponent);

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
    headerButton: {
        padding: Spacing.xs,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scoreContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    scoreCard: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
    },
    scoreContent: {
        alignItems: 'center',
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: '700',
    },
    scoreLabel: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: Spacing.xs,
    },
    tabsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    tabsWrapper: {
        flexDirection: 'row',
        borderRadius: BorderRadius.lg,
        padding: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: 6,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    analysisSection: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    itemsList: {
        gap: Spacing.xs,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
    },
    itemBullet: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 7,
    },
    itemText: {
        flex: 1,
        fontSize: 14,
        lineHeight: 20,
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
    transcriptionCard: {
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
    },
    transcriptionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    transcriptionTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    copyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.sm,
    },
    copyButtonText: {
        fontSize: 12,
        fontWeight: '500',
    },
    transcriptionText: {
        fontSize: 14,
        lineHeight: 22,
    },
    bottomActions: {
        flexDirection: 'row',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        gap: Spacing.sm,
    },
    secondaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.xs,
    },
    secondaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    primaryButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    primaryButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    loadingText: {
        fontSize: 16,
    },
    errorText: {
        fontSize: 16,
        marginBottom: Spacing.md,
    },
});

export default ResultScreen;
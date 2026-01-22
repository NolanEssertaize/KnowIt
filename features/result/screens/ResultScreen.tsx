/**
 * @file ResultScreen.tsx
 * @description Écran de résultats d'analyse - Monochrome Theme
 *
 * FIXES:
 * - "Réessayer" button: Glass/outline style (visible)
 * - "Terminer" button: Solid WHITE bg + BLACK text (high contrast)
 * - Removed all colored gradients
 * - All stat badges use monochrome
 */

import React, { memo, useMemo } from 'react';
import {
    View,
    Text,
    ScrollView,
    Pressable,
    StyleSheet,
    Platform,
    ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { GlassView } from '@/shared/components';
import { Spacing, BorderRadius } from '@/theme';

import { useResult } from '../hooks/useResult';
import { ScoreGauge } from '../components/ScoreGauge';
import { AnalysisSection } from '../components/AnalysisSection';

// ═══════════════════════════════════════════════════════════════════════════
// STAT BADGE COMPONENT - Monochrome
// ═══════════════════════════════════════════════════════════════════════════

interface StatBadgeProps {
    icon: keyof typeof MaterialIcons.glyphMap;
    count: number;
    label: string;
}

const StatBadge = memo(function StatBadge({ icon, count, label }: StatBadgeProps) {
    return (
        <View style={styles.statBadge}>
            <View style={styles.statIconContainer}>
                {/* Monochrome: WHITE icon */}
                <MaterialIcons name={icon} size={24} color="#FFFFFF" />
            </View>
            {/* Monochrome: WHITE count */}
            <Text style={styles.statCount}>{count}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ResultScreenComponent(): React.JSX.Element {
    const insets = useSafeAreaInsets();
    const { score, sections, summary, handleClose, handleRetry, isLoading } = useResult();

    // Monochrome sections (remove colored variants)
    const monochromeSection = useMemo(() => {
        return sections.map(section => ({
            ...section,
            color: '#FFFFFF',
            glowColor: undefined,
        }));
    }, [sections]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Chargement des résultats...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[
                    styles.scrollContent,
                    { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
                ]}
                showsVerticalScrollIndicator={false}
            >
                {/* Header avec bouton fermer */}
                <View style={styles.header}>
                    <Pressable style={styles.closeButton} onPress={handleClose}>
                        <MaterialIcons name="close" size={24} color="#FFFFFF" />
                    </Pressable>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.title}>Session terminée</Text>
                        <Text style={styles.subtitle}>Voici votre analyse détaillée</Text>
                    </View>
                </View>

                {/* Séparateur visuel */}
                <View style={styles.divider} />

                {/* Score Gauge */}
                <ScoreGauge
                    value={score.value}
                    label={score.label}
                    color="#FFFFFF"
                />

                {/* Quick Summary - Monochrome */}
                <GlassView variant="default" style={styles.summaryContainer}>
                    <Text style={styles.summaryTitle}>Résumé rapide</Text>
                    <View style={styles.statsRow}>
                        <StatBadge
                            icon="check-circle"
                            count={summary.validCount}
                            label="Validés"
                        />
                        <StatBadge
                            icon="error"
                            count={summary.correctionsCount}
                            label="À corriger"
                        />
                        <StatBadge
                            icon="cancel"
                            count={summary.missingCount}
                            label="Manquants"
                        />
                    </View>
                    <View style={styles.summaryDivider} />
                    <Text style={styles.summaryText}>
                        {summary.totalPoints} points évalués au total
                    </Text>
                </GlassView>

                {/* Sections d'analyse détaillées */}
                <View style={styles.sectionsContainer}>
                    <Text style={styles.sectionHeader}>Détails de l'analyse</Text>
                    {monochromeSection.map((section) => (
                        <AnalysisSection
                            key={section.id}
                            title={section.title}
                            icon={section.icon}
                            items={section.items}
                            color="#FFFFFF"
                            glowColor={undefined}
                        />
                    ))}
                </View>

                {/* Actions - HIGH CONTRAST BUTTONS */}
                <View style={styles.actionsContainer}>
                    {/* "Réessayer" - Outline/Glass style */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.buttonOutline,
                            pressed && styles.buttonPressed,
                        ]}
                        onPress={handleRetry}
                    >
                        <MaterialIcons name="refresh" size={20} color="#FFFFFF" />
                        <Text style={styles.buttonOutlineText}>Réessayer</Text>
                    </Pressable>

                    <View style={styles.actionSpacer} />

                    {/* "Terminer" - SOLID WHITE (HIGH CONTRAST) */}
                    <Pressable
                        style={({ pressed }) => [
                            styles.buttonPrimary,
                            pressed && styles.buttonPrimaryPressed,
                        ]}
                        onPress={handleClose}
                    >
                        <MaterialIcons name="done" size={20} color="#000000" />
                        <Text style={styles.buttonPrimaryText}>Terminer</Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    );
}

export const ResultScreen = memo(ResultScreenComponent);
export default ResultScreen;

// ═══════════════════════════════════════════════════════════════════════════
// STYLES - Monochrome Theme
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: Spacing.md,
    },

    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },

    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    headerTextContainer: {
        flex: 1,
        paddingTop: Spacing.xs,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },

    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 22,
    },

    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: Spacing.xl,
    },

    // Summary
    summaryContainer: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
    },

    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },

    // Stat Badge - Monochrome
    statBadge: {
        alignItems: 'center',
        flex: 1,
    },

    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },

    statCount: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF', // FIX: Explicit WHITE
        marginBottom: 2,
    },

    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },

    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: Spacing.md,
    },

    summaryText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
    },

    // Sections
    sectionsContainer: {
        marginBottom: Spacing.xl,
    },

    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
    },

    // Actions Container
    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },

    actionSpacer: {
        width: Spacing.md,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // BUTTON STYLES - HIGH CONTRAST
    // ═══════════════════════════════════════════════════════════════════════

    // Outline button ("Réessayer") - Glass style, visible border
    buttonOutline: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: BorderRadius.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    buttonOutlineText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    buttonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.98 }],
    },

    // Primary button ("Terminer") - SOLID WHITE, HIGH CONTRAST
    buttonPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: BorderRadius.xl,
        // HIGH CONTRAST: Solid WHITE background
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#FFFFFF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    buttonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        // HIGH CONTRAST: BLACK text on WHITE button
        color: '#000000',
    },

    buttonPrimaryPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },
});
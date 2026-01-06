/**
 * Analysis Result Screen
 * Écran des résultats d'analyse - Design Glassmorphism
 */

import React from 'react';
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassView, GlassCard } from '@/components/GlassView';
import { GlassButton } from '@/components/GlassButton';
import { GlassColors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

interface SectionProps {
    title: string;
    icon: string;
    data: string[];
    color: string;
    glowColor: string;
}

export default function Result() {
    const params = useLocalSearchParams();
    const router = useRouter();

    const valid = params.valid ? JSON.parse(params.valid as string) : [];
    const corrections = params.corrections
        ? JSON.parse(params.corrections as string)
        : [];
    const missing = params.missing ? JSON.parse(params.missing as string) : [];

    // Calcul du score
    const totalPoints = valid.length + corrections.length + missing.length;
    const score = totalPoints > 0 ? Math.round((valid.length / totalPoints) * 100) : 0;

    const getScoreColor = () => {
        if (score >= 70) return GlassColors.semantic.success;
        if (score >= 40) return GlassColors.semantic.warning;
        return GlassColors.semantic.error;
    };

    const getScoreLabel = () => {
        if (score >= 70) return 'Excellent !';
        if (score >= 40) return 'Bien, continuez !';
        return 'À améliorer';
    };

    const Section = ({ title, icon, data, color, glowColor }: SectionProps) => {
        if (data.length === 0) return null;

        return (
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <View style={[styles.sectionIcon, { backgroundColor: `${color}20` }]}>
                        <Text style={styles.sectionIconText}>{icon}</Text>
                    </View>
                    <Text style={[styles.sectionTitle, { color }]}>{title}</Text>
                    <View style={[styles.badge, { backgroundColor: `${color}20` }]}>
                        <Text style={[styles.badgeText, { color }]}>{data.length}</Text>
                    </View>
                </View>

                <GlassView
                    style={styles.sectionContent}
                    glow
                    glowColor={glowColor}
                >
                    {data.map((item, i) => (
                        <View
                            key={i}
                            style={[
                                styles.pointContainer,
                                i !== data.length - 1 && styles.pointBorder,
                            ]}
                        >
                            <View style={[styles.pointDot, { backgroundColor: color }]} />
                            <Text style={styles.pointText}>{item}</Text>
                        </View>
                    ))}
                </GlassView>
            </View>
        );
    };

    return (
        <ScreenWrapper useSafeArea={false} padding={0}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header avec score */}
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.closeButton}
                        onPress={() => router.back()}
                        activeOpacity={0.7}
                    >
                        <GlassView style={styles.closeButtonInner}>
                            <Text style={styles.closeButtonText}>✕</Text>
                        </GlassView>
                    </TouchableOpacity>

                    <GlassView
                        variant="accent"
                        glow
                        glowColor={getScoreColor() + '40'}
                        style={styles.scoreCard}
                    >
                        <Text style={styles.scoreLabel}>VOTRE SCORE</Text>
                        <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
                            {score}%
                        </Text>
                        <Text style={styles.scoreMessage}>{getScoreLabel()}</Text>
                    </GlassView>

                    {/* Stats rapides */}
                    <View style={styles.statsRow}>
                        <GlassView style={styles.statItem}>
                            <Text style={[styles.statValue, { color: GlassColors.semantic.success }]}>
                                {valid.length}
                            </Text>
                            <Text style={styles.statLabel}>Corrects</Text>
                        </GlassView>
                        <GlassView style={styles.statItem}>
                            <Text style={[styles.statValue, { color: GlassColors.semantic.warning }]}>
                                {corrections.length}
                            </Text>
                            <Text style={styles.statLabel}>À corriger</Text>
                        </GlassView>
                        <GlassView style={styles.statItem}>
                            <Text style={[styles.statValue, { color: GlassColors.semantic.error }]}>
                                {missing.length}
                            </Text>
                            <Text style={styles.statLabel}>Manquants</Text>
                        </GlassView>
                    </View>
                </View>

                {/* Sections détaillées */}
                <View style={styles.sectionsContainer}>
                    <Section
                        title="Correct"
                        icon="✓"
                        data={valid}
                        color={GlassColors.semantic.success}
                        glowColor={GlassColors.semantic.successGlow}
                    />

                    <Section
                        title="À corriger"
                        icon="!"
                        data={corrections}
                        color={GlassColors.semantic.warning}
                        glowColor={GlassColors.semantic.warningGlow}
                    />

                    <Section
                        title="Manquant"
                        icon="✗"
                        data={missing}
                        color={GlassColors.semantic.error}
                        glowColor={GlassColors.semantic.errorGlow}
                    />

                    {totalPoints === 0 && (
                        <GlassView style={styles.emptyCard}>
                            <Text style={styles.emptyIcon}>📝</Text>
                            <Text style={styles.emptyText}>
                                Aucune analyse disponible pour cette session
                            </Text>
                        </GlassView>
                    )}
                </View>

                {/* Bouton de retour */}
                <View style={styles.footer}>
                    <GlassButton
                        title="Terminer"
                        variant="primary"
                        size="lg"
                        fullWidth
                        onPress={() => router.back()}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    scrollContent: {
        padding: Spacing.lg,
        paddingTop: Spacing.xxl,
    },
    header: {
        marginBottom: Spacing.xl,
    },
    closeButton: {
        position: 'absolute',
        top: 0,
        right: 0,
        zIndex: 10,
    },
    closeButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: GlassColors.text.secondary,
        fontSize: 18,
        fontWeight: '600',
    },
    scoreCard: {
        padding: Spacing.xxl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    scoreLabel: {
        color: GlassColors.text.secondary,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 2,
        marginBottom: Spacing.sm,
    },
    scoreValue: {
        fontSize: 64,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    scoreMessage: {
        color: GlassColors.text.primary,
        fontSize: 18,
        fontWeight: '500',
    },
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    statItem: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        marginBottom: Spacing.xs,
    },
    statLabel: {
        color: GlassColors.text.secondary,
        fontSize: 12,
    },
    sectionsContainer: {
        gap: Spacing.lg,
    },
    section: {
        marginBottom: Spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
        paddingHorizontal: Spacing.xs,
    },
    sectionIcon: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    sectionIconText: {
        fontSize: 14,
        fontWeight: '700',
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        flex: 1,
    },
    badge: {
        paddingHorizontal: Spacing.sm,
        paddingVertical: 2,
        borderRadius: BorderRadius.sm,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    sectionContent: {
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
    },
    pointContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        paddingVertical: Spacing.sm,
    },
    pointBorder: {
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },
    pointDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginTop: 7,
        marginRight: Spacing.md,
    },
    pointText: {
        flex: 1,
        color: GlassColors.text.primary,
        fontSize: 15,
        lineHeight: 22,
    },
    emptyCard: {
        padding: Spacing.xxl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: Spacing.md,
    },
    emptyText: {
        color: GlassColors.text.secondary,
        fontSize: 16,
        textAlign: 'center',
    },
    footer: {
        marginTop: Spacing.xxl,
        paddingBottom: Spacing.xl,
    },
});
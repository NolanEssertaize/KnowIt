/**
 * @file SessionCard.tsx
 * @description Session Card Component - Theme Aware, Internationalized
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useLanguage, formatDate, formatDuration } from '@/i18n';

import type { Session } from '@/store';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SessionCardProps {
    session: Session;
    index: number;
    onPress: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const SessionCard = memo(function SessionCard({
    session,
    index,
    onPress,
}: SessionCardProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { language } = useLanguage();

    const hasScore = session.analysis?.score !== undefined;
    const score = session.analysis?.score;
    const dateText = session.createdAt
        ? formatDate(session.createdAt, language)
        : t('sessionCard.date', { date: '' });
    const durationText = session.duration
        ? formatDuration(session.duration)
        : '0:00';

    // Score color based on value
    const getScoreColor = () => {
        if (!hasScore || score === undefined) return colors.text.muted;
        if (score >= 80) return '#10B981'; // green
        if (score >= 60) return '#F59E0B'; // amber
        return '#EF4444'; // red
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <GlassView style={styles.container} showBorder>
                {/* Session Number Badge */}
                <View style={[styles.badge, { backgroundColor: colors.surface.glass }]}>
                    <Text style={[styles.badgeText, { color: colors.text.primary }]}>
                        #{index + 1}
                    </Text>
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {/* Date */}
                    <View style={styles.row}>
                        <MaterialCommunityIcons
                            name="calendar"
                            size={14}
                            color={colors.text.muted}
                        />
                        <Text style={[styles.dateText, { color: colors.text.secondary }]}>
                            {dateText}
                        </Text>
                    </View>

                    {/* Duration */}
                    <View style={styles.row}>
                        <MaterialCommunityIcons
                            name="clock-outline"
                            size={14}
                            color={colors.text.muted}
                        />
                        <Text style={[styles.durationText, { color: colors.text.muted }]}>
                            {durationText}
                        </Text>
                    </View>
                </View>

                {/* Score */}
                <View style={styles.scoreContainer}>
                    {hasScore ? (
                        <>
                            <Text style={[styles.scoreValue, { color: getScoreColor() }]}>
                                {score}%
                            </Text>
                            <Text style={[styles.scoreLabel, { color: colors.text.muted }]}>
                                {t('result.score.title')}
                            </Text>
                        </>
                    ) : (
                        <Text style={[styles.noScoreText, { color: colors.text.muted }]}>
                            {t('sessionCard.noScore')}
                        </Text>
                    )}
                </View>

                {/* Chevron */}
                <MaterialCommunityIcons
                    name="chevron-right"
                    size={24}
                    color={colors.text.muted}
                />
            </GlassView>
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    badge: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    badgeText: {
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        gap: 4,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    dateText: {
        fontSize: 14,
        fontWeight: '500',
    },
    durationText: {
        fontSize: 12,
    },
    scoreContainer: {
        alignItems: 'center',
        minWidth: 50,
    },
    scoreValue: {
        fontSize: 18,
        fontWeight: '700',
    },
    scoreLabel: {
        fontSize: 10,
        textTransform: 'uppercase',
    },
    noScoreText: {
        fontSize: 12,
        fontStyle: 'italic',
    },
});

export default SessionCard;
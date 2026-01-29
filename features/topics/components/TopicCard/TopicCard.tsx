/**
 * @file TopicCard.tsx
 * @description Topic Card Component - Theme Aware, Internationalized
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useLanguage, formatRelativeTime } from '@/i18n';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TopicWithMeta {
    id: string;
    title: string;
    sessionCount?: number;
    lastSessionAt?: string;
    isFavorite?: boolean;
}

interface TopicCardProps {
    topic: TopicWithMeta;
    onPress: () => void;
    style?: ViewStyle;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicCard = memo(function TopicCard({
                                                     topic,
                                                     onPress,
                                                     style,
                                                 }: TopicCardProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { language } = useLanguage();

    const sessionCount = topic.sessionCount || 0;
    const lastSessionText = topic.lastSessionAt
        ? formatRelativeTime(topic.lastSessionAt, t)
        : t('topics.card.noSessions');

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
            <GlassView style={[styles.container, style]} showBorder>
                {/* Left: Icon */}
                <View style={[styles.iconContainer, { backgroundColor: colors.surface.glass }]}>
                    <MaterialCommunityIcons
                        name="book-open-variant"
                        size={24}
                        color={colors.text.primary}
                    />
                </View>

                {/* Center: Content */}
                <View style={styles.content}>
                    <Text
                        style={[styles.title, { color: colors.text.primary }]}
                        numberOfLines={1}
                    >
                        {topic.title}
                    </Text>
                    <View style={styles.metaRow}>
                        <View style={styles.metaItem}>
                            <MaterialCommunityIcons
                                name="microphone"
                                size={14}
                                color={colors.text.muted}
                            />
                            <Text style={[styles.metaText, { color: colors.text.secondary }]}>
                                {t('topics.card.sessions', { count: sessionCount })}
                            </Text>
                        </View>
                        <Text style={[styles.metaDot, { color: colors.text.muted }]}>•</Text>
                        <Text
                            style={[styles.metaText, { color: colors.text.muted }]}
                            numberOfLines={1}
                        >
                            {lastSessionText}
                        </Text>
                    </View>
                </View>

                {/* Right: Chevron */}
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
        gap: Spacing.md,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    metaDot: {
        fontSize: 12,
        marginHorizontal: 6,
    },
});

export default TopicCard;
/**
 * Topic Detail Screen
 * Historique des sessions d'un sujet - Design Glassmorphism
 */

import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore } from '../../store/useStore';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassView, GlassCard } from '@/components/GlassView';
import { GlassButton } from '@/components/GlassButton';
import { GlassColors, BorderRadius, Spacing } from '@/constants/theme';

interface Session {
    id: string;
    date: string;
    transcription: string;
}

export default function TopicDetail() {
    const { topicId } = useLocalSearchParams();
    const router = useRouter();
    const topic = useStore((state) =>
        state.topics.find((t) => t.id === topicId)
    );

    if (!topic) {
        return (
            <ScreenWrapper centered>
                <Text style={styles.errorText}>Topic introuvable</Text>
            </ScreenWrapper>
        );
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const renderSession = ({ item }: { item: Session }) => (
        <GlassCard style={styles.sessionCard}>
            <View style={styles.sessionHeader}>
                <View style={styles.dateBadge}>
                    <Text style={styles.dateText}>{formatDate(item.date)}</Text>
                </View>
            </View>
            <Text numberOfLines={3} style={styles.transcription}>
                {item.transcription || 'Aucune transcription disponible'}
            </Text>
        </GlassCard>
    );

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🎤</Text>
            <Text style={styles.emptyTitle}>Aucune session</Text>
            <Text style={styles.emptySubtitle}>
                Démarrez votre première session pour commencer à réviser ce sujet
            </Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.header}>
            <GlassView variant="accent" glow glowColor={GlassColors.accent.glow} style={styles.topicBanner}>
                <Text style={styles.topicTitle}>{topic.title}</Text>
                <Text style={styles.topicStats}>
                    {topic.sessions.length} session{topic.sessions.length !== 1 ? 's' : ''} enregistrée{topic.sessions.length !== 1 ? 's' : ''}
                </Text>
            </GlassView>

            <GlassButton
                title="🎙️  Démarrer une session"
                variant="primary"
                size="lg"
                fullWidth
                onPress={() => router.push(`/${topicId}/session`)}
                style={styles.startButton}
            />

            {topic.sessions.length > 0 && (
                <Text style={styles.sectionTitle}>Historique</Text>
            )}
        </View>
    );

    return (
        <ScreenWrapper useSafeArea={false} padding={0}>
            <FlatList
                data={topic.sessions}
                keyExtractor={(item) => item.id}
                renderItem={renderSession}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    listContent: {
        padding: Spacing.lg,
        flexGrow: 1,
    },
    header: {
        marginBottom: Spacing.lg,
    },
    topicBanner: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    topicTitle: {
        color: GlassColors.text.primary,
        fontSize: 28,
        fontWeight: '700',
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    topicStats: {
        color: GlassColors.text.secondary,
        fontSize: 14,
    },
    startButton: {
        marginBottom: Spacing.xl,
    },
    sectionTitle: {
        color: GlassColors.text.secondary,
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        marginLeft: Spacing.xs,
    },
    sessionCard: {
        padding: Spacing.lg,
    },
    sessionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    dateBadge: {
        backgroundColor: GlassColors.glass.background,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.sm,
    },
    dateText: {
        color: GlassColors.accent.primary,
        fontSize: 12,
        fontWeight: '500',
    },
    transcription: {
        color: GlassColors.text.secondary,
        fontSize: 15,
        lineHeight: 22,
    },
    separator: {
        height: Spacing.md,
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: Spacing.xxl,
    },
    emptyIcon: {
        fontSize: 56,
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        color: GlassColors.text.primary,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        color: GlassColors.text.secondary,
        fontSize: 15,
        textAlign: 'center',
        paddingHorizontal: Spacing.lg,
        lineHeight: 22,
    },
    errorText: {
        color: GlassColors.text.secondary,
        fontSize: 16,
    },
});
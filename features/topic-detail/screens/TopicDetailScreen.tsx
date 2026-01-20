/**
 * @file TopicDetailScreen.tsx
 * @description Écran de détail d'un topic (Vue Dumb)
 *
 * FIX: Added useLocalSearchParams to get topicId from route and pass it to useTopicDetail
 */

import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';

import { useTopicDetail } from '../hooks/useTopicDetail';
import type { SessionItemData } from '../hooks/useTopicDetail';
import { SessionHistoryCard } from '../components/SessionHistoryCard';
import { styles } from './TopicDetailScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicDetailScreen = memo(function TopicDetailScreen() {
    // ─────────────────────────────────────────────────────────────────────────
    // FIX: Get topicId from route params
    // ─────────────────────────────────────────────────────────────────────────
    const { topicId } = useLocalSearchParams<{ topicId: string }>();

    // Setup Hook - Logic Controller (pass topicId)
    const logic = useTopicDetail(topicId ?? '');

    // ─────────────────────────────────────────────────────────────────────────
    // GUARD: Loading state
    // ─────────────────────────────────────────────────────────────────────────
    if (logic.isLoading && !logic.topic) {
        return (
            <ScreenWrapper centered>
                <ActivityIndicator size="large" color={GlassColors.accent.primary} />
                <Text style={styles.loadingText}>Chargement...</Text>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GUARD: Error state
    // ─────────────────────────────────────────────────────────────────────────
    if (logic.error && !logic.topic) {
        return (
            <ScreenWrapper centered>
                <MaterialCommunityIcons
                    name="alert-circle-outline"
                    size={64}
                    color={GlassColors.semantic.error}
                />
                <Text style={styles.errorText}>{logic.error}</Text>
                <GlassButton
                    title="Réessayer"
                    onPress={logic.refreshTopic}
                    variant="primary"
                    style={styles.retryButton}
                />
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // GUARD: Topic not found
    // ─────────────────────────────────────────────────────────────────────────
    if (!logic.topic) {
        return (
            <ScreenWrapper centered>
                <MaterialCommunityIcons
                    name="book-off-outline"
                    size={64}
                    color={GlassColors.text.tertiary}
                />
                <Text style={styles.errorText}>Topic introuvable</Text>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const renderHeader = useCallback(
        () => (
            <View style={styles.header}>
                <GlassView
                    variant="accent"
                    glow
                    glowColor={GlassColors.accent.glow}
                    style={styles.topicBanner}
                >
                    <Text style={styles.topicTitle}>{logic.topic?.title}</Text>
                    <Text style={styles.topicStats}>
                        {logic.sessions.length} session
                        {logic.sessions.length !== 1 ? 's' : ''} enregistrée
                        {logic.sessions.length !== 1 ? 's' : ''}
                    </Text>
                </GlassView>

                {/* Section title */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Historique des sessions</Text>
                </View>
            </View>
        ),
        [logic.topic?.title, logic.sessions.length]
    );

    const renderSessionCard = useCallback(
        ({ item }: { item: SessionItemData }) => (
            <SessionHistoryCard
                session={item.session}
                formattedDate={item.formattedDate}
            />
        ),
        []
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                    name="microphone-off"
                    size={64}
                    color={GlassColors.text.tertiary}
                    style={styles.emptyIcon}
                />
                <Text style={styles.emptyTitle}>Aucune session</Text>
                <Text style={styles.emptySubtitle}>
                    Commencez une session d'enregistrement pour tester vos connaissances
                </Text>
            </View>
        ),
        []
    );

    const keyExtractor = useCallback(
        (item: SessionItemData) => item.session.id,
        []
    );

    // Prepare sessions data with formatted dates
    const sessionsData: SessionItemData[] = logic.sessions.map((session) => ({
        session,
        formattedDate: new Date(session.date).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }),
    }));

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea padding={0}>
            <FlatList
                data={sessionsData}
                keyExtractor={keyExtractor}
                renderItem={renderSessionCard}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={logic.isLoading}
                        onRefresh={logic.refreshTopic}
                        tintColor={GlassColors.accent.primary}
                        colors={[GlassColors.accent.primary]}
                    />
                }
            />

            {/* FAB pour nouvelle session */}
            <GlassButton
                title="Nouvelle session"
                onPress={logic.handleStartSession}
                variant="primary"
                fullWidth
                style={styles.fab}
                leftIcon={
                    <MaterialCommunityIcons
                        name="microphone"
                        size={24}
                        color={GlassColors.text.primary}
                    />
                }
            />
        </ScreenWrapper>
    );
});
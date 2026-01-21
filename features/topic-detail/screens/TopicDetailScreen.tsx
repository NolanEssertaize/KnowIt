/**
 * @file TopicDetailScreen.tsx
 * @description Écran de détail d'un topic (Vue Dumb)
 *
 * FIXES:
 * - Fixed SessionHistoryCard props (was passing session/formattedDate, now passes data)
 * - Added back button in header for navigation
 * - Fixed FAB button positioning - wrapped in View container to prevent overflow
 */

import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { GlassColors, Spacing, Shadows, BorderRadius } from '@/theme';

import { useTopicDetail } from '../hooks/useTopicDetail';
import type { SessionItemData } from '../hooks/useTopicDetail';
import { SessionHistoryCard } from '../components/SessionHistoryCard';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicDetailScreen = memo(function TopicDetailScreen() {
    // ─────────────────────────────────────────────────────────────────────────
    // HOOKS
    // ─────────────────────────────────────────────────────────────────────────
    const { topicId } = useLocalSearchParams<{ topicId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Setup Hook - Logic Controller (pass topicId)
    const logic = useTopicDetail(topicId ?? '');

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────
    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

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
    // GUARD: Topic not found - Added back button
    // ─────────────────────────────────────────────────────────────────────────
    if (!logic.topic) {
        return (
            <ScreenWrapper useSafeArea padding={0}>
                {/* Header with back button */}
                <View style={[styles.navHeader, { paddingTop: insets.top + Spacing.md }]}>
                    <Pressable style={styles.backButton} onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color={GlassColors.text.primary} />
                    </Pressable>
                    <Text style={styles.navTitle}>Détail du sujet</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Error content */}
                <View style={styles.errorStateContainer}>
                    <MaterialCommunityIcons
                        name="book-off-outline"
                        size={64}
                        color={GlassColors.text.tertiary}
                    />
                    <Text style={styles.errorText}>Topic introuvable</Text>
                    <GlassButton
                        title="Retour"
                        onPress={handleBack}
                        variant="outline"
                        style={styles.retryButton}
                    />
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const renderHeader = useCallback(
        () => (
            <View style={styles.header}>
                {/* Navigation header */}
                <View style={styles.navHeader}>
                    <Pressable style={styles.backButton} onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color={GlassColors.text.primary} />
                    </Pressable>
                    <Text style={styles.navTitle} numberOfLines={1}>{logic.topic?.title}</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Topic banner */}
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
        [logic.topic?.title, logic.sessions.length, handleBack]
    );

    // FIX: Pass data prop instead of session/formattedDate separately
    const renderSessionCard = useCallback(
        ({ item }: { item: SessionItemData }) => (
            <SessionHistoryCard data={item} />
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

            {/* FAB Container - FIX: Proper positioning with explicit container */}
            <View style={[styles.fabContainer, { paddingBottom: insets.bottom + Spacing.md }]}>
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
            </View>
        </ScreenWrapper>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    // ═══════════════════════════════════════════════════════════════════════
    // LIST CONTENT
    // ═══════════════════════════════════════════════════════════════════════
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 120, // Extra space for FAB
        flexGrow: 1,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // NAVIGATION HEADER
    // ═══════════════════════════════════════════════════════════════════════
    navHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.md,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: GlassColors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    navTitle: {
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

    // ═══════════════════════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════════════════════
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

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION HEADER
    // ═══════════════════════════════════════════════════════════════════════
    sectionHeader: {
        marginBottom: Spacing.md,
    },
    sectionTitle: {
        color: GlassColors.text.secondary,
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: Spacing.xs,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════════════════════════
    loadingText: {
        color: GlassColors.text.secondary,
        fontSize: 16,
        marginTop: Spacing.md,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ERROR STATE
    // ═══════════════════════════════════════════════════════════════════════
    errorStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },
    errorText: {
        color: GlassColors.text.secondary,
        fontSize: 16,
        marginTop: Spacing.md,
        textAlign: 'center',
    },
    retryButton: {
        marginTop: Spacing.lg,
        minWidth: 160,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // EMPTY STATE
    // ═══════════════════════════════════════════════════════════════════════
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
        paddingHorizontal: Spacing.lg,
    },
    emptyIcon: {
        marginBottom: Spacing.lg,
        opacity: 0.8,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: GlassColors.text.primary,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },
    emptySubtitle: {
        fontSize: 14,
        color: GlassColors.text.secondary,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 280,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FAB (Floating Action Button) - FIXED
    // ═══════════════════════════════════════════════════════════════════════
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        backgroundColor: 'transparent',
    },
});

export default TopicDetailScreen;
/**
 * @file TopicDetailScreen.tsx
 * @description Écran de détail d'un topic - Monochrome Theme
 *
 * FIXES:
 * - REMOVED duplicate title banner (kept only nav header title)
 * - Fixed "Nouvelle Session" button visibility (solid white bg, black text)
 * - All icons use monochrome colors
 * - Native back button style
 * - HOOKS FIX: All useCallback hooks are now BEFORE any conditional returns
 */

import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable, StyleSheet, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { Spacing, BorderRadius } from '@/theme';

import { useTopicDetail } from '../hooks/useTopicDetail';
import type { SessionItemData } from '../hooks/useTopicDetail';
import { SessionHistoryCard } from '../components/SessionHistoryCard';

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    // List content
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 120,
        flexGrow: 1,
    },

    // Navigation header
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
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    navTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginHorizontal: Spacing.md,
    },

    headerSpacer: {
        width: 40,
    },

    // Stats summary (replaces the big banner)
    statsSummary: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.lg,
        paddingVertical: Spacing.md,
        marginBottom: Spacing.lg,
    },

    statItem: {
        alignItems: 'center',
    },

    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF',
    },

    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginTop: 2,
    },

    // Section header
    sectionHeader: {
        marginBottom: Spacing.md,
    },

    sectionTitle: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 14,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginLeft: Spacing.xs,
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    loadingText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        marginTop: Spacing.md,
    },

    // Error
    errorStateContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
    },

    errorText: {
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: 16,
        marginTop: Spacing.md,
        textAlign: 'center',
    },

    retryButton: {
        marginTop: Spacing.lg,
    },

    // Empty state
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl,
    },

    emptyIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },

    emptySubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        lineHeight: 22,
    },

    // FAB Container
    fabContainer: {
        position: 'absolute',
        bottom: Spacing.xl,
        left: Spacing.lg,
        right: Spacing.lg,
    },

    // FAB Button - HIGH CONTRAST (Solid white bg, black text)
    fabButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: BorderRadius.xl,
        // SOLID WHITE BACKGROUND
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
            },
            android: {
                elevation: 8,
            },
        }),
    },

    fabButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },

    fabText: {
        fontSize: 16,
        fontWeight: '600',
        // BLACK TEXT on white button
        color: '#000000',
    },

    // Session card wrapper
    sessionCardWrapper: {
        marginBottom: Spacing.md,
    },
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicDetailScreen = memo(function TopicDetailScreen() {
    // ─────────────────────────────────────────────────────────────────────────
    // HOOKS - All hooks MUST be called before any conditional returns
    // ─────────────────────────────────────────────────────────────────────────
    const { topicId } = useLocalSearchParams<{ topicId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const logic = useTopicDetail(topicId ?? '');

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS - Define ALL useCallback hooks BEFORE any returns
    // ─────────────────────────────────────────────────────────────────────────

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleStartSession = useCallback(() => {
        if (topicId) {
            router.push(`/${topicId}/session`);
        }
    }, [router, topicId]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS - Define ALL useCallback hooks BEFORE any returns
    // ─────────────────────────────────────────────────────────────────────────

    const renderHeader = useCallback(
        () => (
            <View>
                {/* Navigation header - THIS IS THE ONLY TITLE NOW */}
                <View style={styles.navHeader}>
                    <Pressable style={styles.backButton} onPress={handleBack}>
                        <MaterialIcons
                            name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}
                            size={24}
                            color="#FFFFFF"
                        />
                    </Pressable>
                    <Text style={styles.navTitle} numberOfLines={1}>
                        {logic.topic?.title}
                    </Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Stats summary */}
                <View style={styles.statsSummary}>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>{logic.sessions.length}</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statValue}>
                            {logic.sessions.length > 0
                                ? Math.round(
                                    logic.sessions.reduce((acc, s) => {
                                        const valid = s.session.analysis?.valid?.length || 0;
                                        const total = valid + (s.session.analysis?.corrections?.length || 0) + (s.session.analysis?.missing?.length || 0);
                                        return acc + (total > 0 ? (valid / total) * 100 : 0);
                                    }, 0) / logic.sessions.length
                                )
                                : 0}
                            %
                        </Text>
                        <Text style={styles.statLabel}>Score Moyen</Text>
                    </View>
                </View>

                {/* Section header */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Historique</Text>
                </View>
            </View>
        ),
        [logic.topic, logic.sessions, handleBack]
    );

    const renderSessionCard = useCallback(
        ({ item }: { item: SessionItemData }) => (
            <View style={styles.sessionCardWrapper}>
                <SessionHistoryCard
                    data={item}
                    onPress={() => logic.handleSessionPress(item.session.id)}
                />
            </View>
        ),
        [logic.handleSessionPress]
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                    <MaterialCommunityIcons
                        name="microphone-outline"
                        size={40}
                        color="rgba(255,255,255,0.5)"
                    />
                </View>
                <Text style={styles.emptyTitle}>Aucune session</Text>
                <Text style={styles.emptySubtitle}>
                    Commencez à enregistrer vos explications pour ce sujet
                </Text>
            </View>
        ),
        []
    );

    const keyExtractor = useCallback(
        (item: SessionItemData) => item.session.id,
        []
    );

    // ─────────────────────────────────────────────────────────────────────────
    // CONDITIONAL RETURNS - These come AFTER all hooks
    // ─────────────────────────────────────────────────────────────────────────

    // LOADING STATE
    if (logic.isLoading && !logic.topic) {
        return (
            <ScreenWrapper>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    // ERROR STATE
    if (logic.error || !logic.topic) {
        return (
            <ScreenWrapper>
                <View style={styles.errorStateContainer}>
                    <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={64}
                        color="rgba(255,255,255,0.5)"
                    />
                    <Text style={styles.errorText}>
                        {logic.error || 'Topic introuvable'}
                    </Text>
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
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea padding={0}>
            <FlatList
                data={logic.sessions}
                keyExtractor={keyExtractor}
                renderItem={renderSessionCard}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={logic.isLoading}
                        onRefresh={logic.refreshSessions}
                        tintColor="#FFFFFF"
                        colors={['#FFFFFF']}
                    />
                }
            />

            {/* FAB - "Nouvelle Session" button - HIGH CONTRAST FIX */}
            <View style={styles.fabContainer}>
                <Pressable
                    onPress={handleStartSession}
                    style={({ pressed }) => [
                        styles.fabButton,
                        pressed && styles.fabButtonPressed,
                    ]}
                >
                    {/* BLACK ICON on WHITE background = visible */}
                    <MaterialCommunityIcons name="microphone" size={24} color="#000000" />
                    {/* BLACK TEXT on WHITE background = visible */}
                    <Text style={styles.fabText}>Nouvelle Session</Text>
                </Pressable>
            </View>
        </ScreenWrapper>
    );
});

export default TopicDetailScreen;
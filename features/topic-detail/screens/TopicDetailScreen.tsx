/**
 * @file TopicDetailScreen.tsx
 * @description Topic Detail Screen - Theme Aware, Internationalized
 *
 * FIXED:
 * - Added topicId extraction from route params
 * - Using correct SessionHistoryCard component
 * - Added ItemSeparatorComponent for spacing between sessions
 */

import React, { memo, useCallback } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, Pressable, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { Spacing, BorderRadius, useTheme } from '@/theme';

import { useTopicDetail } from '../hooks/useTopicDetail';
import type { SessionItemData } from '../hooks/useTopicDetail';
import { SessionHistoryCard } from '../components/SessionHistoryCard';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicDetailScreen = memo(function TopicDetailScreen() {
    // ─────────────────────────────────────────────────────────────────────────
    // HOOKS
    // ─────────────────────────────────────────────────────────────────────────
    const { topicId } = useLocalSearchParams<{ topicId: string }>();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();

    // ✅ FIX: Pass topicId to the hook
    const logic = useTopicDetail(topicId ?? '');

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleDelete = useCallback(() => {
        Alert.alert(
            t('common.confirm'),
            t('topicDetail.actions.confirmDelete'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: logic.handleDeleteTopic,
                },
            ]
        );
    }, [t, logic.handleDeleteTopic]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    const renderSessionItem = useCallback(
        ({ item }: { item: SessionItemData }) => (
            <SessionHistoryCard
                data={item}
                onPress={() => logic.handleSessionPress(item.session.id)}
            />
        ),
        [logic.handleSessionPress]
    );

    // ✅ FIX: Add separator component for spacing between sessions
    const ItemSeparator = useCallback(() => (
        <View style={{ height: Spacing.md }} />
    ), []);

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                    name="microphone-off"
                    size={48}
                    color={colors.text.muted}
                />
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                    {t('topicDetail.empty.title')}
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
                    {t('topicDetail.empty.description')}
                </Text>
            </View>
        ),
        [colors, t]
    );

    const keyExtractor = useCallback((item: SessionItemData) => item.session.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (logic.isLoading && !logic.topic) {
        return (
            <ScreenWrapper useSafeArea padding={0}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                        {t('common.loading')}
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ERROR STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.topic) {
        return (
            <ScreenWrapper useSafeArea padding={0}>
                <View style={styles.errorStateContainer}>
                    <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={48}
                        color={colors.text.muted}
                    />
                    <Text style={[styles.errorText, { color: colors.text.secondary }]}>
                        {t('topicDetail.notFound')}
                    </Text>
                    <GlassButton
                        title={t('common.back')}
                        onPress={handleBack}
                        variant="secondary"
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
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
                </Pressable>

                <View style={styles.headerTitleContainer}>
                    <Text
                        style={[styles.headerTitle, { color: colors.text.primary }]}
                        numberOfLines={1}
                    >
                        {logic.topic.title}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
                        {t('topicDetail.sessionsCount', { count: logic.sessions.length })}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <Pressable onPress={logic.showEditModal} style={styles.headerButton}>
                        <MaterialIcons name="edit" size={22} color={colors.text.primary} />
                    </Pressable>
                    <Pressable onPress={handleDelete} style={styles.headerButton}>
                        <MaterialIcons name="delete" size={22} color={colors.text.primary} />
                    </Pressable>
                </View>
            </View>

            {/* Sessions List */}
            <FlatList
                data={logic.sessions}
                renderItem={renderSessionItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                ItemSeparatorComponent={ItemSeparator} // ✅ FIX: Add spacing between items
                refreshControl={
                    <RefreshControl
                        refreshing={logic.isLoading}
                        onRefresh={logic.refreshSessions}
                        tintColor={colors.text.primary}
                    />
                }
            />

            {/* FAB - Start Recording */}
            <View style={[styles.fabContainer, { paddingBottom: insets.bottom + Spacing.md }]}>
                <Pressable
                    style={[styles.fab, { backgroundColor: colors.text.primary }]}
                    onPress={logic.handleStartSession}
                >
                    <MaterialIcons name="mic" size={28} color={colors.text.inverse} />
                    <Text style={[styles.fabText, { color: colors.text.inverse }]}>
                        {t('topicDetail.startRecording')}
                    </Text>
                </Pressable>
            </View>
        </ScreenWrapper>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    headerButton: {
        padding: Spacing.xs,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 16,
    },
    errorStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        gap: Spacing.md,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
        gap: Spacing.sm,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: Spacing.md,
    },
    emptyDescription: {
        fontSize: 14,
        textAlign: 'center',
    },
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.lg,
    },
    fab: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.full,
        gap: Spacing.sm,
    },
    fabText: {
        fontSize: 16,
        fontWeight: '600',
    },
});
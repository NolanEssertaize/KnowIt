/**
 * @file TopicsListScreen.tsx
 * @description Topics List Screen - Theme Aware, Internationalized
 *
 * COMPREHENSIVE FIX:
 * - Uses useTopicsList (correct hook name)
 * - Uses TopicItemData type (correct type from main branch)
 * - TopicCard receives `data` prop (not `topic`)
 * - All hardcoded strings replaced with i18n translations
 * - KPI stats cards restored (topics, sessions, streak)
 * - Proper navigation with topicId
 */

import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { ScreenWrapper, GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { ProfileButton } from '@/features/profile';

// ═══════════════════════════════════════════════════════════════════════════
// FIXED: Import the correct hook and types from main branch
// ═══════════════════════════════════════════════════════════════════════════
import { useTopicsList, type TopicItemData } from '../hooks/useTopicsList';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function TopicsListScreenComponent() {
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();

    // Use the correct hook from main branch
    const logic = useTopicsList();

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    const renderListHeader = useCallback(
        () => (
            <View style={styles.listHeader}>
                {/* ═══════════════════════════════════════════════════════════════
                    KPI STATS CARDS - Restored from main branch
                ═══════════════════════════════════════════════════════════════ */}
                <View style={styles.statsRow}>
                    {/* Topics Count */}
                    <GlassView
                        style={[styles.statCard, { borderColor: colors.glass.border }]}
                        showBorder
                    >
                        <View
                            style={[
                                styles.statIconContainer,
                                { backgroundColor: colors.surface.glass },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="book-multiple"
                                size={20}
                                color={colors.text.primary}
                            />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.topicsCount}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                            {t('topics.stats.topics')}
                        </Text>
                    </GlassView>

                    {/* Sessions Count */}
                    <GlassView
                        style={[styles.statCard, { borderColor: colors.glass.border }]}
                        showBorder
                    >
                        <View
                            style={[
                                styles.statIconContainer,
                                { backgroundColor: colors.surface.glass },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="microphone"
                                size={20}
                                color={colors.text.primary}
                            />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.totalSessions}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                            {t('topics.stats.sessions')}
                        </Text>
                    </GlassView>

                    {/* Streak */}
                    <GlassView
                        style={[styles.statCard, { borderColor: colors.glass.border }]}
                        showBorder
                    >
                        <View
                            style={[
                                styles.statIconContainer,
                                { backgroundColor: colors.surface.glass },
                            ]}
                        >
                            <MaterialCommunityIcons
                                name="fire"
                                size={20}
                                color={colors.text.primary}
                            />
                        </View>
                        <Text style={[styles.statValue, { color: colors.text.primary }]}>
                            {logic.streak}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.muted }]}>
                            {t('topics.stats.streak')}
                        </Text>
                    </GlassView>
                </View>

                {/* ═══════════════════════════════════════════════════════════════
                    SEARCH BAR
                ═══════════════════════════════════════════════════════════════ */}
                <GlassView style={styles.searchContainer} showBorder>
                    <MaterialCommunityIcons name="magnify" size={22} color={colors.text.muted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text.primary }]}
                        placeholder={t('topics.search.placeholder')}
                        placeholderTextColor={colors.text.muted}
                        value={logic.searchText}
                        onChangeText={logic.setSearchText}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    {logic.searchText.length > 0 && (
                        <Pressable onPress={() => logic.setSearchText('')}>
                            <MaterialCommunityIcons
                                name="close-circle"
                                size={20}
                                color={colors.text.muted}
                            />
                        </Pressable>
                    )}
                </GlassView>

                {/* ═══════════════════════════════════════════════════════════════
                    CATEGORY FILTER
                ═══════════════════════════════════════════════════════════════ */}
                <CategoryFilter
                    selectedCategory={logic.selectedCategory}
                    onSelectCategory={logic.setSelectedCategory}
                />

                {/* ═══════════════════════════════════════════════════════════════
                    SECTION HEADER WITH SWIPE HINT
                ═══════════════════════════════════════════════════════════════ */}
                <View style={styles.sectionHeader}>
                    <Text style={[styles.sectionTitle, { color: colors.text.secondary }]}>
                        {t('topics.categories.all')}
                    </Text>
                    <Text style={[styles.sectionCount, { color: colors.text.muted }]}>
                        {logic.filteredTopics.length} {t('topics.stats.topics')}
                    </Text>
                </View>

                {/* Swipe hint */}
                <View style={styles.swipeHintContainer}>
                    <MaterialIcons name="swipe" size={14} color={colors.text.muted} />
                    <Text style={[styles.swipeHint, { color: colors.text.muted }]}>
                        {t('topics.card.swipeHint')}
                    </Text>
                </View>

                {/* Active filters indicator */}
                {logic.hasActiveFilters && (
                    <Pressable
                        onPress={logic.resetFilters}
                        style={[styles.activeFiltersBar, { backgroundColor: colors.surface.glass }]}
                    >
                        <Text style={[styles.activeFiltersText, { color: colors.text.primary }]}>
                            {t('topics.search.activeFilters')}
                        </Text>
                        <MaterialCommunityIcons name="close-circle" size={16} color={colors.text.primary} />
                    </Pressable>
                )}
            </View>
        ),
        [
            colors,
            t,
            logic.searchText,
            logic.setSearchText,
            logic.selectedCategory,
            logic.setSelectedCategory,
            logic.topicsCount,
            logic.totalSessions,
            logic.streak,
            logic.filteredTopics.length,
            logic.hasActiveFilters,
            logic.resetFilters,
        ]
    );

    // FIXED: TopicCard uses `data` prop with TopicItemData type (main branch interface)
    const renderItem = useCallback(
        ({ item }: { item: TopicItemData }) => (
            <TopicCard
                data={item}
                onPress={() => logic.handleCardPress(item.topic.id)}
                onEdit={() => logic.handleEdit(item.topic.id)}
                onShare={() => logic.handleShare(item.topic.id)}
                onDelete={() => logic.handleDelete(item.topic.id)}
                registerRef={(ref) => logic.registerSwipeableRef(item.topic.id, ref)}
                unregisterRef={() => logic.unregisterSwipeableRef(item.topic.id)}
            />
        ),
        [
            logic.handleCardPress,
            logic.handleEdit,
            logic.handleShare,
            logic.handleDelete,
            logic.registerSwipeableRef,
            logic.unregisterSwipeableRef,
        ]
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <View style={[styles.emptyIconContainer, { backgroundColor: colors.surface.glass }]}>
                    <MaterialCommunityIcons
                        name="book-plus"
                        size={48}
                        color={colors.text.primary}
                    />
                </View>
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                    {t('topics.empty.title')}
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
                    {logic.hasActiveFilters
                        ? t('topics.search.noResults')
                        : t('topics.empty.description')}
                </Text>
                {!logic.hasActiveFilters && (
                    <Pressable
                        style={[styles.emptyButton, { backgroundColor: colors.text.primary }]}
                        onPress={() => logic.setShowAddModal(true)}
                    >
                        <MaterialIcons name="add" size={20} color={colors.text.inverse} />
                        <Text style={[styles.emptyButtonText, { color: colors.text.inverse }]}>
                            {t('topics.empty.action')}
                        </Text>
                    </Pressable>
                )}
            </View>
        ),
        [logic.hasActiveFilters, logic.setShowAddModal, colors, t]
    );

    // FIXED: Use item.topic.id for unique key (main branch structure)
    const keyExtractor = useCallback((item: TopicItemData) => item.topic.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper scrollable={false} padding={0}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.text.secondary }]}>
                        {logic.greeting}
                    </Text>
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        {t('topics.greeting.ready')}
                    </Text>
                </View>
                <ProfileButton />
            </View>

            {/* Loading State */}
            {logic.isLoading && logic.filteredTopics.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                        {t('common.loading')}
                    </Text>
                </View>
            ) : (
                /* Topics List */
                <FlatList
                    data={logic.filteredTopics}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    ListHeaderComponent={renderListHeader}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={logic.isLoading}
                            onRefresh={logic.refreshTopics}
                            tintColor={colors.text.primary}
                            colors={[colors.text.primary]}
                        />
                    }
                />
            )}

            {/* FAB - Add Topic */}
            <View style={styles.fabContainer}>
                <Pressable
                    style={({ pressed }) => [
                        styles.fab,
                        { backgroundColor: colors.text.primary },
                        pressed && styles.fabPressed,
                    ]}
                    onPress={() => logic.setShowAddModal(true)}
                >
                    <MaterialIcons name="add" size={28} color={colors.text.inverse} />
                </Pressable>
            </View>

            {/* Add Topic Modal - Using main branch prop interface */}
            <AddTopicModal
                visible={logic.showAddModal}
                onClose={() => {
                    logic.setShowAddModal(false);
                    logic.setNewTopicText('');
                }}
                onSubmit={logic.handleAddTopic}
                value={logic.newTopicText}
                onChangeText={logic.setNewTopicText}
            />
        </ScreenWrapper>
    );
}

export const TopicsListScreen = memo(TopicsListScreenComponent);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    greeting: {
        fontSize: 14,
        marginBottom: 4,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    listHeader: {
        marginBottom: Spacing.md,
    },
    // ═══════════════════════════════════════════════════════════════════════
    // STATS CARDS
    // ═══════════════════════════════════════════════════════════════════════
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        alignItems: 'center',
        gap: Spacing.xs,
        borderWidth: 1,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statValue: {
        fontSize: 24,
        fontWeight: '700',
    },
    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    // ═══════════════════════════════════════════════════════════════════════
    // SEARCH
    // ═══════════════════════════════════════════════════════════════════════
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.md,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        paddingVertical: 4,
    },
    // ═══════════════════════════════════════════════════════════════════════
    // SECTION HEADER
    // ═══════════════════════════════════════════════════════════════════════
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionCount: {
        fontSize: 12,
    },
    swipeHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginBottom: Spacing.md,
    },
    swipeHint: {
        fontSize: 11,
    },
    activeFiltersBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
    },
    activeFiltersText: {
        fontSize: 12,
        fontWeight: '500',
    },
    // ═══════════════════════════════════════════════════════════════════════
    // LOADING
    // ═══════════════════════════════════════════════════════════════════════
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.md,
    },
    loadingText: {
        fontSize: 14,
    },
    // ═══════════════════════════════════════════════════════════════════════
    // EMPTY STATE
    // ═══════════════════════════════════════════════════════════════════════
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
        gap: Spacing.md,
    },
    emptyIconContainer: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    emptyDescription: {
        fontSize: 14,
        textAlign: 'center',
        maxWidth: 280,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        marginTop: Spacing.md,
        gap: Spacing.xs,
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    // ═══════════════════════════════════════════════════════════════════════
    // FAB
    // ═══════════════════════════════════════════════════════════════════════
    fabContainer: {
        position: 'absolute',
        right: Spacing.lg,
        bottom: Spacing.xl,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    fabPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
});

export default TopicsListScreen;
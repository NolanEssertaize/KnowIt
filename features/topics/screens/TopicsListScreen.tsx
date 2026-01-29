/**
 * @file TopicsListScreen.tsx
 * @description Topics List Screen - Theme Aware, Internationalized
 *
 * UPDATED: All hardcoded strings replaced with i18n translations
 */

import React, { memo, useCallback, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TextInput,
    Pressable,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { ScreenWrapper, GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useLanguage, formatShortDate } from '@/i18n';

import { useTopics, type TopicWithMeta } from '../hooks/useTopics';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function TopicsListScreenComponent() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { language, greeting } = useLanguage();

    const logic = useTopics();

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleTopicPress = useCallback(
        (topic: TopicWithMeta) => {
            router.push(`/${topic.id}`);
        },
        [router]
    );

    const handleProfilePress = useCallback(() => {
        router.push('/profile');
    }, [router]);

    // ─────────────────────────────────────────────────────────────────────────
    // COMPUTED VALUES
    // ─────────────────────────────────────────────────────────────────────────

    const totalSessions = useMemo(() => {
        return logic.filteredTopics.reduce((sum, topic) => sum + (topic.sessionCount || 0), 0);
    }, [logic.filteredTopics]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    const renderItem: ListRenderItem<TopicWithMeta> = useCallback(
        ({ item }) => (
            <TopicCard
                topic={item}
                onPress={() => handleTopicPress(item)}
                style={styles.topicCard}
            />
        ),
        [handleTopicPress]
    );

    const keyExtractor = useCallback((item: TopicWithMeta) => item.id, []);

    const renderListHeader = useCallback(
        () => (
            <View style={styles.listHeaderContainer}>
                <Text style={[styles.listSectionTitle, { color: colors.text.secondary }]}>
                    {t('topics.card.sessions_other', { count: logic.filteredTopics.length })} {t('topics.stats.topics')}
                </Text>
            </View>
        ),
        [colors.text.secondary, logic.filteredTopics.length, t]
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                    name="book-open-variant"
                    size={64}
                    color={colors.text.muted}
                />
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                    {logic.searchText ? t('topics.search.noResults') : t('topics.empty.title')}
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
                    {logic.searchText
                        ? t('topics.search.noResults')
                        : t('topics.empty.description')}
                </Text>
                {!logic.searchText && (
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
        [colors, logic.searchText, logic.setShowAddModal, t]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea padding={0}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: colors.text.secondary }]}>
                        {greeting}
                    </Text>
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        {t('topics.title')}
                    </Text>
                </View>
                <Pressable
                    style={[styles.profileButton, { backgroundColor: colors.surface.glass }]}
                    onPress={handleProfilePress}
                >
                    <MaterialIcons name="person" size={24} color={colors.text.primary} />
                </Pressable>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
                <View style={styles.statsRow}>
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
                            {logic.filteredTopics.length}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                            {t('topics.stats.topics')}
                        </Text>
                    </GlassView>

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
                            {totalSessions}
                        </Text>
                        <Text style={[styles.statLabel, { color: colors.text.secondary }]}>
                            {t('topics.stats.sessions')}
                        </Text>
                    </GlassView>
                </View>
            </View>

            {/* Search & Filters */}
            <View style={styles.filtersContainer}>
                {/* Search Bar */}
                <GlassView style={styles.searchBar} showBorder>
                    <MaterialCommunityIcons name="magnify" size={22} color={colors.text.muted} />
                    <TextInput
                        style={[styles.searchInput, { color: colors.text.primary }]}
                        placeholder={t('topics.search.placeholder')}
                        placeholderTextColor={colors.text.muted}
                        value={logic.searchText}
                        onChangeText={logic.setSearchText}
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

                {/* Category Filter */}
                <CategoryFilter
                    selectedCategory={logic.selectedCategory}
                    onSelectCategory={logic.setSelectedCategory}
                />
            </View>

            {/* Loading State */}
            {logic.isLoading && logic.filteredTopics.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                </View>
            ) : (
                <FlatList
                    data={logic.filteredTopics}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    contentContainerStyle={styles.listContent}
                    ListHeaderComponent={renderListHeader}
                    ListEmptyComponent={renderEmptyState}
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

            {/* FAB */}
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

            {/* Add Topic Modal */}
            <AddTopicModal
                visible={logic.showAddModal}
                value={logic.newTopicText}
                onChangeText={logic.setNewTopicText}
                onSubmit={logic.handleAddTopic}
                onClose={() => logic.setShowAddModal(false)}
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
    profileButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
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
        fontSize: 12,
    },
    filtersContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        padding: 0,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
    },
    listHeaderContainer: {
        marginBottom: Spacing.sm,
    },
    listSectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    topicCard: {
        marginBottom: Spacing.sm,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginTop: Spacing.lg,
        marginBottom: Spacing.sm,
    },
    emptyDescription: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },
    emptyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    emptyButtonText: {
        fontSize: 14,
        fontWeight: '600',
    },
    fabContainer: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.lg,
    },
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
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
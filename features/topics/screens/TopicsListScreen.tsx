/**
 * @file TopicsListScreen.tsx
 * @description Écran principal - Liste des sujets (Vue Dumb)
 *
 * FIXES:
 * - Moved ProfileButton to top right corner
 * - Added streak counter with flame icon
 */

import React, { memo, useCallback } from 'react';
import { View, Text, TextInput, FlatList, Pressable, RefreshControl, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ProfileButton } from '@/features/profile';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';

import { useTopicsList, type TopicItemData } from '../hooks/useTopicsList';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';
import { styles } from './TopicsListScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicsListScreen = memo(function TopicsListScreen() {
    // Setup Hook - Logic Controller
    const logic = useTopicsList();

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    // Header de la liste (sans la barre de recherche pour éviter les re-renders)
    const renderListHeader = useCallback(
        () => (
            <View style={styles.listHeader}>
                {/* Titre de section */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Mes Sujets</Text>
                    <Text style={styles.sectionCount}>
                        {logic.filteredTopics.length} sujets
                    </Text>
                </View>

                {/* Indication de swipe */}
                <View style={styles.swipeHintContainer}>
                    <MaterialIcons name="swipe" size={14} color={GlassColors.text.tertiary} />
                    <Text style={styles.swipeHint}>
                        Glissez pour plus d'options
                    </Text>
                </View>

                {/* Indicateur de filtres actifs */}
                {logic.hasActiveFilters && (
                    <Pressable onPress={logic.resetFilters} style={styles.activeFiltersBar}>
                        <Text style={styles.activeFiltersText}>
                            Filtres actifs
                        </Text>
                        <MaterialCommunityIcons
                            name="close-circle"
                            size={16}
                            color={GlassColors.accent.primary}
                        />
                    </Pressable>
                )}
            </View>
        ),
        [logic.filteredTopics.length, logic.hasActiveFilters, logic.resetFilters]
    );

    const renderTopicCard = useCallback(
        ({ item }: { item: TopicItemData }) => (
            <TopicCard
                topic={item.topic}
                theme={item.theme}
                lastSessionDate={item.lastSessionDate}
                onPress={() => logic.handleCardPress(item.topic.id)}
                onEdit={() => logic.handleEdit(item.topic.id)}
                onShare={() => logic.handleShare(item.topic.id)}
                onDelete={() => logic.handleDelete(item.topic.id)}
                onSwipeableWillOpen={() => logic.closeAllSwipeables(item.topic.id)}
            />
        ),
        [logic.handleCardPress, logic.handleEdit, logic.handleShare, logic.handleDelete, logic.closeAllSwipeables]
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <GlassView style={styles.emptyIcon}>
                    <MaterialCommunityIcons
                        name="book-plus-outline"
                        size={64}
                        color={GlassColors.text.tertiary}
                    />
                </GlassView>
                <Text style={styles.emptyTitle}>
                    {logic.hasActiveFilters ? 'Aucun résultat' : 'Aucun sujet'}
                </Text>
                <Text style={styles.emptySubtitle}>
                    {logic.hasActiveFilters
                        ? 'Essayez de modifier vos filtres'
                        : 'Créez votre premier sujet pour commencer à réviser'}
                </Text>
            </View>
        ),
        [logic.hasActiveFilters, logic.resetFilters, logic.refreshTopics]
    );

    const keyExtractor = useCallback((item: TopicItemData) => item.topic.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea padding={0}>
            {/* Header fixe (ne se re-render pas avec la liste) */}
            <View style={styles.fixedHeader}>
                {/* Top Row: Greeting + Profile Button */}
                <View style={styles.topRow}>
                    {/* Salutation */}
                    <View style={styles.greetingSection}>
                        <View style={styles.greetingRow}>
                            <Text style={styles.greeting}>{logic.greeting}</Text>
                            <MaterialCommunityIcons
                                name="hand-wave"
                                size={28}
                                color={GlassColors.semantic.warning}
                            />
                        </View>
                        <Text style={styles.subtitle}>Prêt à réviser ?</Text>
                    </View>

                    {/* Profile Button - Top Right */}
                    <ProfileButton initials="Me" size="md" />
                </View>

                {/* Stats Row - Now includes Streak */}
                <View style={styles.statsRow}>
                    {/* Topics Count */}
                    <GlassView style={styles.statCard}>
                        <MaterialCommunityIcons
                            name="book-multiple"
                            size={24}
                            color={GlassColors.accent.primary}
                        />
                        <View>
                            <Text style={styles.statNumber}>{logic.topicsCount}</Text>
                            <Text style={styles.statLabel}>Sujets</Text>
                        </View>
                    </GlassView>

                    {/* Sessions Count */}
                    <GlassView style={styles.statCard}>
                        <MaterialCommunityIcons
                            name="microphone"
                            size={24}
                            color={GlassColors.semantic.success}
                        />
                        <View>
                            <Text style={styles.statNumber}>{logic.totalSessions}</Text>
                            <Text style={styles.statLabel}>Sessions</Text>
                        </View>
                    </GlassView>

                    {/* Streak Counter - NEW */}
                    <GlassView style={styles.statCard}>
                        <MaterialIcons
                            name="local-fire-department"
                            size={24}
                            color="#FF6B35"
                        />
                        <View>
                            <Text style={styles.statNumber}>{logic.streak}</Text>
                            <Text style={styles.statLabel}>Streak</Text>
                        </View>
                    </GlassView>
                </View>

                {/* Recherche */}
                <GlassView style={styles.searchContainer}>
                    <MaterialCommunityIcons
                        name="magnify"
                        size={22}
                        color={GlassColors.text.tertiary}
                    />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un sujet..."
                        placeholderTextColor={GlassColors.text.tertiary}
                        value={logic.searchText}
                        onChangeText={logic.setSearchText}
                    />
                    {logic.searchText.length > 0 && (
                        <Pressable onPress={() => logic.setSearchText('')}>
                            <MaterialCommunityIcons
                                name="close-circle"
                                size={20}
                                color={GlassColors.text.tertiary}
                            />
                        </Pressable>
                    )}
                </GlassView>

                {/* Filtres par catégorie */}
                <CategoryFilter
                    selectedCategory={logic.selectedCategory}
                    onSelectCategory={logic.setSelectedCategory}
                />
            </View>

            {/* Loading State */}
            {logic.isLoading && logic.filteredTopics.length === 0 ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={GlassColors.accent.primary} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            ) : (
                /* Liste des topics */
                <FlatList
                    data={logic.filteredTopics}
                    keyExtractor={keyExtractor}
                    renderItem={renderTopicCard}
                    ListHeaderComponent={renderListHeader}
                    ListEmptyComponent={renderEmptyState}
                    contentContainerStyle={styles.listContent}
                    showsVerticalScrollIndicator={false}
                    refreshControl={
                        <RefreshControl
                            refreshing={logic.isLoading}
                            onRefresh={logic.refreshTopics}
                            tintColor={GlassColors.accent.primary}
                            colors={[GlassColors.accent.primary]}
                        />
                    }
                />
            )}

            {/* FAB pour ajouter un topic */}
            <Pressable
                style={styles.fabContainer}
                onPress={() => logic.setShowAddModal(true)}
            >
                <LinearGradient
                    colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.fabGradient}
                >
                    <MaterialCommunityIcons name="plus" size={28} color="#FFFFFF" />
                </LinearGradient>
            </Pressable>

            {/* Modal d'ajout de topic */}
            <AddTopicModal
                visible={logic.showAddModal}
                value={logic.newTopicText}
                onChangeText={logic.setNewTopicText}
                onSubmit={logic.handleAddTopic}
                onClose={() => logic.setShowAddModal(false)}
            />
        </ScreenWrapper>
    );
});

export default TopicsListScreen;
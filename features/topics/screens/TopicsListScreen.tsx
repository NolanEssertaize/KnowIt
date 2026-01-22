/**
 * @file TopicsListScreen.tsx
 * @description Écran principal - Liste des sujets - Monochrome Theme
 *
 * FIXES:
 * - Stats values: WHITE text (was black on black)
 * - FAB button: SOLID WHITE background + BLACK icon
 * - Removed all LinearGradient usage
 * - All icons and text use explicit colors
 */

import React, { memo, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    Pressable,
    RefreshControl,
    ActivityIndicator,
    Platform,
    StyleSheet,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ProfileButton } from '@/features/profile';

import { ScreenWrapper, GlassView } from '@/shared/components';
import { Spacing, BorderRadius } from '@/theme';

import { useTopicsList, type TopicItemData } from '../hooks/useTopicsList';
import { TopicCard } from '../components/TopicCard';
import { AddTopicModal } from '../components/AddTopicModal';
import { CategoryFilter } from '../components/CategoryFilter';
import { styles } from './TopicsListScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicsListScreen = memo(function TopicsListScreen() {
    const logic = useTopicsList();

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER HELPERS
    // ─────────────────────────────────────────────────────────────────────────

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
                    <MaterialIcons name="swipe" size={14} color="rgba(255,255,255,0.4)" />
                    <Text style={styles.swipeHint}>Glissez pour plus d'options</Text>
                </View>

                {/* Indicateur de filtres actifs */}
                {logic.hasActiveFilters && (
                    <Pressable onPress={logic.resetFilters} style={styles.activeFiltersBar}>
                        <Text style={styles.activeFiltersText}>Filtres actifs</Text>
                        <MaterialCommunityIcons name="close-circle" size={16} color="#FFFFFF" />
                    </Pressable>
                )}
            </View>
        ),
        [logic.filteredTopics.length, logic.hasActiveFilters, logic.resetFilters]
    );

    const renderTopicCard = useCallback(
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
        [logic.handleCardPress, logic.handleEdit, logic.handleShare, logic.handleDelete]
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <GlassView style={styles.emptyIcon}>
                    <MaterialCommunityIcons
                        name="book-plus-outline"
                        size={64}
                        color="rgba(255,255,255,0.5)"
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
        [logic.hasActiveFilters]
    );

    const keyExtractor = useCallback((item: TopicItemData) => item.topic.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea padding={0}>
            {/* Header fixe */}
            <View style={styles.fixedHeader}>
                {/* Top Row: Greeting + Profile Button */}
                <View style={styles.topRow}>
                    <View style={styles.greetingSection}>
                        <View style={styles.greetingRow}>
                            <Text style={styles.greeting}>{logic.greeting}</Text>
                            {/* Hand wave - WHITE icon */}
                            <MaterialCommunityIcons name="hand-wave" size={28} color="#FFFFFF" />
                        </View>
                        <Text style={styles.subtitle}>Prêt à réviser ?</Text>
                    </View>
                    <ProfileButton initials="Me" size="md" />
                </View>

                {/* Stats Row - FIX: All values WHITE */}
                <View style={styles.statsRow}>
                    <GlassView style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <MaterialCommunityIcons name="book-multiple" size={22} color="#FFFFFF" />
                        </View>
                        {/* FIX: Explicit WHITE text */}
                        <Text style={styles.statValue}>{logic.topicsCount}</Text>
                        <Text style={styles.statLabel}>Sujets</Text>
                    </GlassView>

                    <GlassView style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <MaterialCommunityIcons name="microphone" size={22} color="#FFFFFF" />
                        </View>
                        {/* FIX: Explicit WHITE text */}
                        <Text style={styles.statValue}>{logic.totalSessions}</Text>
                        <Text style={styles.statLabel}>Sessions</Text>
                    </GlassView>

                    <GlassView style={styles.statCard}>
                        <View style={styles.statIconContainer}>
                            <MaterialCommunityIcons name="fire" size={22} color="#FFFFFF" />
                        </View>
                        {/* FIX: Explicit WHITE text */}
                        <Text style={styles.statValue}>{logic.streak}</Text>
                        <Text style={styles.statLabel}>Streak</Text>
                    </GlassView>
                </View>

                {/* Recherche */}
                <GlassView style={styles.searchContainer}>
                    <MaterialCommunityIcons name="magnify" size={22} color="rgba(255,255,255,0.5)" />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un sujet..."
                        placeholderTextColor="rgba(255,255,255,0.4)"
                        value={logic.searchText}
                        onChangeText={logic.setSearchText}
                    />
                    {logic.searchText.length > 0 && (
                        <Pressable onPress={() => logic.setSearchText('')}>
                            <MaterialCommunityIcons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
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
                    <ActivityIndicator size="large" color="#FFFFFF" />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            ) : (
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
                            tintColor="#FFFFFF"
                            colors={['#FFFFFF']}
                        />
                    }
                />
            )}

            {/* ═══════════════════════════════════════════════════════════════════
          FAB - HIGH CONTRAST FIX
          Solid WHITE background + BLACK icon
      ═══════════════════════════════════════════════════════════════════ */}
            <Pressable
                style={({ pressed }) => [
                    localStyles.fabContainer,
                    pressed && localStyles.fabPressed,
                ]}
                onPress={() => logic.setShowAddModal(true)}
            >
                <View style={localStyles.fab}>
                    {/* BLACK icon on WHITE background = VISIBLE */}
                    <MaterialCommunityIcons name="plus" size={28} color="#000000" />
                </View>
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

// ═══════════════════════════════════════════════════════════════════════════
// LOCAL STYLES - FAB specific (override any problematic styles)
// ═══════════════════════════════════════════════════════════════════════════

const localStyles = StyleSheet.create({
    fabContainer: {
        position: 'absolute',
        bottom: 24,
        right: 16,
    },

    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        // HIGH CONTRAST: Solid WHITE background
        backgroundColor: '#FFFFFF',
        // Shadow for depth
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

    fabPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.95 }],
    },
});

export default TopicsListScreen;
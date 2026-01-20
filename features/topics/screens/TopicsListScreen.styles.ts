/**
 * @file TopicsListScreen.styles.ts
 * @description Styles pour l'écran de liste des topics
 *
 * FIX: Added styles for loading state, error state, and retry button
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
    // Fixed Header (en dehors de la FlatList)
    fixedHeader: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },

    // Greeting
    greetingSection: {
        marginBottom: Spacing.lg,
    },
    greetingLeft: {},
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xs,
        gap: Spacing.sm,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '700',
        color: GlassColors.text.primary,
    },
    subtitle: {
        fontSize: 16,
        color: GlassColors.text.secondary,
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: GlassColors.text.primary,
    },
    statLabel: {
        fontSize: 11,
        color: GlassColors.text.secondary,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        marginBottom: Spacing.md,
    },
    searchInput: {
        flex: 1,
        marginLeft: Spacing.sm,
        fontSize: 16,
        color: GlassColors.text.primary,
        paddingVertical: Spacing.xs,
    },

    // List Content
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
        flexGrow: 1,
    },

    // List Header (dans la FlatList)
    listHeader: {
        marginBottom: Spacing.md,
    },

    // Section header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: GlassColors.text.primary,
    },
    sectionCount: {
        fontSize: 14,
        color: GlassColors.text.secondary,
    },

    // Swipe hint
    swipeHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    swipeHint: {
        fontSize: 12,
        color: GlassColors.text.tertiary,
        fontStyle: 'italic',
    },

    // Active filters bar
    activeFiltersBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        backgroundColor: 'rgba(124, 58, 237, 0.1)',
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    activeFiltersText: {
        fontSize: 12,
        color: GlassColors.accent.primary,
        fontWeight: '500',
    },

    // Empty state
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
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
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

    // Retry button (for error state)
    retryButton: {
        marginTop: Spacing.lg,
        minWidth: 160,
    },

    // FAB (Floating Action Button)
    fabContainer: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.lg,
        ...Shadows.medium,
    },
    fabGradient: {
        width: 60,
        height: 60,
        borderRadius: 30,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Error text
    errorText: {
        fontSize: 16,
        color: GlassColors.semantic.error,
        textAlign: 'center',
    },
});
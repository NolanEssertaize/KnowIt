/**
 * @file TopicsListScreen.styles.ts
 * @description Styles pour l'écran de liste des topics
 *
 * FIXES:
 * - Added topRow style for profile button positioning (top right)
 * - Updated greetingSection to work with new layout
 * - Stats row now accommodates 3 cards (including streak)
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
    // ═══════════════════════════════════════════════════════════════════════
    // FIXED HEADER
    // ═══════════════════════════════════════════════════════════════════════
    fixedHeader: {
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.sm,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // TOP ROW - Greeting + Profile Button
    // ═══════════════════════════════════════════════════════════════════════
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // GREETING SECTION
    // ═══════════════════════════════════════════════════════════════════════
    greetingSection: {
        flex: 1,
    },
    greetingLeft: {
        // Kept for backwards compatibility, can be removed
    },
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

    // ═══════════════════════════════════════════════════════════════════════
    // STATS ROW
    // ═══════════════════════════════════════════════════════════════════════
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.sm,
        gap: Spacing.xs,
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '700',
        color: GlassColors.text.primary,
    },
    statLabel: {
        fontSize: 10,
        color: GlassColors.text.secondary,
        textTransform: 'uppercase',
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
        color: GlassColors.text.primary,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LIST CONTENT
    // ═══════════════════════════════════════════════════════════════════════
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 100,
        flexGrow: 1,
    },
    listHeader: {
        marginBottom: Spacing.md,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SECTION HEADER
    // ═══════════════════════════════════════════════════════════════════════
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
        color: GlassColors.text.tertiary,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SWIPE HINT
    // ═══════════════════════════════════════════════════════════════════════
    swipeHintContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.sm,
    },
    swipeHint: {
        fontSize: 12,
        color: GlassColors.text.tertiary,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIVE FILTERS
    // ═══════════════════════════════════════════════════════════════════════
    activeFiltersBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        backgroundColor: 'rgba(0, 212, 255, 0.1)',
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },
    activeFiltersText: {
        fontSize: 12,
        color: GlassColors.accent.primary,
        fontWeight: '500',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════════════════════════
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loadingText: {
        fontSize: 16,
        color: GlassColors.text.secondary,
        marginTop: Spacing.md,
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

    // ═══════════════════════════════════════════════════════════════════════
    // ERROR STATE
    // ═══════════════════════════════════════════════════════════════════════
    retryButton: {
        marginTop: Spacing.lg,
        minWidth: 160,
    },
    errorText: {
        fontSize: 16,
        color: GlassColors.semantic.error,
        textAlign: 'center',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FAB (Floating Action Button)
    // ═══════════════════════════════════════════════════════════════════════
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
});
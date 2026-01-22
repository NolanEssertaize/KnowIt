/**
 * @file TopicsListScreen.styles.ts
 * @description Styles pour l'écran de liste des topics - Monochrome Theme
 *
 * FIXES:
 * - Stats values: WHITE text (was black on black)
 * - FAB: Solid WHITE background with BLACK icon
 * - All text explicitly white for dark mode
 */

import { StyleSheet, Platform } from 'react-native';
import { Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

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
        // Kept for backwards compatibility
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
        color: '#FFFFFF', // Explicit white
    },

    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.7)',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // STATS ROW - FIX: All text WHITE
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
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },

    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    // FIX: Explicit WHITE color for stat values
    statValue: {
        fontSize: 24,
        fontWeight: '700',
        color: '#FFFFFF', // WAS: GlassColors.text.primary (could be black)
    },

    statLabel: {
        fontSize: 10,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SEARCH CONTAINER
    // ═══════════════════════════════════════════════════════════════════════
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },

    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#FFFFFF',
        paddingVertical: Spacing.xs,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LIST HEADER
    // ═══════════════════════════════════════════════════════════════════════
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
        color: '#FFFFFF',
    },

    sectionCount: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.5)',
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
        color: 'rgba(255, 255, 255, 0.4)',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIVE FILTERS - Monochrome
    // ═══════════════════════════════════════════════════════════════════════
    activeFiltersBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.sm,
    },

    activeFiltersText: {
        fontSize: 12,
        color: '#FFFFFF',
        fontWeight: '500',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LIST CONTENT
    // ═══════════════════════════════════════════════════════════════════════
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120, // Space for FAB
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
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: Spacing.md,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // EMPTY STATE
    // ═══════════════════════════════════════════════════════════════════════
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: Spacing.xl,
        paddingVertical: Spacing.xxl,
    },

    emptyIcon: {
        width: 100,
        height: 100,
        borderRadius: 50,
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

    // ═══════════════════════════════════════════════════════════════════════
    // FAB (Floating Action Button) - HIGH CONTRAST
    // ═══════════════════════════════════════════════════════════════════════
    fabContainer: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.lg,
    },

    // SOLID WHITE FAB with shadow
    fab: {
        width: 56,
        height: 56,
        borderRadius: 28,
        alignItems: 'center',
        justifyContent: 'center',
        // HIGH CONTRAST: Solid WHITE background
        backgroundColor: '#FFFFFF',
        // Shadow for visibility
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

    // REMOVED: fabGradient - No more gradients
});
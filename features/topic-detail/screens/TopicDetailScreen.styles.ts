/**
 * @file TopicDetailScreen.styles.ts
 * @description Styles pour l'écran de détail d'un topic
 *
 * FIXES:
 * - Added navigation header styles (navHeader, backButton, navTitle, headerSpacer)
 * - Added error state container styles
 * - Fixed FAB positioning with fabContainer to prevent overflow
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
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
    // SEPARATORS
    // ═══════════════════════════════════════════════════════════════════════
    separator: {
        height: Spacing.md,
    },
    startButton: {
        marginBottom: Spacing.xl,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // FAB (Floating Action Button) - FIXED: Using container for proper bounds
    // ═══════════════════════════════════════════════════════════════════════
    fabContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.md,
        // Background gradient for visual separation (optional)
        backgroundColor: 'transparent',
    },
    fab: {
        ...Shadows.medium,
    },
});
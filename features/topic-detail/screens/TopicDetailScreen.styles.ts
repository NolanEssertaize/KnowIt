/**
 * @file TopicDetailScreen.styles.ts
 * @description Styles pour l'écran de détail d'un topic
 *
 * FIX: Added styles for loading state, error state, retry button, and FAB
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';

export const styles = StyleSheet.create({
    // ═══════════════════════════════════════════════════════════════════════
    // LIST CONTENT
    // ═══════════════════════════════════════════════════════════════════════
    listContent: {
        padding: Spacing.lg,
        paddingBottom: 100,
        flexGrow: 1,
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
    // FAB (Floating Action Button)
    // ═══════════════════════════════════════════════════════════════════════
    fab: {
        position: 'absolute',
        bottom: Spacing.xl,
        right: Spacing.lg,
        left: Spacing.lg,
        ...Shadows.medium,
    },
});
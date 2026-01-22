/**
 * @file ResultScreen.styles.ts
 * @description Styles pour l'écran de résultats - Monochrome Theme
 *
 * FIXES:
 * - All colors explicit WHITE for dark mode
 * - Buttons use high contrast (white bg + black text for primary)
 * - Removed all colored variants
 */

import { StyleSheet, Platform } from 'react-native';
import { Spacing, BorderRadius } from '@/theme';

export const styles = StyleSheet.create({
    // ═══════════════════════════════════════════════════════════════════════
    // LAYOUT PRINCIPAL
    // ═══════════════════════════════════════════════════════════════════════

    gradient: {
        flex: 1,
        backgroundColor: '#000000',
    },

    scrollView: {
        flex: 1,
    },

    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // HEADER
    // ═══════════════════════════════════════════════════════════════════════

    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },

    closeButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    headerTextContainer: {
        flex: 1,
        paddingTop: Spacing.xs,
    },

    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
    },

    subtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        lineHeight: 22,
    },

    divider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginBottom: Spacing.xl,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // QUICK SUMMARY - Monochrome
    // ═══════════════════════════════════════════════════════════════════════

    summaryContainer: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        marginBottom: Spacing.xl,
    },

    summaryTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: Spacing.lg,
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'flex-start',
    },

    statBadge: {
        alignItems: 'center',
        flex: 1,
    },

    statIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        // Monochrome: subtle glass background
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.sm,
    },

    statCount: {
        fontSize: 24,
        fontWeight: '700',
        // FIX: Explicit WHITE
        color: '#FFFFFF',
        marginBottom: 2,
    },

    statLabel: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },

    summaryDivider: {
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        marginVertical: Spacing.md,
    },

    summaryText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SECTIONS
    // ═══════════════════════════════════════════════════════════════════════

    sectionsContainer: {
        marginBottom: Spacing.xl,
    },

    sectionHeader: {
        fontSize: 14,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.md,
        marginLeft: Spacing.xs,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // ACTIONS - HIGH CONTRAST
    // ═══════════════════════════════════════════════════════════════════════

    actionsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
    },

    actionSpacer: {
        width: Spacing.md,
    },

    // "Réessayer" button - Outline style (glass bg, white text)
    buttonSecondary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: BorderRadius.xl,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    buttonSecondaryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // "Terminer" button - PRIMARY (SOLID WHITE, HIGH CONTRAST)
    buttonPrimary: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: BorderRadius.xl,
        // HIGH CONTRAST: Solid WHITE background
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#FFFFFF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    buttonPrimaryText: {
        fontSize: 16,
        fontWeight: '600',
        // HIGH CONTRAST: BLACK text on WHITE button
        color: '#000000',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════════════════════════

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
    },

    loadingText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: Spacing.md,
    },
});
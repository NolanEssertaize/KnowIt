/**
 * @file ProfileScreen.styles.ts
 * @description Styles pour l'écran de profil - Monochrome "AI Driver" Theme
 *
 * REWORK: Pure black/white aesthetic
 * - No colored accents
 * - Native glassmorphism (iOS blur)
 * - Content-first hierarchy
 */

import { StyleSheet, Platform } from 'react-native';
import { GlassColors, Spacing, BorderRadius, FontSize, FontWeight, Shadows } from '@/theme';

export const styles = StyleSheet.create({
    // ═══════════════════════════════════════════════════════════════════════════
    // LOADING STATE
    // ═══════════════════════════════════════════════════════════════════════════

    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.md,
    },

    loadingText: {
        fontSize: FontSize.md,
        color: GlassColors.text.secondary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // HEADER - Native Platform Style
    // ═══════════════════════════════════════════════════════════════════════════

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.lg,
        paddingBottom: Spacing.md,
    },

    backButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.full,
        backgroundColor: GlassColors.glass.background,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        // Monochrome shadow (no colored glow)
        ...Shadows.glassLight,
    },

    headerTitle: {
        flex: 1,
        fontSize: FontSize['2xl'],
        fontWeight: FontWeight.bold,
        color: GlassColors.text.primary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // GLASSMORPHISM TABS - iOS Native Style
    // ═══════════════════════════════════════════════════════════════════════════

    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: Spacing.xs,
        backgroundColor: GlassColors.glass.background,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
        ...Shadows.glassLight,
    },

    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.sm,
        borderRadius: BorderRadius.md,
    },

    tabActive: {
        backgroundColor: GlassColors.glass.backgroundLight,
        borderWidth: 1,
        borderColor: GlassColors.glass.borderLight,
        ...Shadows.glassLight,
    },

    tabText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.tertiary,
    },

    tabTextActive: {
        color: GlassColors.text.primary,
        fontWeight: FontWeight.semibold,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // CONTENT
    // ═══════════════════════════════════════════════════════════════════════════

    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },

    scrollContent: {
        paddingBottom: Spacing.xxl + 100,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SECTION
    // ═══════════════════════════════════════════════════════════════════════════

    section: {
        marginBottom: Spacing.xl,
    },

    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: GlassColors.text.tertiary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },

    sectionCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LIST ITEMS
    // ═══════════════════════════════════════════════════════════════════════════

    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },

    listItemLast: {
        borderBottomWidth: 0,
    },

    listItemIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        // Monochrome: use subtle background instead of colored
        backgroundColor: GlassColors.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    listItemContent: {
        flex: 1,
    },

    listItemLabel: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.primary,
        marginBottom: 2,
    },

    listItemValue: {
        fontSize: FontSize.sm,
        color: GlassColors.text.secondary,
    },

    listItemChevron: {
        marginLeft: Spacing.sm,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // INPUT ITEM
    // ═══════════════════════════════════════════════════════════════════════════

    inputItem: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },

    inputLabel: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.secondary,
        marginBottom: Spacing.xs,
    },

    input: {
        fontSize: FontSize.md,
        color: GlassColors.text.primary,
        paddingVertical: Spacing.xs,
    },

    inputReadOnly: {
        fontSize: FontSize.md,
        color: GlassColors.text.tertiary,
        paddingVertical: Spacing.xs,
    },

    saveButton: {
        marginTop: Spacing.md,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // SWITCH ITEM
    // ═══════════════════════════════════════════════════════════════════════════

    switchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },

    switchLabel: {
        flex: 1,
        marginRight: Spacing.md,
    },

    switchTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.primary,
        marginBottom: 2,
    },

    switchDescription: {
        fontSize: FontSize.sm,
        color: GlassColors.text.secondary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LANGUAGE SELECTOR - Monochrome
    // ═══════════════════════════════════════════════════════════════════════════

    languageSelector: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.xs,
    },

    languageOption: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: GlassColors.glass.background,
        borderWidth: 1,
        borderColor: GlassColors.glass.border,
        alignItems: 'center',
    },

    languageOptionActive: {
        // Monochrome: Use solid foreground color instead of accent
        backgroundColor: GlassColors.text.primary,
        borderColor: GlassColors.text.primary,
    },

    languageText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: GlassColors.text.secondary,
    },

    languageTextActive: {
        // Inverse color when active (white on black / black on white)
        color: GlassColors.glass.background === 'rgba(255, 255, 255, 0.08)'
            ? '#000000'
            : '#FFFFFF',
        fontWeight: FontWeight.semibold,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // DANGER ITEM - Monochrome (No red)
    // ═══════════════════════════════════════════════════════════════════════════

    dangerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: GlassColors.glass.border,
    },

    dangerIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        // Monochrome: subtle background instead of red tint
        backgroundColor: GlassColors.surface.elevated,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    dangerText: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: FontWeight.medium,
        // Monochrome: use primary foreground (emphasized through weight)
        color: GlassColors.text.primary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // COPYRIGHT
    // ═══════════════════════════════════════════════════════════════════════════

    copyright: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginTop: Spacing.lg,
    },

    copyrightText: {
        fontSize: FontSize.sm,
        color: GlassColors.text.tertiary,
    },

    // ═══════════════════════════════════════════════════════════════════════════
    // LOGOUT BUTTON
    // ═══════════════════════════════════════════════════════════════════════════

    logoutButton: {
        marginTop: Spacing.lg,
        marginBottom: Spacing.xl,
    },
});
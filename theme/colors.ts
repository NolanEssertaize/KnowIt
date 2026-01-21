/**
 * @file colors.ts
 * @description Design tokens - Monochrome "AI Driver" Palette
 *
 * REWORK: Converted from Glassmorphism Electric Cyan to Pure Monochrome
 * - Light Mode: #FFFFFF Background, #000000 Text/Icons
 * - Dark Mode: #000000 Background, #FFFFFF Text/Icons
 */

import { useColorScheme } from 'react-native';

// ═══════════════════════════════════════════════════════════════════════════
// MONOCHROME COLOR PALETTE
// ═══════════════════════════════════════════════════════════════════════════

export const MonochromeColors = {
    // ─────────────────────────────────────────────────────────────────────────
    // LIGHT MODE
    // ─────────────────────────────────────────────────────────────────────────
    light: {
        background: {
            primary: '#FFFFFF',
            secondary: '#FAFAFA',
            tertiary: '#F5F5F5',
        },
        foreground: {
            primary: '#000000',
            secondary: '#1A1A1A',
            tertiary: '#404040',
            muted: '#737373',
            subtle: '#A3A3A3',
        },
        border: {
            default: 'rgba(0, 0, 0, 0.08)',
            strong: 'rgba(0, 0, 0, 0.15)',
            focus: 'rgba(0, 0, 0, 0.25)',
        },
        surface: {
            glass: 'rgba(255, 255, 255, 0.75)',
            glassLight: 'rgba(255, 255, 255, 0.85)',
            glassDark: 'rgba(0, 0, 0, 0.03)',
            elevated: 'rgba(255, 255, 255, 0.9)',
            pressed: 'rgba(0, 0, 0, 0.05)',
            disabled: 'rgba(0, 0, 0, 0.02)',
        },
    },

    // ─────────────────────────────────────────────────────────────────────────
    // DARK MODE
    // ─────────────────────────────────────────────────────────────────────────
    dark: {
        background: {
            primary: '#000000',
            secondary: '#0A0A0A',
            tertiary: '#141414',
        },
        foreground: {
            primary: '#FFFFFF',
            secondary: '#E5E5E5',
            tertiary: '#A3A3A3',
            muted: '#737373',
            subtle: '#525252',
        },
        border: {
            default: 'rgba(255, 255, 255, 0.08)',
            strong: 'rgba(255, 255, 255, 0.15)',
            focus: 'rgba(255, 255, 255, 0.25)',
        },
        surface: {
            glass: 'rgba(255, 255, 255, 0.06)',
            glassLight: 'rgba(255, 255, 255, 0.10)',
            glassDark: 'rgba(0, 0, 0, 0.3)',
            elevated: 'rgba(255, 255, 255, 0.04)',
            pressed: 'rgba(255, 255, 255, 0.08)',
            disabled: 'rgba(255, 255, 255, 0.02)',
        },
    },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY COMPATIBILITY LAYER (GlassColors)
// Maps old GlassColors API to new Monochrome system
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates theme-aware GlassColors for backward compatibility
 * @param isDark - Whether dark mode is active
 */
export function createGlassColors(isDark: boolean) {
    const colors = isDark ? MonochromeColors.dark : MonochromeColors.light;

    return {
        // Gradient replaced with solid backgrounds
        gradient: {
            start: colors.background.primary,
            middle: colors.background.secondary,
            end: colors.background.tertiary,
        },

        // Glass surfaces
        glass: {
            background: colors.surface.glass,
            backgroundLight: colors.surface.glassLight,
            backgroundDark: colors.surface.glassDark,
            border: colors.border.default,
            borderLight: colors.border.strong,
        },

        // Accent colors - NOW MONOCHROME (use foreground for emphasis)
        accent: {
            primary: colors.foreground.primary,
            secondary: colors.foreground.secondary,
            tertiary: colors.foreground.tertiary,
            glow: 'transparent', // No colored glows in monochrome
        },

        // Semantic colors - Monochrome variants
        semantic: {
            success: colors.foreground.primary,
            successGlow: 'transparent',
            warning: colors.foreground.tertiary,
            warningGlow: 'transparent',
            error: colors.foreground.primary,
            errorGlow: 'transparent',
            info: colors.foreground.secondary,
        },

        // Text hierarchy
        text: {
            primary: colors.foreground.primary,
            secondary: colors.foreground.secondary,
            tertiary: colors.foreground.tertiary,
            muted: colors.foreground.muted,
            accent: colors.foreground.primary, // No colored accent text
        },

        // Surface states
        surface: {
            elevated: colors.surface.elevated,
            pressed: colors.surface.pressed,
            disabled: colors.surface.disabled,
        },
    };
}

// Default export for dark mode (matches original app default)
export const GlassColors = createGlassColors(true);

export type GlassColorsType = ReturnType<typeof createGlassColors>;
export type MonochromeColorsType = typeof MonochromeColors;
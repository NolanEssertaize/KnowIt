/**
 * @file theme.ts
 * @description KnowIt Design System - Monochrome "AI Driver" Theme
 *
 * UPDATED: Full theme switching support (Light/Dark/System)
 * - Pure black/white aesthetic
 * - Platform-native materials
 * - Content-first hierarchy through typography weight
 */

import { Platform, ViewStyle, TextStyle } from 'react-native';
import { GlassColors, createGlassColors, MonochromeColors } from './colors';

// ═══════════════════════════════════════════════════════════════════════════
// SPACING
// ═══════════════════════════════════════════════════════════════════════════

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export type SpacingType = typeof Spacing;
export type SpacingKey = keyof SpacingType;

// ═══════════════════════════════════════════════════════════════════════════
// BORDER RADIUS
// ═══════════════════════════════════════════════════════════════════════════

export const BorderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  full: 9999,
} as const;

export type BorderRadiusType = typeof BorderRadius;
export type BorderRadiusKey = keyof BorderRadiusType;

// ═══════════════════════════════════════════════════════════════════════════
// SHADOWS (Theme-aware)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Creates theme-aware shadows
 * Light mode: darker shadows for depth
 * Dark mode: subtle shadows (less visible on dark)
 */
export function createShadows(isDark: boolean) {
  const shadowColor = isDark ? '#000000' : '#000000';
  const opacityMultiplier = isDark ? 0.5 : 1; // Reduce shadow visibility in dark mode

  return {
    // Subtle shadow for cards
    subtle: {
      shadowColor,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06 * opacityMultiplier,
      shadowRadius: 3,
      elevation: 1,
    } as ViewStyle,

    // Glass-like shadow
    glassLight: {
      shadowColor,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08 * opacityMultiplier,
      shadowRadius: 8,
      elevation: 3,
    } as ViewStyle,

    // Standard glass shadow
    glass: {
      shadowColor,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12 * opacityMultiplier,
      shadowRadius: 16,
      elevation: 6,
    } as ViewStyle,

    // Strong shadow for elevated elements
    strong: {
      shadowColor,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15 * opacityMultiplier,
      shadowRadius: 24,
      elevation: 10,
    } as ViewStyle,

    // Glow effect - neutral shadow (no color)
    glow: (_color?: string): ViewStyle => ({
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.1 * opacityMultiplier,
      shadowRadius: 12,
      elevation: 4,
    }),

    // No shadow
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    } as ViewStyle,
  };
}

// Default shadows (dark mode for backward compatibility)
export const Shadows = createShadows(true);

export type ShadowsType = ReturnType<typeof createShadows>;

// ═══════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY
// ═══════════════════════════════════════════════════════════════════════════

export const FontFamily = Platform.select({
  ios: {
    sans: 'System',
    mono: 'Menlo',
  },
  android: {
    sans: 'Roboto',
    mono: 'monospace',
  },
  default: {
    sans: 'System',
    mono: 'monospace',
  },
});

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  '2xl': 24,
  '3xl': 28,
  '4xl': 34,
  '5xl': 42,
} as const;

export const FontWeight = {
  normal: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semibold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
} as const;

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

export type FontSizeType = typeof FontSize;
export type FontWeightType = typeof FontWeight;

// ═══════════════════════════════════════════════════════════════════════════
// GLASSMORPHISM CONFIG (Platform-Native Materials)
// ═══════════════════════════════════════════════════════════════════════════

export const GlassMaterials = {
  // iOS: Native blur intensities
  ios: {
    navBar: 80,
    card: 60,
    modal: 90,
    overlay: 50,
  },

  // Blur tints (theme-aware)
  tint: {
    light: 'light' as const,
    dark: 'dark' as const,
    default: 'default' as const,
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ANIMATION DURATIONS
// ═══════════════════════════════════════════════════════════════════════════

export const Duration = {
  instant: 0,
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
} as const;

export type DurationType = typeof Duration;

// ═══════════════════════════════════════════════════════════════════════════
// LEGACY COLORS EXPORT (Backward Compatibility)
// ═══════════════════════════════════════════════════════════════════════════

const tintColorLight = '#000000'; // Black for light mode
const tintColorDark = '#FFFFFF';  // White for dark mode

export const Colors = {
  light: {
    text: MonochromeColors.light.foreground.primary,
    background: MonochromeColors.light.background.primary,
    tint: tintColorLight,
    icon: MonochromeColors.light.foreground.tertiary,
    tabIconDefault: MonochromeColors.light.foreground.muted,
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: MonochromeColors.dark.foreground.primary,
    background: MonochromeColors.dark.background.primary,
    tint: tintColorDark,
    icon: MonochromeColors.dark.foreground.tertiary,
    tabIconDefault: MonochromeColors.dark.foreground.muted,
    tabIconSelected: tintColorDark,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

// Re-export colors
export { GlassColors, createGlassColors, MonochromeColors } from './colors';
export type { GlassColorsType, MonochromeColorsType, ThemeColors } from './colors';

// Re-export theme context
export { ThemeProvider, useTheme, useThemeColors } from './ThemeContext';
export type { ThemeMode, ThemeContextValue } from './ThemeContext';

// Re-export components
export { ThemeSelector, ThemeSegmentedControl, ThemeSelectorInline } from './ThemeSelector';

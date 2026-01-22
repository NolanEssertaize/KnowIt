/**
 * @file index.ts
 * @description Theme module exports
 *
 * Usage:
 * import { useTheme, ThemeProvider, GlassColors } from '@/theme';
 */

// ═══════════════════════════════════════════════════════════════════════════
// COLORS
// ═══════════════════════════════════════════════════════════════════════════

export {
  GlassColors,
  createGlassColors,
  MonochromeColors,
} from './colors';

export type {
  GlassColorsType,
  MonochromeColorsType,
  ThemeColors,
} from './colors';

// ═══════════════════════════════════════════════════════════════════════════
// THEME CONTEXT & HOOKS
// ═══════════════════════════════════════════════════════════════════════════

export {
  ThemeProvider,
  useTheme,
  useThemeColors,
} from './ThemeContext';

export type {
  ThemeMode,
  ThemeContextValue,
} from './ThemeContext';

// ═══════════════════════════════════════════════════════════════════════════
// THEME SELECTOR COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  ThemeSelector,
  ThemeSegmentedControl,
  ThemeSelectorInline,
} from './ThemeSelector';

// ═══════════════════════════════════════════════════════════════════════════
// THEMED STYLES HOOK
// ═══════════════════════════════════════════════════════════════════════════

export {
  useThemedStyles,
  useCommonThemedStyles,
  createThemedStyleFactory,
} from './useThemedStyles';

// ═══════════════════════════════════════════════════════════════════════════
// DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Spacing
  Spacing,
  
  // Border Radius
  BorderRadius,
  
  // Shadows
  Shadows,
  createShadows,
  
  // Typography
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  
  // Glass materials
  GlassMaterials,
  
  // Animation
  Duration,
  
  // Legacy colors
  Colors,
} from './theme';

export type {
  SpacingType,
  SpacingKey,
  BorderRadiusType,
  BorderRadiusKey,
  ShadowsType,
  FontSizeType,
  FontWeightType,
  DurationType,
} from './theme';

/**
 * @file AuthLayout.styles.ts
 * @description Styles for AuthLayout component
 */

import { StyleSheet, Dimensions } from 'react-native';
import { GlassColors, Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },

  safeArea: {
    flex: 1,
  },

  keyboardAvoid: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // BRAND SECTION
  // ─────────────────────────────────────────────────────────────────────────

  brandSection: {
    alignItems: 'center',
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.xl,
  },

  logoContainer: {
    marginBottom: Spacing.md,
  },

  logoOrbOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(0, 212, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    // Glow effect
    shadowColor: GlassColors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },

  logoOrbMiddle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoOrbInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: GlassColors.accent.primary,
    alignItems: 'center',
    justifyContent: 'center',
    // Inner glow
    shadowColor: GlassColors.accent.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
  },

  logoText: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: GlassColors.gradient.end,
  },

  appName: {
    fontSize: FontSize['3xl'],
    fontWeight: FontWeight.bold,
    color: GlassColors.text.primary,
    letterSpacing: 1,
  },

  tagline: {
    fontSize: FontSize.sm,
    color: GlassColors.text.tertiary,
    marginTop: Spacing.xs,
    letterSpacing: 0.5,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // HEADER SECTION
  // ─────────────────────────────────────────────────────────────────────────

  headerSection: {
    marginBottom: Spacing.xl,
  },

  title: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    color: GlassColors.text.primary,
    textAlign: 'center',
    marginBottom: Spacing.xs,
  },

  subtitle: {
    fontSize: FontSize.md,
    color: GlassColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FORM SECTION
  // ─────────────────────────────────────────────────────────────────────────

  formSection: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FOOTER SECTION
  // ─────────────────────────────────────────────────────────────────────────

  footerSection: {
    marginTop: Spacing.xl,
    paddingTop: Spacing.lg,
    alignItems: 'center',
  },
});

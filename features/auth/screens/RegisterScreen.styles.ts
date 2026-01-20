/**
 * @file RegisterScreen.styles.ts
 * @description Styles for RegisterScreen component
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

export const styles = StyleSheet.create({
  // ─────────────────────────────────────────────────────────────────────────
  // HINT
  // ─────────────────────────────────────────────────────────────────────────

  hintContainer: {
    marginBottom: Spacing.md,
  },

  hintText: {
    fontSize: FontSize.xs,
    color: GlassColors.text.tertiary,
    marginLeft: Spacing.xs,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // ERROR
  // ─────────────────────────────────────────────────────────────────────────

  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: GlassColors.semantic.error,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },

  errorText: {
    fontSize: FontSize.sm,
    color: GlassColors.semantic.error,
    textAlign: 'center',
  },

  // ─────────────────────────────────────────────────────────────────────────
  // REGISTER BUTTON
  // ─────────────────────────────────────────────────────────────────────────

  buttonContainer: {
    marginTop: Spacing.sm,
  },

  registerButton: {
    height: 56,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    // Glow effect
    shadowColor: GlassColors.accent.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },

  registerButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: GlassColors.text.primary,
    letterSpacing: 0.5,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // TERMS
  // ─────────────────────────────────────────────────────────────────────────

  termsContainer: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.md,
  },

  termsText: {
    fontSize: FontSize.xs,
    color: GlassColors.text.tertiary,
    textAlign: 'center',
    lineHeight: 18,
  },

  termsLink: {
    color: GlassColors.accent.primary,
    fontWeight: FontWeight.medium,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // DIVIDER
  // ─────────────────────────────────────────────────────────────────────────

  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl,
  },

  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: GlassColors.glass.border,
  },

  dividerText: {
    fontSize: FontSize.sm,
    color: GlassColors.text.tertiary,
    marginHorizontal: Spacing.md,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // SOCIAL BUTTONS
  // ─────────────────────────────────────────────────────────────────────────

  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.md,
  },

  socialButton: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: GlassColors.glass.background,
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  socialButtonText: {
    fontSize: 24,
    color: GlassColors.text.primary,
  },

  // ─────────────────────────────────────────────────────────────────────────
  // FOOTER
  // ─────────────────────────────────────────────────────────────────────────

  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },

  footerText: {
    fontSize: FontSize.md,
    color: GlassColors.text.secondary,
  },

  footerLink: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: GlassColors.accent.primary,
  },
});

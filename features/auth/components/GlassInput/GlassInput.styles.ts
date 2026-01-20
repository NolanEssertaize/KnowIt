/**
 * @file GlassInput.styles.ts
 * @description Styles for GlassInput component
 */

import { StyleSheet } from 'react-native';
import { GlassColors, Spacing, BorderRadius, FontSize } from '@/theme';

export const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },

  label: {
    fontSize: FontSize.sm,
    fontWeight: '500',
    color: GlassColors.text.secondary,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },

  labelError: {
    color: GlassColors.semantic.error,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: GlassColors.glass.background,
    borderWidth: 1,
    borderColor: GlassColors.glass.border,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    minHeight: 56,
  },

  inputContainerFocused: {
    borderColor: GlassColors.accent.primary,
    backgroundColor: GlassColors.glass.backgroundLight,
  },

  inputContainerError: {
    borderColor: GlassColors.semantic.error,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
  },

  inputContainerDisabled: {
    backgroundColor: GlassColors.surface.disabled,
    opacity: 0.6,
  },

  leftIcon: {
    marginRight: Spacing.sm,
  },

  input: {
    flex: 1,
    fontSize: FontSize.md,
    color: GlassColors.text.primary,
    paddingVertical: Spacing.md,
  },

  inputWithLeftIcon: {
    paddingLeft: 0,
  },

  inputWithRightIcon: {
    paddingRight: Spacing.xl,
  },

  passwordToggle: {
    position: 'absolute',
    right: Spacing.md,
    padding: Spacing.xs,
  },

  errorText: {
    fontSize: FontSize.xs,
    color: GlassColors.semantic.error,
    marginTop: Spacing.xs,
    marginLeft: Spacing.xs,
  },
});

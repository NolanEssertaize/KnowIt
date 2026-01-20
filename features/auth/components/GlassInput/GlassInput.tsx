/**
 * @file GlassInput.tsx
 * @description Text Input with Glassmorphism style
 */

import React, { useState, forwardRef, memo } from 'react';
import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff, type LucideIcon } from 'lucide-react-native';
import { GlassColors } from '@/theme';
import { styles } from './GlassInput.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface GlassInputProps extends Omit<TextInputProps, 'style'> {
  /** Input label */
  label?: string;
  /** Error message */
  error?: string;
  /** Left icon component */
  leftIcon?: LucideIcon;
  /** Whether this is a password field */
  isPassword?: boolean;
  /** Container style override */
  containerStyle?: ViewStyle;
  /** Whether input is disabled */
  disabled?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const GlassInput = memo(forwardRef<TextInput, GlassInputProps>(
  function GlassInput(
    {
      label,
      error,
      leftIcon: LeftIcon,
      isPassword = false,
      containerStyle,
      disabled = false,
      ...textInputProps
    },
    ref,
  ) {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const hasError = Boolean(error);

    const handleFocus = () => {
      setIsFocused(true);
      textInputProps.onFocus?.({} as any);
    };

    const handleBlur = () => {
      setIsFocused(false);
      textInputProps.onBlur?.({} as any);
    };

    const togglePasswordVisibility = () => {
      setIsPasswordVisible((prev) => !prev);
    };

    return (
      <View style={[styles.container, containerStyle]}>
        {/* Label */}
        {label && (
          <Text style={[styles.label, hasError && styles.labelError]}>
            {label}
          </Text>
        )}

        {/* Input Container */}
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            hasError && styles.inputContainerError,
            disabled && styles.inputContainerDisabled,
          ]}
        >
          {/* Left Icon */}
          {LeftIcon && (
            <LeftIcon
              size={20}
              color={
                hasError
                  ? GlassColors.semantic.error
                  : isFocused
                    ? GlassColors.accent.primary
                    : GlassColors.text.tertiary
              }
              style={styles.leftIcon}
            />
          )}

          {/* Text Input */}
          <TextInput
            ref={ref}
            style={[
              styles.input,
              LeftIcon && styles.inputWithLeftIcon,
              isPassword && styles.inputWithRightIcon,
            ]}
            placeholderTextColor={GlassColors.text.tertiary}
            selectionColor={GlassColors.accent.primary}
            onFocus={handleFocus}
            onBlur={handleBlur}
            editable={!disabled}
            secureTextEntry={isPassword && !isPasswordVisible}
            autoCapitalize={isPassword ? 'none' : textInputProps.autoCapitalize}
            autoCorrect={isPassword ? false : textInputProps.autoCorrect}
            {...textInputProps}
          />

          {/* Password Toggle */}
          {isPassword && (
            <TouchableOpacity
              onPress={togglePasswordVisibility}
              style={styles.passwordToggle}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              {isPasswordVisible ? (
                <EyeOff size={20} color={GlassColors.text.tertiary} />
              ) : (
                <Eye size={20} color={GlassColors.text.tertiary} />
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {hasError && (
          <Text style={styles.errorText}>{error}</Text>
        )}
      </View>
    );
  },
));

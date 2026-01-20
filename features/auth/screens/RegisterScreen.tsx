/**
 * @file RegisterScreen.tsx
 * @description Register screen with glassmorphism design
 * 
 * Pattern: MVVM - Uses useAuth hook for business logic
 */

import React, { memo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GlassInput } from '@/features/auth/components/GlassInput';
import { GlassColors } from '@/theme';
import { styles } from './RegisterScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const RegisterScreen = memo(function RegisterScreen() {
  const router = useRouter();
  
  // Input refs for keyboard navigation
  const emailInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  // Hook for auth logic
  const {
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    fullName,
    setFullName,
    isLoading,
    error,
    validationErrors,
    handleRegister,
    clearError,
  } = useAuth();

  /**
   * Handle register button press
   */
  const onRegisterPress = async () => {
    clearError();
    
    const result = await handleRegister();
    
    if (result.success) {
      router.replace('/');
    } else if (result.error) {
      Alert.alert('Registration Failed', result.error);
    }
  };

  /**
   * Navigate to login screen
   */
  const onLoginPress = () => {
    router.back();
  };

  /**
   * Handle keyboard navigation
   */
  const onFullNameSubmit = () => emailInputRef.current?.focus();
  const onEmailSubmit = () => passwordInputRef.current?.focus();
  const onPasswordSubmit = () => confirmPasswordInputRef.current?.focus();

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start your learning journey today"
      footer={
        <View style={styles.footerContent}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={onLoginPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {/* Full Name Input */}
      <GlassInput
        label="Full Name"
        placeholder="Enter your name"
        value={fullName}
        onChangeText={setFullName}
        error={validationErrors.fullName}
        leftIcon={User}
        autoCapitalize="words"
        autoComplete="name"
        returnKeyType="next"
        onSubmitEditing={onFullNameSubmit}
        editable={!isLoading}
      />

      {/* Email Input */}
      <GlassInput
        ref={emailInputRef}
        label="Email"
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        error={validationErrors.email}
        leftIcon={Mail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete="email"
        returnKeyType="next"
        onSubmitEditing={onEmailSubmit}
        editable={!isLoading}
      />

      {/* Password Input */}
      <GlassInput
        ref={passwordInputRef}
        label="Password"
        placeholder="Create a password"
        value={password}
        onChangeText={setPassword}
        error={validationErrors.password}
        leftIcon={Lock}
        isPassword
        autoComplete="password-new"
        returnKeyType="next"
        onSubmitEditing={onPasswordSubmit}
        editable={!isLoading}
      />

      {/* Confirm Password Input */}
      <GlassInput
        ref={confirmPasswordInputRef}
        label="Confirm Password"
        placeholder="Confirm your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={validationErrors.confirmPassword}
        leftIcon={Lock}
        isPassword
        autoComplete="password-new"
        returnKeyType="done"
        onSubmitEditing={onRegisterPress}
        editable={!isLoading}
      />

      {/* Password Requirements Hint */}
      <View style={styles.hintContainer}>
        <Text style={styles.hintText}>
          Password must be at least 8 characters
        </Text>
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Register Button */}
      <TouchableOpacity
        onPress={onRegisterPress}
        disabled={isLoading}
        activeOpacity={0.8}
        style={styles.buttonContainer}
      >
        <LinearGradient
          colors={
            isLoading
              ? [GlassColors.text.tertiary, GlassColors.text.muted]
              : [GlassColors.accent.primary, GlassColors.accent.secondary]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.registerButton}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={GlassColors.text.primary} />
          ) : (
            <Text style={styles.registerButtonText}>Create Account</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Terms & Conditions */}
      <View style={styles.termsContainer}>
        <Text style={styles.termsText}>
          By creating an account, you agree to our{' '}
          <Text style={styles.termsLink}>Terms of Service</Text>
          {' '}and{' '}
          <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Register Buttons */}
      <View style={styles.socialContainer}>
        <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
          <Text style={styles.socialButtonText}>G</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.socialButton} disabled={isLoading}>
          <Text style={styles.socialButtonText}>🍎</Text>
        </TouchableOpacity>
      </View>
    </AuthLayout>
  );
});

/**
 * @file LoginScreen.tsx
 * @description Login screen with glassmorphism design
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
import { Mail, Lock } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GlassInput } from '@/features/auth/components/GlassInput';
import { GlassColors } from '@/theme';
import { styles } from './LoginScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LoginScreen = memo(function LoginScreen() {
  const router = useRouter();
  const passwordInputRef = useRef<TextInput>(null);

  // Hook for auth logic
  const {
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    error,
    validationErrors,
    handleLogin,
    clearError,
  } = useAuth();

  /**
   * Handle login button press
   */
  const onLoginPress = async () => {
    clearError();
    
    const result = await handleLogin();
    
    if (result.success) {
      router.replace('/');
    } else if (result.error) {
      Alert.alert('Login Failed', result.error);
    }
  };

  /**
   * Navigate to register screen
   */
  const onRegisterPress = () => {
    router.push('/register');
  };

  /**
   * Focus password input when email is submitted
   */
  const onEmailSubmit = () => {
    passwordInputRef.current?.focus();
  };

  return (
    <AuthLayout
      title="Welcome Back"
      subtitle="Sign in to continue your learning journey"
      footer={
        <View style={styles.footerContent}>
          <Text style={styles.footerText}>Don't have an account?</Text>
          <TouchableOpacity onPress={onRegisterPress} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.footerLink}>Sign Up</Text>
          </TouchableOpacity>
        </View>
      }
    >
      {/* Email Input */}
      <GlassInput
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
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
        error={validationErrors.password}
        leftIcon={Lock}
        isPassword
        autoComplete="password"
        returnKeyType="done"
        onSubmitEditing={onLoginPress}
        editable={!isLoading}
      />

      {/* Forgot Password Link */}
      <TouchableOpacity style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Login Button */}
      <TouchableOpacity
        onPress={onLoginPress}
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
          style={styles.loginButton}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={GlassColors.text.primary} />
          ) : (
            <Text style={styles.loginButtonText}>Sign In</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Divider */}
      <View style={styles.dividerContainer}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      {/* Social Login Buttons */}
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

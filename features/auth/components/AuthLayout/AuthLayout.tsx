/**
 * @file AuthLayout.tsx
 * @description Shared layout for authentication screens
 * 
 * Provides:
 * - Glassmorphism gradient background
 * - Keyboard avoiding behavior
 * - Logo/branding area
 * - Scrollable content area
 */

import React, { memo, type ReactNode } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { GlassColors } from '@/theme';
import { styles } from './AuthLayout.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface AuthLayoutProps {
  /** Screen title */
  title: string;
  /** Subtitle/description */
  subtitle?: string;
  /** Main content */
  children: ReactNode;
  /** Footer content (e.g., "Already have an account?") */
  footer?: ReactNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AuthLayout = memo(function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={[
          GlassColors.gradient.start,
          GlassColors.gradient.middle,
          GlassColors.gradient.end,
        ]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardAvoid}
          >
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* Logo/Brand Section */}
              <View style={styles.brandSection}>
                <View style={styles.logoContainer}>
                  {/* LED Orb Effect */}
                  <View style={styles.logoOrbOuter}>
                    <View style={styles.logoOrbMiddle}>
                      <View style={styles.logoOrbInner}>
                        <Text style={styles.logoText}>K</Text>
                      </View>
                    </View>
                  </View>
                </View>
                <Text style={styles.appName}>KnowIt</Text>
                <Text style={styles.tagline}>Learn by explaining</Text>
              </View>

              {/* Header Section */}
              <View style={styles.headerSection}>
                <Text style={styles.title}>{title}</Text>
                {subtitle && (
                  <Text style={styles.subtitle}>{subtitle}</Text>
                )}
              </View>

              {/* Form Section */}
              <View style={styles.formSection}>
                {children}
              </View>

              {/* Footer Section */}
              {footer && (
                <View style={styles.footerSection}>
                  {footer}
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </LinearGradient>
    </>
  );
});

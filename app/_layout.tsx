/**
 * @file _layout.tsx
 * @description Root Layout - Theme + Auth + i18n Provider
 *
 * FIXED VERSION - Combines main branch stability with i18n branch features
 *
 * Changes from broken i18n branch:
 * 1. Added GestureHandlerRootView wrapper (REQUIRED)
 * 2. Added SafeAreaProvider (REQUIRED for useSafeAreaInsets)
 * 3. Proper i18n initialization order
 * 4. Fixed StatusBar style based on theme
 */

import React, { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
    View,
    Text,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as SplashScreen from 'expo-splash-screen';

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTANT: Initialize i18n BEFORE any components that use translations
// This import has side effects - it initializes i18next
// ═══════════════════════════════════════════════════════════════════════════
import '@/i18n';

import { ThemeProvider, useTheme } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useServerHealth } from '@/shared/hooks/useServerHealth';

// Prevent splash screen from auto-hiding until we're ready
SplashScreen.preventAutoHideAsync();

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTION GATE
// Shows loading screen while connecting to the server
// ═══════════════════════════════════════════════════════════════════════════

interface ConnectionGateProps {
    children: React.ReactNode;
}

function ConnectionGate({ children }: ConnectionGateProps) {
    const { colors, isDark } = useTheme();
    const { isConnected, isChecking, error, attempt } = useServerHealth();

    // Hide splash screen once we have connection status
    useEffect(() => {
        if (!isChecking) {
            SplashScreen.hideAsync();
        }
    }, [isChecking]);

    if (!isConnected || isChecking) {
        return (
            <View style={[styles.connectionContainer, { backgroundColor: colors.background.primary }]}>
                <StatusBar style={isDark ? 'light' : 'dark'} />

                {/* Logo */}
                <View style={styles.logoContainer}>
                    <View style={[
                        styles.logoOuter,
                        { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' }
                    ]}>
                        <View style={[
                            styles.logoMiddle,
                            { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)' }
                        ]}>
                            <View style={[styles.logoInner, { backgroundColor: colors.text.primary }]}>
                                <Text style={[styles.logoText, { color: colors.text.inverse }]}>K</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* App Name */}
                <Text style={[styles.appName, { color: colors.text.primary }]}>KnowIt</Text>

                {/* Status */}
                <View style={styles.statusContainer}>
                    <ActivityIndicator size="small" color={colors.text.primary} />
                    <Text style={[styles.statusText, { color: colors.text.secondary }]}>
                        {error
                            ? `Retrying... (attempt ${attempt})`
                            : 'Connecting to server...'}
                    </Text>
                </View>
            </View>
        );
    }

    return <>{children}</>;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH NAVIGATOR
// Handles authentication-based navigation
// ═══════════════════════════════════════════════════════════════════════════

interface AuthNavigatorProps {
    children: React.ReactNode;
}

function AuthNavigator({ children }: AuthNavigatorProps) {
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();
    const { isAuthenticated, isLoading, initialize } = useAuthStore();
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize auth state on mount
    useEffect(() => {
        const initAuth = async () => {
            try {
                await initialize();
            } catch (error) {
                console.error('[AuthNavigator] Initialization error:', error);
            } finally {
                setIsInitialized(true);
            }
        };

        initAuth();
    }, [initialize]);

    // Handle navigation based on auth state
    useEffect(() => {
        if (!navigationState?.key || !isInitialized || isLoading) {
            return;
        }

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            // Not authenticated and not in auth group -> go to login
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            // Authenticated but in auth group -> go to main app
            router.replace('/');
        }
    }, [isAuthenticated, segments, navigationState?.key, isInitialized, isLoading, router]);

    // Show nothing while initializing to prevent flash
    if (!isInitialized) {
        return null;
    }

    return <>{children}</>;
}

// ═══════════════════════════════════════════════════════════════════════════
// THEMED APP CONTENT
// Main app content with theme-aware styling
// ═══════════════════════════════════════════════════════════════════════════

function ThemedAppContent() {
    const { colors, isDark } = useTheme();

    return (
        <ConnectionGate>
            <AuthNavigator>
                <LinearGradient
                    colors={[
                        colors.gradient.start,
                        colors.gradient.middle,
                        colors.gradient.end,
                    ]}
                    style={styles.gradient}
                >
                    <StatusBar style={isDark ? 'light' : 'dark'} />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: {
                                backgroundColor: 'transparent',
                            },
                            animation: 'fade',
                        }}
                    >
                        {/* Auth screens */}
                        <Stack.Screen name="(auth)" />

                        {/* Main app */}
                        <Stack.Screen name="index" />

                        {/* Topic Detail */}
                        <Stack.Screen
                            name="[topicId]/index"
                            options={{ animation: 'slide_from_right' }}
                        />

                        {/* Session Recording Modal */}
                        <Stack.Screen
                            name="[topicId]/session"
                            options={{
                                presentation: 'fullScreenModal',
                                animation: 'slide_from_bottom',
                            }}
                        />

                        {/* Result Modal */}
                        <Stack.Screen
                            name="[topicId]/result"
                            options={{
                                presentation: 'fullScreenModal',
                                animation: 'slide_from_bottom',
                            }}
                        />

                        {/* Profile */}
                        <Stack.Screen
                            name="profile"
                            options={{ animation: 'slide_from_right' }}
                        />
                    </Stack>
                </LinearGradient>
            </AuthNavigator>
        </ConnectionGate>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT LAYOUT
// The main entry point - wraps everything with required providers
// ═══════════════════════════════════════════════════════════════════════════

export default function RootLayout() {
    return (
        <GestureHandlerRootView style={styles.container}>
            <SafeAreaProvider>
                <ThemeProvider>
                    <ThemedAppContent />
                </ThemeProvider>
            </SafeAreaProvider>
        </GestureHandlerRootView>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
    },
    connectionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    logoContainer: {
        marginBottom: 24,
    },
    logoOuter: {
        width: 120,
        height: 120,
        borderRadius: 60,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoMiddle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoInner: {
        width: 72,
        height: 72,
        borderRadius: 36,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 36,
        fontWeight: '700',
    },
    appName: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 24,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    statusText: {
        fontSize: 14,
    },
});
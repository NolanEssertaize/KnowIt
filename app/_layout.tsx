/**
 * @file _layout.tsx
 * @description Root Layout - Theme + Auth + i18n Provider
 *
 * UPDATED: Added i18n initialization
 * - Import '@/i18n' at the top to initialize i18next
 * - Language is automatically loaded from AsyncStorage
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
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTANT: Initialize i18n before anything else
// ═══════════════════════════════════════════════════════════════════════════
import '@/i18n';

import { ThemeProvider, useTheme } from '@/theme';
import { useAuthStore } from '@/store/useAuthStore';
import { useServerHealth } from '@/shared/hooks/useServerHealth';

// ═══════════════════════════════════════════════════════════════════════════
// CONNECTION GATE
// ═══════════════════════════════════════════════════════════════════════════

interface ConnectionGateProps {
    children: React.ReactNode;
}

function ConnectionGate({ children }: ConnectionGateProps) {
    const { colors, isDark } = useTheme();
    const { isConnected, isChecking, error, attempt } = useServerHealth();

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
                        {error ? `Connecting... (attempt ${attempt})` : 'Connecting to server...'}
                    </Text>
                </View>
            </View>
        );
    }

    return <>{children}</>;
}

// ═══════════════════════════════════════════════════════════════════════════
// AUTH NAVIGATOR
// ═══════════════════════════════════════════════════════════════════════════

function AuthNavigator({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const segments = useSegments();
    const navigationState = useRootNavigationState();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        if (!navigationState?.key) return;

        const inAuthGroup = segments[0] === '(auth)';

        if (!isAuthenticated && !inAuthGroup) {
            router.replace('/(auth)/login');
        } else if (isAuthenticated && inAuthGroup) {
            router.replace('/');
        }
    }, [isAuthenticated, segments, navigationState?.key, router]);

    return <>{children}</>;
}

// ═══════════════════════════════════════════════════════════════════════════
// THEMED APP CONTENT
// ═══════════════════════════════════════════════════════════════════════════

function ThemedAppContent() {
    const { colors, isDark } = useTheme();

    return (
        <ConnectionGate>
            <AuthNavigator>
                <StatusBar style={isDark ? 'light' : 'dark'} />
                <LinearGradient
                    colors={[
                        colors.gradient.start,
                        colors.gradient.middle,
                        colors.gradient.end,
                    ]}
                    style={styles.gradient}
                >
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: 'transparent' },
                            animation: 'slide_from_right',
                        }}
                    >
                        {/* Auth Group */}
                        <Stack.Screen
                            name="(auth)"
                            options={{
                                headerShown: false,
                            }}
                        />

                        {/* Main Screens */}
                        <Stack.Screen name="index" />

                        {/* Profile Modal */}
                        <Stack.Screen
                            name="profile"
                            options={{
                                presentation: 'transparentModal',
                                animation: 'fade',
                            }}
                        />

                        {/* Topic Detail */}
                        <Stack.Screen name="[topicId]/index" />

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
                    </Stack>
                </LinearGradient>
            </AuthNavigator>
        </ConnectionGate>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// ROOT LAYOUT
// ═══════════════════════════════════════════════════════════════════════════

export default function RootLayout() {
    return (
        <ThemeProvider>
            <ThemedAppContent />
        </ThemeProvider>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
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
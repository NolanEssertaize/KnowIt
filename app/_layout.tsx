/**
 * @file _layout.tsx
 * @description Root Layout - Monochrome Theme with Modal Profile
 *
 * REWORK:
 * - Profile screen uses modal presentation (slides from bottom)
 * - Transparent background for modal overlay
 * - Native platform transitions
 */

import { useEffect, useState, useCallback } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { Stack, useRouter, useSegments, useRootNavigationState } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store';
import { api } from '@/shared/api';
import { Shadows } from '@/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

// Connection states
type ConnectionState = 'connecting' | 'connected' | 'failed';

/**
 * Connection Gate Component
 */
function ConnectionGate({ children }: { children: React.ReactNode }) {
    const [connectionState, setConnectionState] = useState<ConnectionState>('connecting');
    const [attempt, setAttempt] = useState(1);
    const [error, setError] = useState<string | null>(null);

    const { initialize, isInitialized } = useAuthStore();

    const connectToApi = useCallback(async () => {
        setConnectionState('connecting');
        setError(null);

        console.log(`[ConnectionGate] Connection attempt ${attempt}...`);

        try {
            const isConnected = await api.checkConnection(1);

            if (isConnected) {
                console.log('[ConnectionGate] API connected');
                setConnectionState('connected');
                await initialize();
                SplashScreen.hideAsync();
            } else {
                throw new Error('Health check failed');
            }
        } catch (err) {
            console.log(`[ConnectionGate] Connection attempt ${attempt} failed`);
            setError('Unable to connect to server');

            const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
            console.log(`[ConnectionGate] Retrying in ${delay}ms...`);

            setTimeout(() => {
                setAttempt(prev => prev + 1);
            }, delay);
        }
    }, [attempt, initialize]);

    useEffect(() => {
        connectToApi();
    }, [attempt]);

    if (connectionState !== 'connected' || !isInitialized) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />

                {/* Logo - Monochrome */}
                <View style={styles.logoContainer}>
                    <View style={styles.logoOuter}>
                        <View style={styles.logoMiddle}>
                            <View style={styles.logoInner}>
                                <Text style={styles.logoText}>K</Text>
                            </View>
                        </View>
                    </View>
                </View>

                <Text style={styles.appName}>KnowIt</Text>

                <View style={styles.statusContainer}>
                    <ActivityIndicator size="small" color="#FFFFFF" />
                    <Text style={styles.statusText}>
                        {error ? `Connecting... (attempt ${attempt})` : 'Connecting to server...'}
                    </Text>
                </View>
            </View>
        );
    }

    return <>{children}</>;
}

/**
 * Auth Navigation Handler
 */
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

/**
 * Root Layout Component
 */
export default function RootLayout() {
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ConnectionGate>
                <AuthNavigator>
                    <StatusBar style="light" />
                    <Stack
                        screenOptions={{
                            headerShown: false,
                            contentStyle: { backgroundColor: '#000000' },
                            animation: 'slide_from_right',
                        }}
                    >
                        <Stack.Screen name="index" />

                        {/* Profile - Modal presentation (slides from bottom) */}
                        <Stack.Screen
                            name="profile"
                            options={{
                                presentation: 'transparentModal',
                                animation: 'fade',
                                contentStyle: { backgroundColor: 'transparent' },
                            }}
                        />

                        <Stack.Screen name="[topicId]" />
                        <Stack.Screen name="(auth)" options={{ animation: 'fade' }} />
                    </Stack>
                </AuthNavigator>
            </ConnectionGate>
        </GestureHandlerRootView>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// STYLES - Monochrome Theme
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000000',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
    },

    logoContainer: {
        marginBottom: 24,
    },

    logoOuter: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.glassLight,
    },

    logoMiddle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoInner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
    },

    logoText: {
        fontSize: 28,
        fontWeight: '700',
        color: '#000000',
    },

    appName: {
        fontSize: 32,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 48,
        letterSpacing: 1,
    },

    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    statusText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },
});
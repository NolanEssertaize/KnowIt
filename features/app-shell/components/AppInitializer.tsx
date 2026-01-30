/**
 * @file AppInitializer.tsx
 * @description App Initializer - Handles auth and data initialization
 *
 * FIXED:
 * - Added hasInitializedRef to prevent duplicate initialization
 * - Removed loadTopics and initializeAuth from useEffect dependencies
 * - Topics are now loaded ONLY ONCE during app startup
 *
 * Usage:
 * Wrap your app root with this component to ensure auth is initialized
 * before rendering protected content.
 */

import React, { useEffect, useState, useRef, ReactNode } from 'react';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { useAuthStore } from '@/store';
import { useStore } from '@/store';

interface AppInitializerProps {
    children: ReactNode;
    /** Component to show while loading */
    loadingComponent?: ReactNode;
}

/**
 * Default loading component
 */
function DefaultLoadingComponent() {
    return (
        <View style={styles.container}>
            <ActivityIndicator size="large" color="#7C3AED" />
            <Text style={styles.loadingText}>Loading...</Text>
        </View>
    );
}

/**
 * App Initializer Component
 *
 * Handles:
 * 1. Auth state initialization (checking stored tokens)
 * 2. Loading initial data if authenticated
 *
 * ✅ FIX: Uses ref to ensure initialization happens ONLY ONCE
 */
export function AppInitializer({ children, loadingComponent }: AppInitializerProps) {
    const [isReady, setIsReady] = useState(false);

    // ✅ FIX: Track if initialization has already happened
    const hasInitializedRef = useRef(false);

    // Auth store
    const { initialize: initializeAuth, isInitialized } = useAuthStore();

    // Topics store
    const { loadTopics } = useStore();

    useEffect(() => {
        // ✅ FIX: Prevent duplicate initialization
        if (hasInitializedRef.current) {
            console.log('[AppInitializer] Already initialized, skipping...');
            return;
        }

        async function initialize() {
            hasInitializedRef.current = true;

            try {
                console.log('[AppInitializer] Starting initialization (once)...');

                // Step 1: Initialize auth state
                await initializeAuth();

                // Step 2: Load initial data if authenticated
                const auth = useAuthStore.getState();
                if (auth.isAuthenticated) {
                    console.log('[AppInitializer] User authenticated, loading data...');
                    await loadTopics();
                }

                console.log('[AppInitializer] Initialization complete');
            } catch (error) {
                console.error('[AppInitializer] Initialization error:', error);
                // Still set ready to allow app to function
            } finally {
                setIsReady(true);
            }
        }

        initialize();

        // ✅ FIX: Intentionally empty dependency array
        // We want this to run ONLY ONCE on mount
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Show loading while initializing
    if (!isReady || !isInitialized) {
        return loadingComponent ? <>{loadingComponent}</> : <DefaultLoadingComponent />;
    }

    return <>{children}</>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#0F0A1F',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#A78BFA',
        fontWeight: '500',
    },
});
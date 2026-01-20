/**
 * @file AppInitializer.tsx
 * @description App Initializer - Handles auth and data initialization
 * 
 * Usage:
 * Wrap your app root with this component to ensure auth is initialized
 * before rendering protected content.
 */

import React, { useEffect, useState, ReactNode } from 'react';
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
 */
export function AppInitializer({
  children,
  loadingComponent,
}: AppInitializerProps) {
  const [isReady, setIsReady] = useState(false);
  
  // Auth store
  const { initialize: initializeAuth, isInitialized, isAuthenticated } = useAuthStore();
  
  // Topics store
  const { loadTopics } = useStore();

  useEffect(() => {
    async function initialize() {
      try {
        console.log('[AppInitializer] Starting initialization...');

        // Step 1: Initialize auth state
        await initializeAuth();

        // Step 2: Load initial data if authenticated
        const auth = useAuthStore.getState();
        if (auth.isAuthenticated) {
          console.log('[AppInitializer] User authenticated, loading data...');
          await loadTopics();
        }

        console.log('[AppInitializer] Initialization complete');
        setIsReady(true);
      } catch (error) {
        console.error('[AppInitializer] Initialization error:', error);
        // Still set ready to allow app to function
        setIsReady(true);
      }
    }

    initialize();
  }, [initializeAuth, loadTopics]);

  // Show loading while initializing
  if (!isReady || !isInitialized) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <DefaultLoadingComponent />
    );
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

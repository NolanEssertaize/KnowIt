/**
 * Root Layout - KnowIt App
 * Configuration de la navigation avec écran de bienvenue
 */

import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { useStore } from '../store/useStore';
import { GlassColors } from '@/constants/theme';
import WelcomeScreen from '@/components/WelcomeScreen';

export default function Layout() {
    const [showWelcome, setShowWelcome] = useState(true);
    const loadTopics = useStore((state) => state.loadTopics);

    useEffect(() => {
        loadTopics();
    }, []);

    // Configuration commune des headers
    const screenOptions = {
        headerStyle: {
            backgroundColor: GlassColors.gradient.start,
        },
        headerTintColor: GlassColors.text.primary,
        headerTitleStyle: {
            fontWeight: '600' as const,
            fontSize: 18,
        },
        headerShadowVisible: false,
        contentStyle: {
            backgroundColor: 'transparent',
        },
        animation: 'slide_from_right' as const,
    };

    const modalOptions = {
        ...screenOptions,
        presentation: 'modal' as const,
        animation: 'slide_from_bottom' as const,
        headerShown: false,
    };

    // Afficher l'écran de bienvenue
    if (showWelcome) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <WelcomeScreen onFinish={() => setShowWelcome(false)} />
            </View>
        );
    }

    return (
        <>
            <StatusBar style="light" />
            <Stack screenOptions={screenOptions}>
                <Stack.Screen
                    name="index"
                    options={{
                        headerShown: false,
                    }}
                />
                <Stack.Screen
                    name="[topicId]/index"
                    options={{
                        title: 'Historique',
                    }}
                />
                <Stack.Screen
                    name="[topicId]/session"
                    options={{
                        ...modalOptions,
                        title: 'Session en cours',
                    }}
                />
                <Stack.Screen
                    name="[topicId]/result"
                    options={{
                        ...modalOptions,
                        title: 'Analyse',
                    }}
                />
            </Stack>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});

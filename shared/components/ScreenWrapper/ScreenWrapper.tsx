/**
 * @file ScreenWrapper.tsx
 * @description Wrapper global avec LinearGradient de fond - Theme Aware
 *
 * UPDATED: Now uses useTheme() for dynamic theme colors
 */

import React, { memo, type ReactNode } from 'react';
import {
    View,
    StatusBar,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    type ViewStyle,
    type StyleProp,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme';
import { styles } from './ScreenWrapper.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface ScreenWrapperProps {
    children: ReactNode;
    useSafeArea?: boolean;
    padding?: number;
    style?: StyleProp<ViewStyle>;
    scrollable?: boolean;
    keyboardAvoiding?: boolean;
    gradientColors?: readonly [string, string, ...string[]];
    /** Override status bar style (defaults to theme-aware) */
    statusBarStyle?: 'light-content' | 'dark-content';
    centered?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const ScreenWrapper = memo(function ScreenWrapper({
                                                             children,
                                                             useSafeArea = true,
                                                             padding = 20,
                                                             style,
                                                             scrollable = false,
                                                             keyboardAvoiding = true,
                                                             gradientColors,
                                                             statusBarStyle,
                                                             centered = false,
                                                         }: ScreenWrapperProps) {
    const insets = useSafeAreaInsets();

    // Get theme colors dynamically
    const { colors, isDark } = useTheme();

    // Theme-aware gradient
    const defaultGradient: readonly [string, string, string] = [
        colors.gradient.start,
        colors.gradient.middle,
        colors.gradient.end,
    ];

    const safeAreaStyle: ViewStyle = useSafeArea
        ? {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            paddingLeft: insets.left,
            paddingRight: insets.right,
        }
        : {};

    const contentStyle: ViewStyle = {
        flex: 1,
        padding,
        ...(centered && {
            justifyContent: 'center',
            alignItems: 'center',
        }),
    };

    const renderContent = () => {
        if (scrollable) {
            return (
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={[
                        styles.scrollContent,
                        { padding },
                        centered && styles.centeredContent,
                        style,
                    ]}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    {children}
                </ScrollView>
            );
        }

        return <View style={[contentStyle, style]}>{children}</View>;
    };

    // Determine status bar style (theme-aware by default)
    const resolvedStatusBarStyle = statusBarStyle ?? (isDark ? 'light-content' : 'dark-content');

    const content = (
        <LinearGradient
            colors={gradientColors ?? defaultGradient}
            style={styles.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <StatusBar
                barStyle={resolvedStatusBarStyle}
                backgroundColor="transparent"
                translucent
            />
            <View style={[styles.container, safeAreaStyle]}>{renderContent()}</View>
        </LinearGradient>
    );

    if (keyboardAvoiding && Platform.OS !== 'web') {
        return (
            <KeyboardAvoidingView
                style={styles.flex}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={0}
            >
                {content}
            </KeyboardAvoidingView>
        );
    }

    return content;
});

// ═══════════════════════════════════════════════════════════════════════════
// VARIANTES SPÉCIALISÉES
// ═══════════════════════════════════════════════════════════════════════════

export const CenteredScreen = memo(function CenteredScreen({
                                                               children,
                                                               ...props
                                                           }: Omit<ScreenWrapperProps, 'centered'>) {
    return (
        <ScreenWrapper centered {...props}>
            {children}
        </ScreenWrapper>
    );
});

export const ScrollableScreen = memo(function ScrollableScreen({
                                                                   children,
                                                                   ...props
                                                               }: Omit<ScreenWrapperProps, 'scrollable'>) {
    return (
        <ScreenWrapper scrollable {...props}>
            {children}
        </ScreenWrapper>
    );
});

export const ModalScreen = memo(function ModalScreen({
                                                         children,
                                                         style,
                                                         ...props
                                                     }: Omit<ScreenWrapperProps, 'useSafeArea'>) {
    const insets = useSafeAreaInsets();

    return (
        <ScreenWrapper
            useSafeArea={false}
            style={[{ paddingBottom: insets.bottom }, style]}
            {...props}
        >
            {children}
        </ScreenWrapper>
    );
});
/**
 * @file WelcomeScreen.tsx
 * @description Welcome/Onboarding Screen - Theme Aware, Internationalized
 *
 * UPDATED: All hardcoded strings replaced with i18n translations
 */

import React, { memo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    StatusBar,
    Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';

import { useTheme, Spacing, BorderRadius } from '@/theme';
import { GlassView } from '@/shared/components';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ═══════════════════════════════════════════════════════════════════════════
// FEATURE CARD COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface FeatureCardProps {
    icon: keyof typeof MaterialCommunityIcons.glyphMap;
    text: string;
}

const FeatureCard = memo(function FeatureCard({ icon, text }: FeatureCardProps) {
    const { colors } = useTheme();

    return (
        <GlassView style={styles.featureCard} showBorder>
            <View style={[styles.featureIconContainer, { backgroundColor: colors.surface.glass }]}>
                <MaterialCommunityIcons name={icon} size={24} color={colors.text.primary} />
            </View>
            <Text style={[styles.featureText, { color: colors.text.secondary }]}>
                {text}
            </Text>
        </GlassView>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function WelcomeScreenComponent() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleGetStarted = () => {
        router.push('/register');
    };

    const handleLogin = () => {
        router.push('/login');
    };

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <View style={styles.container}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
            <LinearGradient
                colors={[
                    colors.gradient.start,
                    colors.gradient.middle,
                    colors.gradient.end,
                ]}
                style={styles.gradient}
            >
                <View style={[styles.content, { paddingTop: insets.top + Spacing.xl }]}>
                    {/* Logo */}
                    <View style={styles.logoContainer}>
                        <View
                            style={[
                                styles.logoOuter,
                                { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)' },
                            ]}
                        >
                            <View
                                style={[
                                    styles.logoMiddle,
                                    { backgroundColor: isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.08)' },
                                ]}
                            >
                                <View style={[styles.logoInner, { backgroundColor: colors.text.primary }]}>
                                    <Text style={[styles.logoText, { color: colors.text.inverse }]}>K</Text>
                                </View>
                            </View>
                        </View>
                    </View>

                    {/* Title & Subtitle */}
                    <View style={styles.textContainer}>
                        <Text style={[styles.title, { color: colors.text.primary }]}>
                            {t('welcome.title')}
                        </Text>
                        <Text style={[styles.subtitle, { color: colors.text.secondary }]}>
                            {t('welcome.subtitle')}
                        </Text>
                        <Text style={[styles.tagline, { color: colors.text.muted }]}>
                            {t('welcome.tagline')}
                        </Text>
                    </View>

                    {/* Features */}
                    <View style={styles.featuresContainer}>
                        <FeatureCard
                            icon="microphone"
                            text={t('welcome.features.record')}
                        />
                        <FeatureCard
                            icon="brain"
                            text={t('welcome.features.analyze')}
                        />
                        <FeatureCard
                            icon="trending-up"
                            text={t('welcome.features.improve')}
                        />
                    </View>

                    {/* Spacer */}
                    <View style={styles.spacer} />

                    {/* Buttons */}
                    <View style={[styles.buttonsContainer, { paddingBottom: insets.bottom + Spacing.lg }]}>
                        {/* Get Started Button */}
                        <TouchableOpacity
                            style={[styles.primaryButton, { backgroundColor: colors.text.primary }]}
                            onPress={handleGetStarted}
                            activeOpacity={0.8}
                        >
                            <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>
                                {t('welcome.getStarted')}
                            </Text>
                            <MaterialCommunityIcons
                                name="arrow-right"
                                size={20}
                                color={colors.text.inverse}
                            />
                        </TouchableOpacity>

                        {/* Login Link */}
                        <View style={styles.loginContainer}>
                            <Text style={[styles.loginText, { color: colors.text.secondary }]}>
                                {t('auth.register.hasAccount')}
                            </Text>
                            <TouchableOpacity onPress={handleLogin} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                                <Text style={[styles.loginLink, { color: colors.text.primary }]}>
                                    {t('auth.register.signIn')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
}

export const WelcomeScreen = memo(WelcomeScreenComponent);

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
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    logoOuter: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoMiddle: {
        width: 112,
        height: 112,
        borderRadius: 56,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoInner: {
        width: 84,
        height: 84,
        borderRadius: 42,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoText: {
        fontSize: 42,
        fontWeight: '700',
    },
    textContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxl,
    },
    title: {
        fontSize: 40,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    subtitle: {
        fontSize: 20,
        fontWeight: '500',
        marginBottom: Spacing.xs,
    },
    tagline: {
        fontSize: 14,
    },
    featuresContainer: {
        gap: Spacing.sm,
    },
    featureCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.md,
    },
    featureIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    featureText: {
        fontSize: 16,
        fontWeight: '500',
        flex: 1,
    },
    spacer: {
        flex: 1,
    },
    buttonsContainer: {
        gap: Spacing.md,
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.xl,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
    },
    primaryButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    loginText: {
        fontSize: 14,
    },
    loginLink: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default WelcomeScreen;
/**
 * @file LoginScreen.tsx
 * @description Login screen - Theme Aware, Internationalized
 *
 * FIXED VERSION - Proper i18n integration with all strings translated
 */

import React, { memo, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    StyleSheet,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock } from 'lucide-react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { GlassInput } from '@/features/auth/components/GlassInput';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LoginScreen = memo(function LoginScreen() {
    const router = useRouter();
    const passwordInputRef = useRef<TextInput>(null);
    const { colors } = useTheme();
    const { t } = useTranslation();

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

    const onLoginPress = async () => {
        clearError();
        const result = await handleLogin();
        if (result.success) {
            router.replace('/');
        } else if (result.error) {
            Alert.alert(t('auth.login.loginFailed'), result.error);
        }
    };

    const onRegisterPress = () => {
        router.push('/register');
    };

    const onEmailSubmit = () => {
        passwordInputRef.current?.focus();
    };

    return (
        <AuthLayout
            title={t('auth.login.title')}
            subtitle={t('auth.login.subtitle')}
            footer={
                <View style={styles.footerContent}>
                    <Text style={[styles.footerText, { color: colors.text.secondary }]}>
                        {t('auth.login.noAccount')}
                    </Text>
                    <TouchableOpacity onPress={onRegisterPress}>
                        <Text style={[styles.footerLink, { color: colors.text.primary }]}>
                            {t('auth.login.signUp')}
                        </Text>
                    </TouchableOpacity>
                </View>
            }
        >
            {/* Email Input */}
            <GlassInput
                icon={<Mail size={20} color={colors.text.secondary} />}
                placeholder={t('auth.login.emailPlaceholder')}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                returnKeyType="next"
                onSubmitEditing={onEmailSubmit}
                error={validationErrors.email}
            />

            {/* Password Input */}
            <GlassInput
                ref={passwordInputRef}
                icon={<Lock size={20} color={colors.text.secondary} />}
                placeholder={t('auth.login.passwordPlaceholder')}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={onLoginPress}
                error={validationErrors.password}
            />

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={[styles.forgotPasswordText, { color: colors.text.secondary }]}>
                    {t('auth.login.forgotPassword')}
                </Text>
            </TouchableOpacity>

            {/* Error Message */}
            {error && (
                <View style={[styles.errorContainer, { backgroundColor: colors.status.error + '20' }]}>
                    <Text style={[styles.errorText, { color: colors.status.error }]}>
                        {error}
                    </Text>
                </View>
            )}

            {/* Login Button */}
            <TouchableOpacity
                style={styles.buttonContainer}
                onPress={onLoginPress}
                disabled={isLoading}
                activeOpacity={0.8}
            >
                <View
                    style={[
                        styles.loginButton,
                        { backgroundColor: isLoading ? colors.surface.glass : colors.text.primary },
                    ]}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color={colors.text.primary} />
                    ) : (
                        <Text style={[styles.loginButtonText, { color: colors.text.inverse }]}>
                            {t('auth.login.signIn')}
                        </Text>
                    )}
                </View>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerContainer}>
                <View style={[styles.divider, { backgroundColor: colors.glass.border }]} />
                <Text style={[styles.dividerText, { color: colors.text.muted }]}>
                    {t('auth.login.orContinueWith')}
                </Text>
                <View style={[styles.divider, { backgroundColor: colors.glass.border }]} />
            </View>

            {/* Social Login Buttons */}
            <View style={styles.socialContainer}>
                <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: colors.surface.glass }]}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="google" size={24} color={colors.text.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.socialButton, { backgroundColor: colors.surface.glass }]}
                    activeOpacity={0.7}
                >
                    <MaterialCommunityIcons name="apple" size={24} color={colors.text.primary} />
                </TouchableOpacity>
            </View>
        </AuthLayout>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    footerText: {
        fontSize: 14,
    },
    footerLink: {
        fontSize: 14,
        fontWeight: '600',
    },
    forgotPasswordContainer: {
        alignSelf: 'flex-end',
        marginBottom: Spacing.md,
    },
    forgotPasswordText: {
        fontSize: 14,
    },
    errorContainer: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.md,
    },
    errorText: {
        fontSize: 14,
        textAlign: 'center',
    },
    buttonContainer: {
        marginTop: Spacing.sm,
    },
    loginButton: {
        height: 56,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    loginButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: Spacing.md,
        fontSize: 12,
    },
    socialContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: Spacing.md,
    },
    socialButton: {
        width: 56,
        height: 56,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default LoginScreen;
/**
 * @file PasswordChangeModal.tsx
 * @description Password Change Modal - Theme Aware, Internationalized
 */

import React, { memo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { GlassView } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface PasswordChangeModalProps {
    visible: boolean;
    onClose: () => void;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
    onCurrentPasswordChange: (value: string) => void;
    onNewPasswordChange: (value: string) => void;
    onConfirmPasswordChange: (value: string) => void;
    onSubmit: () => Promise<void>;
    errors: {
        currentPassword?: string;
        newPassword?: string;
        confirmPassword?: string;
    };
    isLoading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const PasswordChangeModal = memo(function PasswordChangeModal({
                                                                         visible,
                                                                         onClose,
                                                                         currentPassword,
                                                                         newPassword,
                                                                         confirmPassword,
                                                                         onCurrentPasswordChange,
                                                                         onNewPasswordChange,
                                                                         onConfirmPasswordChange,
                                                                         onSubmit,
                                                                         errors,
                                                                         isLoading,
                                                                     }: PasswordChangeModalProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={onClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={styles.overlay} onPress={onClose}>
                    <Pressable
                        style={[styles.content, { backgroundColor: colors.background.primary }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={[styles.title, { color: colors.text.primary }]}>
                                {t('passwordChange.title')}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <MaterialIcons name="close" size={24} color={colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Current Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text.secondary }]}>
                                {t('passwordChange.currentPassword')}
                            </Text>
                            <GlassView style={styles.inputContainer} showBorder>
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder={t('passwordChange.currentPasswordPlaceholder')}
                                    placeholderTextColor={colors.text.muted}
                                    value={currentPassword}
                                    onChangeText={onCurrentPasswordChange}
                                    secureTextEntry
                                    autoComplete="password"
                                />
                            </GlassView>
                            {errors.currentPassword && (
                                <Text style={styles.errorText}>{errors.currentPassword}</Text>
                            )}
                        </View>

                        {/* New Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text.secondary }]}>
                                {t('passwordChange.newPassword')}
                            </Text>
                            <GlassView style={styles.inputContainer} showBorder>
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder={t('passwordChange.newPasswordPlaceholder')}
                                    placeholderTextColor={colors.text.muted}
                                    value={newPassword}
                                    onChangeText={onNewPasswordChange}
                                    secureTextEntry
                                    autoComplete="password-new"
                                />
                            </GlassView>
                            {errors.newPassword && (
                                <Text style={styles.errorText}>{errors.newPassword}</Text>
                            )}
                        </View>

                        {/* Confirm Password */}
                        <View style={styles.inputGroup}>
                            <Text style={[styles.label, { color: colors.text.secondary }]}>
                                {t('passwordChange.confirmPassword')}
                            </Text>
                            <GlassView style={styles.inputContainer} showBorder>
                                <TextInput
                                    style={[styles.input, { color: colors.text.primary }]}
                                    placeholder={t('passwordChange.confirmPasswordPlaceholder')}
                                    placeholderTextColor={colors.text.muted}
                                    value={confirmPassword}
                                    onChangeText={onConfirmPasswordChange}
                                    secureTextEntry
                                    autoComplete="password-new"
                                />
                            </GlassView>
                            {errors.confirmPassword && (
                                <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                            )}
                        </View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: colors.text.primary },
                                isLoading && styles.submitButtonDisabled,
                            ]}
                            onPress={onSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.text.inverse} />
                            ) : (
                                <Text style={[styles.submitButtonText, { color: colors.text.inverse }]}>
                                    {t('passwordChange.submit')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </Pressable>
                </Pressable>
            </KeyboardAvoidingView>
        </Modal>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    content: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: 14,
        fontWeight: '500',
        marginBottom: Spacing.xs,
    },
    inputContainer: {
        borderRadius: BorderRadius.md,
    },
    input: {
        fontSize: 16,
        padding: Spacing.md,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 12,
        marginTop: Spacing.xs,
    },
    submitButton: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: Spacing.md,
    },
    submitButtonDisabled: {
        opacity: 0.7,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default PasswordChangeModal;
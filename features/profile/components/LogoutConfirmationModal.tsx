/**
 * @file LogoutConfirmationModal.tsx
 * @description Logout Confirmation Modal - Theme Aware, Internationalized
 */

import React, { memo } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
    Pressable,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface LogoutConfirmationModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isLoading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const LogoutConfirmationModal = memo(function LogoutConfirmationModal({
                                                                                 visible,
                                                                                 onClose,
                                                                                 onConfirm,
                                                                                 isLoading,
                                                                             }: LogoutConfirmationModalProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable
                    style={[styles.content, { backgroundColor: colors.background.primary }]}
                    onPress={(e) => e.stopPropagation()}
                >
                    {/* Icon */}
                    <View style={styles.iconContainer}>
                        <View style={[styles.icon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="logout" size={32} color={colors.text.primary} />
                        </View>
                    </View>

                    {/* Title & Message */}
                    <Text style={[styles.title, { color: colors.text.primary }]}>
                        {t('logoutModal.title')}
                    </Text>
                    <Text style={[styles.message, { color: colors.text.secondary }]}>
                        {t('logoutModal.message')}
                    </Text>

                    {/* Buttons */}
                    <View style={styles.buttons}>
                        <TouchableOpacity
                            style={[styles.cancelButton, { borderColor: colors.glass.border }]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>
                                {t('logoutModal.cancel')}
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.confirmButton,
                                { backgroundColor: colors.text.primary },
                                isLoading && styles.buttonDisabled,
                            ]}
                            onPress={onConfirm}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color={colors.text.inverse} />
                            ) : (
                                <Text style={[styles.confirmButtonText, { color: colors.text.inverse }]}>
                                    {t('logoutModal.confirm')}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Pressable>
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
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },
    content: {
        width: '100%',
        maxWidth: 340,
        borderRadius: BorderRadius.xl,
        padding: Spacing.lg,
        alignItems: 'center',
    },
    iconContainer: {
        marginBottom: Spacing.md,
    },
    icon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        lineHeight: 20,
    },
    buttons: {
        flexDirection: 'row',
        gap: Spacing.sm,
        width: '100%',
    },
    cancelButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    confirmButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    confirmButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});

export default LogoutConfirmationModal;
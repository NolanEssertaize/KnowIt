/**
 * @file LogoutConfirmationModal.tsx
 * @description Modal de confirmation pour la déconnexion avec style iOS Glassmorphism
 *
 * FIXES:
 * - ADDED useTheme() hook for dynamic colors
 * - Improved glassmorphism visibility (more opaque background)
 * - Text is now readable in both light and dark modes
 */

import React, { memo } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    StyleSheet,
    Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

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
    const { colors, isDark } = useTheme();

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onClose}
        >
            <Pressable style={styles.overlay} onPress={onClose}>
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    {/* Card with improved glassmorphism - MORE OPAQUE */}
                    <View
                        style={[
                            styles.card,
                            {
                                // More opaque background for better readability
                                backgroundColor: isDark
                                    ? 'rgba(30, 30, 30, 0.95)'
                                    : 'rgba(255, 255, 255, 0.95)',
                                borderColor: isDark
                                    ? 'rgba(255, 255, 255, 0.15)'
                                    : 'rgba(0, 0, 0, 0.1)',
                                borderWidth: 1,
                                ...Platform.select({
                                    ios: {
                                        shadowColor: '#000',
                                        shadowOffset: { width: 0, height: 8 },
                                        shadowOpacity: 0.3,
                                        shadowRadius: 16,
                                    },
                                    android: {
                                        elevation: 16,
                                    },
                                }),
                            },
                        ]}
                    >
                        {/* Icon */}
                        <View
                            style={[
                                styles.iconContainer,
                                {
                                    backgroundColor: isDark
                                        ? 'rgba(255, 255, 255, 0.1)'
                                        : 'rgba(0, 0, 0, 0.05)'
                                }
                            ]}
                        >
                            <MaterialIcons
                                name="logout"
                                size={48}
                                color={colors.text.primary}
                            />
                        </View>

                        {/* Title */}
                        <Text style={[styles.title, { color: colors.text.primary }]}>
                            Se déconnecter ?
                        </Text>

                        {/* Description */}
                        <Text style={[styles.description, { color: colors.text.secondary }]}>
                            Vous êtes sur le point de vous déconnecter de votre compte.
                            Vous pourrez vous reconnecter à tout moment.
                        </Text>

                        {/* Buttons */}
                        <View style={styles.buttonsContainer}>
                            <GlassButton
                                title="Annuler"
                                variant="glass"
                                onPress={onClose}
                                disabled={isLoading}
                                style={styles.cancelButton}
                            />

                            <GlassButton
                                title={isLoading ? "Déconnexion..." : "Se déconnecter"}
                                variant="primary"
                                onPress={onConfirm}
                                disabled={isLoading}
                                loading={isLoading}
                                style={styles.confirmButton}
                            />
                        </View>
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
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },

    content: {
        width: '100%',
        maxWidth: 340,
    },

    card: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },

    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    title: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },

    description: {
        fontSize: FontSize.md,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: Spacing.xl,
    },

    buttonsContainer: {
        flexDirection: 'row',
        gap: Spacing.md,
        width: '100%',
    },

    cancelButton: {
        flex: 1,
    },

    confirmButton: {
        flex: 1,
    },
});

export default LogoutConfirmationModal;
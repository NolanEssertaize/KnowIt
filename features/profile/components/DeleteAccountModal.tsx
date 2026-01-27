/**
 * @file DeleteAccountModal.tsx
 * @description Modal de suppression de compte avec vérification en deux étapes
 *
 * FIXES:
 * - ADDED useTheme() hook for dynamic colors
 * - Improved glassmorphism visibility (more opaque background)
 * - Text is now readable in both light and dark modes
 */

import React, { memo, useState, useCallback } from 'react';
import {
    Modal,
    View,
    Text,
    Pressable,
    TextInput,
    StyleSheet,
    Platform,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius, FontSize, FontWeight } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface DeleteAccountModalProps {
    visible: boolean;
    onClose: () => void;
    onConfirm: (password: string) => Promise<void>;
    isLoading: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const DeleteAccountModal = memo(function DeleteAccountModal({
                                                                       visible,
                                                                       onClose,
                                                                       onConfirm,
                                                                       isLoading,
                                                                   }: DeleteAccountModalProps) {
    const { colors, isDark } = useTheme();
    const [step, setStep] = useState<1 | 2>(1);
    const [confirmText, setConfirmText] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isTextConfirmEnabled = confirmText.toUpperCase() === 'SUPPRIMER';
    const isPasswordValid = password.length >= 6;

    const handleClose = useCallback(() => {
        setStep(1);
        setConfirmText('');
        setPassword('');
        setError(null);
        onClose();
    }, [onClose]);

    const handleNextStep = useCallback(() => {
        if (isTextConfirmEnabled) {
            setStep(2);
        }
    }, [isTextConfirmEnabled]);

    const handleBack = useCallback(() => {
        setStep(1);
        setPassword('');
        setError(null);
    }, []);

    const handleConfirm = useCallback(async () => {
        if (!isPasswordValid) return;

        try {
            setError(null);
            await onConfirm(password);
            handleClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    }, [password, isPasswordValid, onConfirm, handleClose]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER STEP 1: Text Confirmation
    // ─────────────────────────────────────────────────────────────────────────

    const renderStep1 = () => (
        <>
            {/* Warning Icon */}
            <View style={[styles.iconContainer, { backgroundColor: 'rgba(239, 68, 68, 0.15)' }]}>
                <MaterialIcons
                    name="warning"
                    size={48}
                    color="#EF4444"
                />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text.primary }]}>
                Supprimer votre compte ?
            </Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.text.secondary }]}>
                Cette action est irréversible.{'\n'}
                Toutes vos données seront définitivement supprimées.
            </Text>

            {/* Confirmation Input */}
            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                    Tapez <Text style={styles.confirmationWord}>SUPPRIMER</Text> pour confirmer
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            borderColor: colors.glass.border,
                            borderWidth: 1,
                        }
                    ]}
                >
                    <TextInput
                        style={[styles.input, { color: colors.text.primary }]}
                        value={confirmText}
                        onChangeText={setConfirmText}
                        placeholder="SUPPRIMER"
                        placeholderTextColor={colors.text.muted}
                        autoCapitalize="characters"
                        autoCorrect={false}
                    />
                </View>
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <GlassButton
                    title="Annuler"
                    variant="glass"
                    onPress={handleClose}
                    disabled={isLoading}
                    style={styles.cancelButton}
                />

                <GlassButton
                    title="Continuer"
                    variant="primary"
                    onPress={handleNextStep}
                    disabled={!isTextConfirmEnabled || isLoading}
                    style={[styles.confirmButton, !isTextConfirmEnabled && styles.buttonDisabled]}
                />
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER STEP 2: Password Verification
    // ─────────────────────────────────────────────────────────────────────────

    const renderStep2 = () => (
        <>
            {/* Lock Icon */}
            <View style={[styles.iconContainerDanger, { backgroundColor: 'rgba(239, 68, 68, 0.2)' }]}>
                <MaterialIcons
                    name="lock"
                    size={48}
                    color="#EF4444"
                />
            </View>

            {/* Title */}
            <Text style={[styles.title, { color: colors.text.primary }]}>
                Vérification de sécurité
            </Text>

            {/* Description */}
            <Text style={[styles.description, { color: colors.text.secondary }]}>
                Pour des raisons de sécurité, veuillez entrer votre mot de passe pour confirmer la suppression.
            </Text>

            {/* Password Input */}
            <View style={styles.inputSection}>
                <Text style={[styles.inputLabel, { color: colors.text.secondary }]}>
                    Mot de passe
                </Text>
                <View
                    style={[
                        styles.inputContainer,
                        {
                            backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                            borderColor: colors.glass.border,
                            borderWidth: 1,
                        }
                    ]}
                >
                    <TextInput
                        style={[styles.input, styles.passwordInput, { color: colors.text.primary }]}
                        value={password}
                        onChangeText={setPassword}
                        placeholder="Votre mot de passe"
                        placeholderTextColor={colors.text.muted}
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                    />
                    <Pressable
                        style={styles.eyeButton}
                        onPress={() => setShowPassword(!showPassword)}
                    >
                        <MaterialIcons
                            name={showPassword ? "visibility-off" : "visibility"}
                            size={24}
                            color={colors.text.secondary}
                        />
                    </Pressable>
                </View>

                {error && (
                    <Text style={styles.errorText}>{error}</Text>
                )}
            </View>

            {/* Buttons */}
            <View style={styles.buttonsContainer}>
                <GlassButton
                    title="Retour"
                    variant="glass"
                    onPress={handleBack}
                    disabled={isLoading}
                    style={styles.cancelButton}
                />

                <GlassButton
                    title={isLoading ? "Suppression..." : "Supprimer"}
                    variant="primary"
                    onPress={handleConfirm}
                    disabled={!isPasswordValid || isLoading}
                    loading={isLoading}
                    style={[styles.deleteButton, !isPasswordValid && styles.buttonDisabled]}
                />
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={handleClose}
        >
            <Pressable style={styles.overlay} onPress={handleClose}>
                <Pressable style={styles.content} onPress={(e) => e.stopPropagation()}>
                    {/* Card with improved glassmorphism - MORE OPAQUE */}
                    <View
                        style={[
                            styles.card,
                            {
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
                        {/* Step Indicator */}
                        <View style={styles.stepIndicator}>
                            <View style={[styles.stepDot, step >= 1 && styles.stepDotActive]} />
                            <View style={[styles.stepLine, { backgroundColor: colors.glass.border }]} />
                            <View style={[styles.stepDot, step >= 2 && styles.stepDotActive]} />
                        </View>

                        {step === 1 ? renderStep1() : renderStep2()}
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
        backgroundColor: 'rgba(0, 0, 0, 0.9)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.lg,
    },

    content: {
        width: '100%',
        maxWidth: 360,
    },

    card: {
        padding: Spacing.xl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
    },

    // Step Indicator
    stepIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },

    stepDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: 'rgba(128, 128, 128, 0.3)',
        borderWidth: 1,
        borderColor: 'rgba(128, 128, 128, 0.5)',
    },

    stepDotActive: {
        backgroundColor: '#EF4444',
        borderColor: '#EF4444',
    },

    stepLine: {
        width: 40,
        height: 2,
        marginHorizontal: Spacing.xs,
    },

    // Icon
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    iconContainerDanger: {
        width: 80,
        height: 80,
        borderRadius: BorderRadius.full,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },

    // Text
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
        marginBottom: Spacing.lg,
    },

    // Input
    inputSection: {
        width: '100%',
        marginBottom: Spacing.lg,
    },

    inputLabel: {
        fontSize: FontSize.sm,
        marginBottom: Spacing.sm,
        textAlign: 'center',
    },

    confirmationWord: {
        fontWeight: FontWeight.bold,
        color: '#EF4444',
    },

    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
    },

    input: {
        flex: 1,
        fontSize: FontSize.md,
        paddingVertical: Spacing.md,
        textAlign: 'center',
    },

    passwordInput: {
        textAlign: 'left',
    },

    eyeButton: {
        padding: Spacing.xs,
    },

    errorText: {
        fontSize: FontSize.sm,
        color: '#EF4444',
        textAlign: 'center',
        marginTop: Spacing.sm,
    },

    // Buttons
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

    deleteButton: {
        flex: 1,
    },

    buttonDisabled: {
        opacity: 0.5,
    },
});

export default DeleteAccountModal;
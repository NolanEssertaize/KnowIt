/**
 * @file DeleteAccountModal.tsx
 * @description Delete Account Modal - Theme Aware, Internationalized
 */

import React, { memo, useState } from 'react';
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
    const { colors } = useTheme();
    const { t } = useTranslation();
    const [step, setStep] = useState(1);
    const [password, setPassword] = useState('');

    const handleClose = () => {
        setStep(1);
        setPassword('');
        onClose();
    };

    const handleContinue = () => {
        setStep(2);
    };

    const handleConfirm = async () => {
        await onConfirm(password);
    };

    const renderStep1 = () => (
        <>
            {/* Warning Icon */}
            <View style={styles.iconContainer}>
                <View style={[styles.warningIcon, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
                    <MaterialIcons name="warning" size={48} color="#EF4444" />
                </View>
            </View>

            {/* Title & Message */}
            <Text style={[styles.title, { color: colors.text.primary }]}>
                {t('deleteAccount.step1Title')}
            </Text>
            <Text style={[styles.message, { color: colors.text.secondary }]}>
                {t('deleteAccount.step1Message')}
            </Text>

            {/* Consequences */}
            <GlassView style={styles.consequencesCard} showBorder>
                <Text style={[styles.consequencesTitle, { color: '#EF4444' }]}>
                    {t('deleteAccount.consequences')}
                </Text>
                <View style={styles.consequenceItem}>
                    <MaterialIcons name="remove-circle" size={16} color="#EF4444" />
                    <Text style={[styles.consequenceText, { color: colors.text.secondary }]}>
                        {t('deleteAccount.consequencesList.topics')}
                    </Text>
                </View>
                <View style={styles.consequenceItem}>
                    <MaterialIcons name="remove-circle" size={16} color="#EF4444" />
                    <Text style={[styles.consequenceText, { color: colors.text.secondary }]}>
                        {t('deleteAccount.consequencesList.sessions')}
                    </Text>
                </View>
                <View style={styles.consequenceItem}>
                    <MaterialIcons name="remove-circle" size={16} color="#EF4444" />
                    <Text style={[styles.consequenceText, { color: colors.text.secondary }]}>
                        {t('deleteAccount.consequencesList.data')}
                    </Text>
                </View>
            </GlassView>

            {/* Buttons */}
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.glass.border }]}
                    onPress={handleClose}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>
                        {t('deleteAccount.cancel')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.dangerButton, { backgroundColor: '#EF4444' }]}
                    onPress={handleContinue}
                >
                    <Text style={styles.dangerButtonText}>
                        {t('deleteAccount.continue')}
                    </Text>
                </TouchableOpacity>
            </View>
        </>
    );

    const renderStep2 = () => (
        <>
            {/* Title */}
            <Text style={[styles.title, { color: colors.text.primary }]}>
                {t('deleteAccount.step2Title')}
            </Text>
            <Text style={[styles.message, { color: colors.text.secondary }]}>
                {t('deleteAccount.step2Message')}
            </Text>

            {/* Password Input */}
            <View style={styles.inputGroup}>
                <Text style={[styles.label, { color: colors.text.secondary }]}>
                    {t('deleteAccount.confirmation')}
                </Text>
                <GlassView style={styles.inputContainer} showBorder>
                    <TextInput
                        style={[styles.input, { color: colors.text.primary }]}
                        placeholder={t('deleteAccount.passwordPlaceholder')}
                        placeholderTextColor={colors.text.muted}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                        autoComplete="password"
                    />
                </GlassView>
            </View>

            {/* Buttons */}
            <View style={styles.buttons}>
                <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.glass.border }]}
                    onPress={handleClose}
                    disabled={isLoading}
                >
                    <Text style={[styles.cancelButtonText, { color: colors.text.primary }]}>
                        {t('deleteAccount.cancel')}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.dangerButton,
                        { backgroundColor: '#EF4444' },
                        (!password || isLoading) && styles.buttonDisabled,
                    ]}
                    onPress={handleConfirm}
                    disabled={!password || isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.dangerButtonText}>
                            {t('deleteAccount.confirm')}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>
        </>
    );

    return (
        <Modal
            visible={visible}
            transparent
            animationType="slide"
            onRequestClose={handleClose}
        >
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <Pressable style={styles.overlay} onPress={handleClose}>
                    <Pressable
                        style={[styles.content, { backgroundColor: colors.background.primary }]}
                        onPress={(e) => e.stopPropagation()}
                    >
                        {/* Close Button */}
                        <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                            <MaterialIcons name="close" size={24} color={colors.text.secondary} />
                        </TouchableOpacity>

                        {step === 1 ? renderStep1() : renderStep2()}
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
    closeButton: {
        position: 'absolute',
        top: Spacing.md,
        right: Spacing.md,
        zIndex: 1,
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
        marginTop: Spacing.md,
    },
    warningIcon: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        textAlign: 'center',
        marginBottom: Spacing.sm,
    },
    message: {
        fontSize: 14,
        textAlign: 'center',
        marginBottom: Spacing.lg,
        lineHeight: 20,
    },
    consequencesCard: {
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
    },
    consequencesTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    consequenceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        marginBottom: Spacing.xs,
    },
    consequenceText: {
        fontSize: 14,
        flex: 1,
    },
    inputGroup: {
        marginBottom: Spacing.lg,
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
    buttons: {
        flexDirection: 'row',
        gap: Spacing.sm,
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
    dangerButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dangerButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    buttonDisabled: {
        opacity: 0.5,
    },
});

export default DeleteAccountModal;
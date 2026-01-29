/**
 * @file AddTopicModal.tsx
 * @description Add Topic Modal - Theme Aware, Internationalized
 */

import React, { memo, useRef, useEffect } from 'react';
import {
    View,
    Text,
    Modal,
    TouchableOpacity,
    TextInput,
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

interface AddTopicModalProps {
    visible: boolean;
    value: string;
    onChangeText: (text: string) => void;
    onSubmit: () => void;
    onClose: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const AddTopicModal = memo(function AddTopicModal({
                                                             visible,
                                                             value,
                                                             onChangeText,
                                                             onSubmit,
                                                             onClose,
                                                         }: AddTopicModalProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();
    const inputRef = useRef<TextInput>(null);

    // Focus input when modal opens
    useEffect(() => {
        if (visible) {
            setTimeout(() => {
                inputRef.current?.focus();
            }, 100);
        }
    }, [visible]);

    const handleSubmit = () => {
        if (value.trim()) {
            onSubmit();
        }
    };

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
                                {t('topics.addTopic.title')}
                            </Text>
                            <TouchableOpacity onPress={onClose}>
                                <MaterialIcons name="close" size={24} color={colors.text.secondary} />
                            </TouchableOpacity>
                        </View>

                        {/* Input */}
                        <GlassView style={styles.inputContainer} showBorder>
                            <TextInput
                                ref={inputRef}
                                style={[styles.input, { color: colors.text.primary }]}
                                placeholder={t('topics.addTopic.placeholder')}
                                placeholderTextColor={colors.text.muted}
                                value={value}
                                onChangeText={onChangeText}
                                returnKeyType="done"
                                onSubmitEditing={handleSubmit}
                            />
                        </GlassView>

                        {/* Submit Button */}
                        <TouchableOpacity
                            style={[
                                styles.submitButton,
                                { backgroundColor: colors.text.primary },
                                !value.trim() && styles.submitButtonDisabled,
                            ]}
                            onPress={handleSubmit}
                            disabled={!value.trim()}
                        >
                            <MaterialIcons name="add" size={20} color={colors.text.inverse} />
                            <Text style={[styles.submitButtonText, { color: colors.text.inverse }]}>
                                {t('topics.addTopic.submit')}
                            </Text>
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
    inputContainer: {
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.md,
    },
    input: {
        fontSize: 16,
        padding: Spacing.md,
    },
    submitButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.xs,
    },
    submitButtonDisabled: {
        opacity: 0.5,
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default AddTopicModal;
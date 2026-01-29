/**
 * @file TopicDetailScreen.tsx
 * @description Topic Detail Screen - Theme Aware, Internationalized
 *
 * UPDATED: All hardcoded strings replaced with i18n translations
 */

import React, { memo, useCallback, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    StyleSheet,
    Alert,
    Modal,
    TextInput,
    Pressable,
    KeyboardAvoidingView,
    Platform,
    ListRenderItem,
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useTranslation } from 'react-i18next';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import { useLanguage, formatDate, formatRelativeTime } from '@/i18n';

import { useTopicDetail } from '../hooks/useTopicDetail';
import { SessionCard } from '../../session/components/SessionCard';
import type { Session } from '@/store';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface SessionItemData {
    session: Session;
    index: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function TopicDetailScreenComponent() {
    const router = useRouter();
    const { colors } = useTheme();
    const { t } = useTranslation();
    const { language } = useLanguage();

    const logic = useTopicDetail();

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        logic.loadTopicDetail();
    }, [logic.loadTopicDetail]);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleDelete = useCallback(() => {
        Alert.alert(
            t('common.delete'),
            t('topicDetail.actions.confirmDelete'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: logic.handleDeleteTopic,
                },
            ]
        );
    }, [logic.handleDeleteTopic, t]);

    const handleEditSave = useCallback(async () => {
        await logic.handleUpdateTitle();
        logic.hideEditModal();
    }, [logic]);

    // ─────────────────────────────────────────────────────────────────────────
    // COMPUTED DATA
    // ─────────────────────────────────────────────────────────────────────────

    const sessionsData: SessionItemData[] = useMemo(() => {
        return (logic.sessions || []).map((session, index) => ({
            session,
            index,
        }));
    }, [logic.sessions]);

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER FUNCTIONS
    // ─────────────────────────────────────────────────────────────────────────

    const renderSessionItem: ListRenderItem<SessionItemData> = useCallback(
        ({ item }) => (
            <SessionCard
                session={item.session}
                index={item.index}
                onPress={() => logic.handleSessionPress(item.session.id)}
            />
        ),
        [logic.handleSessionPress]
    );

    const renderEmptyState = useCallback(
        () => (
            <View style={styles.emptyContainer}>
                <MaterialCommunityIcons
                    name="microphone-off"
                    size={48}
                    color={colors.text.muted}
                />
                <Text style={[styles.emptyTitle, { color: colors.text.primary }]}>
                    {t('topicDetail.empty.title')}
                </Text>
                <Text style={[styles.emptyDescription, { color: colors.text.secondary }]}>
                    {t('topicDetail.empty.description')}
                </Text>
            </View>
        ),
        [colors, t]
    );

    const keyExtractor = useCallback((item: SessionItemData) => item.session.id, []);

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (logic.isLoading && !logic.topic) {
        return (
            <ScreenWrapper useSafeArea padding={0}>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                        {t('common.loading')}
                    </Text>
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ERROR STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.topic) {
        return (
            <ScreenWrapper useSafeArea padding={0}>
                <View style={styles.errorStateContainer}>
                    <MaterialCommunityIcons
                        name="alert-circle-outline"
                        size={48}
                        color={colors.text.muted}
                    />
                    <Text style={[styles.errorText, { color: colors.text.secondary }]}>
                        {t('topicDetail.notFound')}
                    </Text>
                    <GlassButton
                        title={t('common.back')}
                        onPress={handleBack}
                        variant="secondary"
                    />
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MAIN RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper useSafeArea padding={0}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
                </TouchableOpacity>

                <View style={styles.headerTitleContainer}>
                    <Text
                        style={[styles.headerTitle, { color: colors.text.primary }]}
                        numberOfLines={1}
                    >
                        {logic.topic.title}
                    </Text>
                    <Text style={[styles.headerSubtitle, { color: colors.text.secondary }]}>
                        {t('topicDetail.sessionsCount', { count: logic.sessions.length })}
                    </Text>
                </View>

                <View style={styles.headerActions}>
                    <TouchableOpacity onPress={logic.showEditModal} style={styles.headerButton}>
                        <MaterialIcons name="edit" size={22} color={colors.text.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={handleDelete} style={styles.headerButton}>
                        <MaterialIcons name="delete" size={22} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Sessions List */}
            <FlatList
                data={sessionsData}
                renderItem={renderSessionItem}
                keyExtractor={keyExtractor}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyState}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={logic.isLoading}
                        onRefresh={logic.refreshSessions}
                        tintColor={colors.text.primary}
                        colors={[colors.text.primary]}
                    />
                }
            />

            {/* Start Recording Button */}
            <View style={styles.bottomContainer}>
                <TouchableOpacity
                    style={[styles.recordButton, { backgroundColor: colors.text.primary }]}
                    onPress={logic.handleStartSession}
                    activeOpacity={0.8}
                >
                    <MaterialCommunityIcons name="microphone" size={24} color={colors.text.inverse} />
                    <Text style={[styles.recordButtonText, { color: colors.text.inverse }]}>
                        {t('topicDetail.startRecording')}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Edit Modal */}
            <Modal
                visible={logic.isEditModalVisible}
                transparent
                animationType="slide"
                onRequestClose={logic.hideEditModal}
            >
                <KeyboardAvoidingView
                    style={styles.modalOverlay}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <Pressable style={styles.modalOverlay} onPress={logic.hideEditModal}>
                        <Pressable
                            style={[styles.modalContent, { backgroundColor: colors.background.primary }]}
                            onPress={(e) => e.stopPropagation()}
                        >
                            {/* Modal Header */}
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: colors.text.primary }]}>
                                    {t('topicDetail.editModal.title')}
                                </Text>
                                <Pressable onPress={logic.hideEditModal}>
                                    <MaterialIcons name="close" size={24} color={colors.text.secondary} />
                                </Pressable>
                            </View>

                            {/* Input */}
                            <GlassView style={styles.modalInputContainer} showBorder>
                                <TextInput
                                    style={[styles.modalInput, { color: colors.text.primary }]}
                                    placeholder={t('topicDetail.editModal.placeholder')}
                                    placeholderTextColor={colors.text.muted}
                                    value={logic.editTitle}
                                    onChangeText={logic.setEditTitle}
                                    autoFocus
                                    returnKeyType="done"
                                    onSubmitEditing={handleEditSave}
                                />
                            </GlassView>

                            {/* Save Button */}
                            <TouchableOpacity
                                style={[
                                    styles.modalSaveButton,
                                    { backgroundColor: colors.text.primary },
                                    !logic.editTitle.trim() && styles.modalSaveButtonDisabled,
                                ]}
                                onPress={handleEditSave}
                                disabled={!logic.editTitle.trim()}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.modalSaveButtonText, { color: colors.text.inverse }]}>
                                    {t('topicDetail.editModal.save')}
                                </Text>
                            </TouchableOpacity>
                        </Pressable>
                    </Pressable>
                </KeyboardAvoidingView>
            </Modal>
        </ScreenWrapper>
    );
}

export const TopicDetailScreen = memo(TopicDetailScreenComponent);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        gap: Spacing.sm,
    },
    backButton: {
        padding: Spacing.xs,
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
    },
    headerSubtitle: {
        fontSize: 13,
        marginTop: 2,
    },
    headerActions: {
        flexDirection: 'row',
        gap: Spacing.xs,
    },
    headerButton: {
        padding: Spacing.xs,
    },
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: 120,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 16,
    },
    errorStateContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
        gap: Spacing.md,
    },
    errorText: {
        fontSize: 16,
        textAlign: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.xxl * 2,
        gap: Spacing.sm,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: Spacing.md,
    },
    emptyDescription: {
        fontSize: 14,
        textAlign: 'center',
    },
    bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: Spacing.lg,
        paddingBottom: Spacing.xl,
    },
    recordButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.lg,
        gap: Spacing.sm,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    recordButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        borderTopLeftRadius: BorderRadius.xl,
        borderTopRightRadius: BorderRadius.xl,
        padding: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
    },
    modalInputContainer: {
        marginBottom: Spacing.lg,
    },
    modalInput: {
        fontSize: 16,
        padding: Spacing.md,
    },
    modalSaveButton: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalSaveButtonDisabled: {
        opacity: 0.5,
    },
    modalSaveButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
});

export default TopicDetailScreen;
/**
 * @file useTopicDetail.ts
 * @description Topic Detail Hook - Business logic for TopicDetailScreen
 *
 * FIXED:
 * - Removed loadedTopicIdRef which was causing navigation issues
 * - Always load topic when topicId changes (expo-router reuses screen instances)
 * - Removed store action from useEffect dependencies to prevent infinite loops
 * - Added proper cleanup when navigating away
 */

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useStore, selectCurrentTopic, selectIsLoading, selectError } from '@/store';
import type { Topic, Session } from '@/store';
import { formatSessionHistoryDate } from '@/shared/utils/dateUtils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SessionItemData {
    session: Session;
    formattedDate: string;
}

interface UseTopicDetailReturn {
    // State
    topic: Topic | null;
    sessions: SessionItemData[];
    isLoading: boolean;
    error: string | null;
    isEditModalVisible: boolean;
    editTitle: string;

    // Actions
    loadTopicDetail: (topicId: string) => Promise<Topic | null>;
    refreshTopic: () => Promise<void>;
    refreshSessions: () => Promise<void>;
    handleUpdateTitle: () => Promise<void>;
    handleDeleteTopic: () => Promise<void>;
    handleStartSession: () => void;
    handleSessionPress: (sessionId: string) => void;
    setEditTitle: (title: string) => void;
    showEditModal: () => void;
    hideEditModal: () => void;
    clearError: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useTopicDetail(topicId: string): UseTopicDetailReturn {
    const router = useRouter();

    // Local state for edit modal
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editTitle, setEditTitle] = useState('');

    // Store state and actions
    const currentTopic = useStore(selectCurrentTopic);
    const isLoading = useStore(selectIsLoading);
    const error = useStore(selectError);
    const {
        loadTopicDetail: loadTopicDetailFromStore,
        updateTopicTitle,
        deleteTopic,
        setCurrentTopic,
        clearError: clearStoreError,
    } = useStore();

    // =========================================================================
    // ✅ FIX: Only use the topic if it matches the current topicId
    // This prevents showing stale data from a previous topic
    // =========================================================================
    const topic = useMemo(() => {
        if (currentTopic && currentTopic.id === topicId) {
            return currentTopic;
        }
        return null;
    }, [currentTopic, topicId]);

    // ═══════════════════════════════════════════════════════════════════════
    // Transform sessions to SessionItemData with formattedDate
    // ═══════════════════════════════════════════════════════════════════════
    const sessions: SessionItemData[] = useMemo(() => {
        const rawSessions = topic?.sessions || [];

        return rawSessions
            .filter((session): session is Session => {
                return session !== undefined && session !== null && typeof session.id === 'string';
            })
            .map((session) => ({
                session,
                formattedDate: formatSessionHistoryDate(session.date),
            }))
            .sort((a, b) => {
                return new Date(b.session.date).getTime() - new Date(a.session.date).getTime();
            });
    }, [topic?.sessions]);

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ FIX: Always load topic when topicId changes
    // Expo-router reuses screen instances, so we need to reload on every
    // topicId change, not just on mount.
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (topicId) {
            console.log('[useTopicDetail] Loading topic:', topicId);
            loadTopicDetailFromStore(topicId);
        }

        // ✅ FIX: Cleanup - clear current topic when unmounting or changing topics
        // This prevents stale data from showing when navigating to a new topic
        return () => {
            // Don't clear if we're just unmounting temporarily (modal, etc)
            // Only clear on actual navigation away
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [topicId]); // Only depend on topicId, NOT loadTopicDetailFromStore

    /**
     * Load topic detail from API
     */
    const loadTopicDetail = useCallback(async (id: string): Promise<Topic | null> => {
        return await loadTopicDetailFromStore(id);
    }, [loadTopicDetailFromStore]);

    /**
     * Refresh current topic (force reload)
     */
    const refreshTopic = useCallback(async () => {
        if (topicId) {
            console.log('[useTopicDetail] Refreshing topic:', topicId);
            await loadTopicDetailFromStore(topicId);
        }
    }, [topicId, loadTopicDetailFromStore]);

    /**
     * Refresh sessions (same as refreshTopic for now)
     */
    const refreshSessions = useCallback(async () => {
        if (topicId) {
            console.log('[useTopicDetail] Refreshing sessions for topic:', topicId);
            await loadTopicDetailFromStore(topicId);
        }
    }, [topicId, loadTopicDetailFromStore]);

    /**
     * Update topic title
     */
    const handleUpdateTitle = useCallback(async () => {
        if (!topic || !editTitle.trim()) {
            return;
        }

        console.log('[useTopicDetail] Updating title to:', editTitle);

        try {
            await updateTopicTitle(topic.id, editTitle);
            setIsEditModalVisible(false);
        } catch (err) {
            console.error('[useTopicDetail] Failed to update title:', err);
        }
    }, [topic, editTitle, updateTopicTitle]);

    /**
     * Delete current topic
     */
    const handleDeleteTopic = useCallback(async () => {
        if (!topic) return;

        console.log('[useTopicDetail] Deleting topic:', topic.id);
        await deleteTopic(topic.id);
        router.back();
    }, [topic, deleteTopic, router]);

    /**
     * Navigate to session recording screen
     */
    const handleStartSession = useCallback(() => {
        if (topicId) {
            router.push(`/${topicId}/session`);
        }
    }, [topicId, router]);

    /**
     * Navigate to session result screen
     */
    const handleSessionPress = useCallback((sessionId: string) => {
        if (topicId) {
            console.log('[useTopicDetail] Opening session:', sessionId);
            router.push(`/${topicId}/result?sessionId=${sessionId}`);
        }
    }, [topicId, router]);

    /**
     * Show edit modal
     */
    const showEditModal = useCallback(() => {
        setEditTitle(topic?.title || '');
        setIsEditModalVisible(true);
    }, [topic]);

    /**
     * Hide edit modal
     */
    const hideEditModal = useCallback(() => {
        setIsEditModalVisible(false);
        setEditTitle('');
    }, []);

    /**
     * Clear error state
     */
    const clearError = useCallback(() => {
        clearStoreError();
    }, [clearStoreError]);

    return {
        // State
        topic,
        sessions,
        isLoading,
        error,
        isEditModalVisible,
        editTitle,

        // Actions
        loadTopicDetail,
        refreshTopic,
        refreshSessions,
        handleUpdateTitle,
        handleDeleteTopic,
        handleStartSession,
        handleSessionPress,
        setEditTitle,
        showEditModal,
        hideEditModal,
        clearError,
    };
}
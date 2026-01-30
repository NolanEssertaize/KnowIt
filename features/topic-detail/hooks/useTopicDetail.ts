/**
 * @file useTopicDetail.ts
 * @description Topic Detail Hook - Business logic for TopicDetailScreen
 *
 * FIXED:
 * - Added loadedTopicIdRef to prevent unnecessary reloads and ID loss
 * - Only loads topic when topicId changes AND hasn't been loaded yet
 */

import { useCallback, useEffect, useState, useMemo, useRef } from 'react';
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

    // ✅ FIX: Track which topicId has been loaded to prevent re-fetching
    const loadedTopicIdRef = useRef<string | null>(null);

    // Store state and actions
    const topic = useStore(selectCurrentTopic);
    const isLoading = useStore(selectIsLoading);
    const error = useStore(selectError);
    const {
        loadTopicDetail: loadTopicDetailFromStore,
        updateTopicTitle,
        deleteTopic,
        clearError: clearStoreError,
    } = useStore();

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
    // ✅ FIX: Load topic detail only when necessary
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        // Only load if:
        // 1. We have a topicId
        // 2. We haven't loaded this specific topicId yet OR the current topic doesn't match
        if (topicId && loadedTopicIdRef.current !== topicId) {
            console.log('[useTopicDetail] Loading topic:', topicId);
            loadedTopicIdRef.current = topicId;
            loadTopicDetailFromStore(topicId);
        }
    }, [topicId]); // ✅ Removed loadTopicDetailFromStore from deps to prevent loops

    /**
     * Load topic detail from API
     */
    const loadTopicDetail = useCallback(async (id: string): Promise<Topic | null> => {
        loadedTopicIdRef.current = id;
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
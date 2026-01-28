/**
 * @file useTopicDetail.ts
 * @description Topic Detail Hook - Business logic for TopicDetailScreen
 *
 * Pattern: MVVM - This hook serves as the ViewModel for topic detail view
 *
 * FIX:
 * - Sessions are now transformed to SessionItemData with formattedDate
 * - Added refreshSessions method
 * - Added handleSessionPress for navigation
 */

import { useCallback, useEffect, useState, useMemo } from 'react';
import { useRouter } from 'expo-router';
import { useStore, selectCurrentTopic, selectIsLoading, selectError } from '@/store';
import type { Topic, Session } from '@/store';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Session item data for FlatList rendering
 */
export interface SessionItemData {
    session: Session;
    formattedDate: string;
}

interface UseTopicDetailReturn {
    // State
    topic: Topic | null;
    sessions: SessionItemData[]; // Changed from Session[] to SessionItemData[]
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
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format date to relative or absolute string
 */
function formatSessionDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        // Today - show time
        return `Aujourd'hui à ${date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
        return 'Hier';
    } else if (diffDays < 7) {
        return `Il y a ${diffDays} jours`;
    } else {
        return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    }
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
    // FIX: Transform sessions to SessionItemData with formattedDate
    // ═══════════════════════════════════════════════════════════════════════
    const sessions: SessionItemData[] = useMemo(() => {
        const rawSessions = topic?.sessions || [];

        return rawSessions
            .filter((session): session is Session => {
                // Filter out undefined/null sessions
                return session !== undefined && session !== null && typeof session.id === 'string';
            })
            .map((session) => ({
                session,
                formattedDate: formatSessionDate(session.date),
            }))
            .sort((a, b) => {
                // Sort by date descending (newest first)
                return new Date(b.session.date).getTime() - new Date(a.session.date).getTime();
            });
    }, [topic?.sessions]);

    // ─────────────────────────────────────────────────────────────────────────
    // Load topic detail on mount or when topicId changes
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (topicId) {
            console.log('[useTopicDetail] Loading topic:', topicId);
            loadTopicDetailFromStore(topicId);
        }
    }, [topicId, loadTopicDetailFromStore]);

    /**
     * Load topic detail from API
     */
    const loadTopicDetail = useCallback(async (id: string): Promise<Topic | null> => {
        return await loadTopicDetailFromStore(id);
    }, [loadTopicDetailFromStore]);

    /**
     * Refresh current topic
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
        } catch (error) {
            console.error('[useTopicDetail] Failed to update title:', error);
        }
    }, [topic, editTitle, updateTopicTitle]);

    /**
     * Delete current topic
     */
    const handleDeleteTopic = useCallback(async () => {
        if (!topic) return;

        console.log('[useTopicDetail] Deleting topic:', topic.id);
        await deleteTopic(topic.id);
        // Navigate back after deletion
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
            // Navigate to result screen with session data
            // You might need to adjust this based on your routing structure
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
        sessions, // Now returns SessionItemData[]
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
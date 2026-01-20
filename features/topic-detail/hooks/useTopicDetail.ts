/**
 * @file useTopicDetail.ts
 * @description Topic Detail Hook - Business logic for TopicDetailScreen
 * 
 * Pattern: MVVM - This hook serves as the ViewModel for topic detail view
 */

import { useCallback, useEffect, useState } from 'react';
import { useStore, selectCurrentTopic, selectIsLoading, selectError } from '@/store';
import type { Topic, Session } from '@/store';

interface UseTopicDetailReturn {
  // State
  topic: Topic | null;
  sessions: Session[];
  isLoading: boolean;
  error: string | null;
  isEditModalVisible: boolean;
  editTitle: string;
  
  // Actions
  loadTopicDetail: (topicId: string) => Promise<Topic | null>;
  refreshTopic: () => Promise<void>;
  handleUpdateTitle: () => Promise<void>;
  handleDeleteTopic: () => Promise<void>;
  setEditTitle: (title: string) => void;
  showEditModal: () => void;
  hideEditModal: () => void;
  clearError: () => void;
}

export function useTopicDetail(topicId: string): UseTopicDetailReturn {
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

  // Derived state
  const sessions = topic?.sessions || [];

  // Load topic detail on mount or when topicId changes
  useEffect(() => {
    if (topicId) {
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
  }, [topic, deleteTopic]);

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
    handleUpdateTitle,
    handleDeleteTopic,
    setEditTitle,
    showEditModal,
    hideEditModal,
    clearError,
  };
}

/**
 * @file useTopics.ts
 * @description Topics Hook - Business logic for TopicsScreen
 * 
 * Pattern: MVVM - This hook serves as the ViewModel for topics views
 */

import { useCallback, useEffect, useState } from 'react';
import { useStore, selectTopics, selectIsLoading, selectError } from '@/store';
import type { Topic } from '@/store';

interface UseTopicsReturn {
  // State
  topics: Topic[];
  isLoading: boolean;
  error: string | null;
  isAddModalVisible: boolean;
  newTopicTitle: string;
  
  // Actions
  loadTopics: () => Promise<void>;
  handleAddTopic: (title: string) => Promise<Topic | null>;
  handleDeleteTopic: (topicId: string) => Promise<void>;
  handleUpdateTopicTitle: (topicId: string, newTitle: string) => Promise<void>;
  setNewTopicTitle: (title: string) => void;
  showAddModal: () => void;
  hideAddModal: () => void;
  clearError: () => void;
  getTopicById: (topicId: string) => Topic | undefined;
}

export function useTopics(): UseTopicsReturn {
  // Local state for modal
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');

  // Store state and actions
  const topics = useStore(selectTopics);
  const isLoading = useStore(selectIsLoading);
  const error = useStore(selectError);
  const {
    loadTopics: loadTopicsFromStore,
    addTopic,
    deleteTopic,
    updateTopicTitle,
    getTopicById,
    clearError: clearStoreError,
  } = useStore();

  // Load topics on mount
  useEffect(() => {
    loadTopicsFromStore();
  }, [loadTopicsFromStore]);

  /**
   * Refresh topics from API
   */
  const loadTopics = useCallback(async () => {
    await loadTopicsFromStore();
  }, [loadTopicsFromStore]);

  /**
   * Add a new topic
   */
  const handleAddTopic = useCallback(async (title: string): Promise<Topic | null> => {
    if (!title.trim()) {
      return null;
    }

    console.log('[useTopics] Adding topic:', title);
    
    const newTopic = await addTopic(title);
    
    if (newTopic) {
      // Close modal and reset title
      setIsAddModalVisible(false);
      setNewTopicTitle('');
    }

    return newTopic;
  }, [addTopic]);

  /**
   * Delete a topic
   */
  const handleDeleteTopic = useCallback(async (topicId: string) => {
    console.log('[useTopics] Deleting topic:', topicId);
    await deleteTopic(topicId);
  }, [deleteTopic]);

  /**
   * Update topic title
   */
  const handleUpdateTopicTitle = useCallback(async (
    topicId: string,
    newTitle: string,
  ) => {
    if (!newTitle.trim()) {
      return;
    }

    console.log('[useTopics] Updating topic title:', topicId);
    await updateTopicTitle(topicId, newTitle);
  }, [updateTopicTitle]);

  /**
   * Show add topic modal
   */
  const showAddModal = useCallback(() => {
    setNewTopicTitle('');
    setIsAddModalVisible(true);
  }, []);

  /**
   * Hide add topic modal
   */
  const hideAddModal = useCallback(() => {
    setIsAddModalVisible(false);
    setNewTopicTitle('');
  }, []);

  /**
   * Clear error state
   */
  const clearError = useCallback(() => {
    clearStoreError();
  }, [clearStoreError]);

  return {
    // State
    topics,
    isLoading,
    error,
    isAddModalVisible,
    newTopicTitle,

    // Actions
    loadTopics,
    handleAddTopic,
    handleDeleteTopic,
    handleUpdateTopicTitle,
    setNewTopicTitle,
    showAddModal,
    hideAddModal,
    clearError,
    getTopicById,
  };
}

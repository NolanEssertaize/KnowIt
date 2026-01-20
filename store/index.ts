/**
 * @file index.ts
 * @description Store Module - Centralized Zustand stores
 */

// Auth Store
export {
  useAuthStore,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading as selectAuthIsLoading,
  selectAuthError,
  selectIsInitialized,
} from './useAuthStore';

// Topics Store
export {
  useStore,
  selectTopics,
  selectCurrentTopic,
  selectIsLoading,
  selectError,
  selectTopicById,
} from './useStore';

// Types
export type { Topic, Session } from './useStore';

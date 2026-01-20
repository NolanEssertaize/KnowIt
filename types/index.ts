/**
 * @file index.ts
 * @description Frontend Types - Re-exports and extends API types
 */

// Re-export API types
export type {
  // Auth
  AuthProvider,
  UserCreate,
  UserLogin,
  UserRead,
  UserUpdate,
  Token,
  AuthResponse,
  // Transcription
  TranscriptionResponse,
  // Analysis
  AnalysisResult,
  AnalysisRequest,
  AnalysisResponse,
  // Session
  SessionRead,
  // Topic
  TopicCreate,
  TopicRead,
  TopicDetail,
  TopicUpdate,
  TopicList,
  // Generic
  ApiError,
  PaginationParams,
} from '@/shared/api';

// Re-export Store types
export type { Topic, Session } from '@/store';

// ═══════════════════════════════════════════════════════════════════════════
// ADDITIONAL FRONTEND TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Recording state for session screen
 */
export type RecordingState = 'idle' | 'recording' | 'analyzing' | 'complete' | 'error';

/**
 * Navigation params
 */
export interface TopicRouteParams {
  topicId: string;
}

export interface SessionRouteParams {
  topicId: string;
}

export interface ResultRouteParams {
  topicId: string;
  transcription: string;
  analysis: string; // JSON stringified AnalysisResult
}

/**
 * Form validation error
 */
export interface FormError {
  field: string;
  message: string;
}

/**
 * Loading state with message
 */
export interface LoadingState {
  isLoading: boolean;
  message?: string;
}

/**
 * Async operation result
 */
export interface AsyncResult<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

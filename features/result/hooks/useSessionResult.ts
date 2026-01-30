/**
 * @file useSessionResult.ts
 * @description Hook for fetching and managing session result/analysis data
 *
 * FIXED:
 * - Replaced useSessionStore (which doesn't exist) with useStore
 * - Uses currentTopic from store to get session data
 * - Properly accesses sessions from the topic's sessions array
 *
 * Usage:
 * const { session, analysis, isLoading, error } = useSessionResult(sessionId);
 */

import { useState, useEffect, useCallback } from 'react';
import { useStore, selectCurrentTopic } from '@/store';
import type { Session as StoreSession } from '@/store';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface SessionAnalysis {
    score?: number;
    correctPoints?: string[];
    corrections?: string[];
    missingElements?: string[];
}

export interface Session {
    id: string;
    topicId?: string;
    transcription?: string;
    analysis?: SessionAnalysis;
    duration?: number;
    createdAt?: string;
    updatedAt?: string;
    date?: string;
    audioUri?: string;
}

export interface UseSessionResultReturn {
    /** The session data */
    session: Session | null;
    /** Parsed analysis data */
    analysis: SessionAnalysis | null;
    /** Loading state */
    isLoading: boolean;
    /** Error message if any */
    error: string | null;
    /** Refresh the session data */
    refresh: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Convert store session to local session format
 */
function mapStoreSessionToSession(storeSession: StoreSession, topicId?: string): Session {
    return {
        id: storeSession.id,
        topicId,
        transcription: storeSession.transcription,
        analysis: storeSession.analysis ? {
            score: storeSession.analysis.score,
            correctPoints: storeSession.analysis.correct_points,
            corrections: storeSession.analysis.corrections,
            missingElements: storeSession.analysis.missing_elements,
        } : undefined,
        date: storeSession.date,
        audioUri: storeSession.audioUri,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSessionResult(sessionId: string | undefined): UseSessionResultReturn {
    const [session, setSession] = useState<Session | null>(null);
    const [analysis, setAnalysis] = useState<SessionAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // ✅ FIX: Use the main store instead of non-existent useSessionStore
    const currentTopic = useStore(selectCurrentTopic);

    // ─────────────────────────────────────────────────────────────────────────
    // FETCH SESSION DATA
    // ─────────────────────────────────────────────────────────────────────────

    const fetchSession = useCallback(async () => {
        if (!sessionId) {
            setIsLoading(false);
            setError('No session ID provided');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // ✅ FIX: First, try to get session from currentTopic's sessions
            if (currentTopic?.sessions) {
                const storedSession = currentTopic.sessions.find(s => s.id === sessionId);

                if (storedSession) {
                    const mappedSession = mapStoreSessionToSession(storedSession, currentTopic.id);
                    setSession(mappedSession);
                    setAnalysis(mappedSession.analysis || null);
                    setIsLoading(false);
                    return;
                }
            }

            // If not in store, fetch from API
            const response = await fetch(
                `${process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000'}/api/sessions/${sessionId}`
            );

            if (!response.ok) {
                throw new Error(`Failed to fetch session: ${response.status}`);
            }

            const data = await response.json();

            setSession(data);
            setAnalysis(data.analysis || null);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to load session';
            setError(errorMessage);
            console.error('[useSessionResult] Error:', err);
        } finally {
            setIsLoading(false);
        }
    }, [sessionId, currentTopic]);

    // ─────────────────────────────────────────────────────────────────────────
    // REFRESH FUNCTION
    // ─────────────────────────────────────────────────────────────────────────

    const refresh = useCallback(async () => {
        await fetchSession();
    }, [fetchSession]);

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        fetchSession();
    }, [fetchSession]);

    return {
        session,
        analysis,
        isLoading,
        error,
        refresh,
    };
}

export default useSessionResult;
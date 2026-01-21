/**
 * @file useSessionWithAudio.ts
 * @description Logic Controller pour l'écran d'enregistrement avec audio réel
 * Combine useSession et useAudioRecording
 *
 * FIXES:
 * - Uses selectCurrentTopic instead of selectTopicById to fix "Topic introuvable" error
 * - The topic is already loaded by TopicDetailScreen, so we use currentTopic
 */

import { useState, useCallback, useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectCurrentTopic } from '@/store/useStore';
import { useAudioRecording } from './useAudioRecording';
import type { Topic, RecordingState } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseSessionWithAudioReturn {
    // Data
    topic: Topic | null;
    recordingState: RecordingState;
    isRecording: boolean;
    isAnalyzing: boolean;
    audioLevel: number;
    audioUri: string | null;
    error: string | null;
    hasPermission: boolean;
    duration: number;

    // Methods
    toggleRecording: () => Promise<void>;
    handleClose: () => void;
    requestPermission: () => Promise<boolean>;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSessionWithAudio(): UseSessionWithAudioReturn {
    const { topicId } = useLocalSearchParams<{ topicId: string }>();
    const router = useRouter();

    // FIX: Use currentTopic instead of selectTopicById
    // The topic is already loaded by TopicDetailScreen before navigating here
    const topic = useStore(selectCurrentTopic);

    // Hook d'enregistrement audio
    const audio = useAudioRecording();

    // État d'analyse
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Derived state pour combiner les états
    const recordingState: RecordingState = isAnalyzing
        ? 'analyzing'
        : audio.isRecording
            ? 'recording'
            : 'idle';

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const toggleRecording = useCallback(async () => {
        if (audio.isRecording) {
            // Arrêter l'enregistrement
            const uri = await audio.stopRecording();

            if (uri) {
                setIsAnalyzing(true);

                // TODO: Implémenter l'appel réel à l'API
                // Pour l'instant, simulation de l'analyse
                console.log('[useSessionWithAudio] Audio URI:', uri);
                console.log('[useSessionWithAudio] Duration:', audio.duration, 'seconds');

                // Simulation d'analyse (à remplacer par l'appel API réel)
                setTimeout(() => {
                    setIsAnalyzing(false);

                    // Navigation vers les résultats avec données mock
                    router.replace({
                        pathname: `/${topicId}/result`,
                        params: {
                            audioUri: uri,
                            valid: JSON.stringify([
                                'Point clé 1 correctement énoncé',
                                'Bonne compréhension du concept',
                            ]),
                            corrections: JSON.stringify(['Préciser davantage ce point']),
                            missing: JSON.stringify(['Concept important non mentionné']),
                        },
                    });
                }, 2000);
            }
        } else {
            // Démarrer l'enregistrement
            await audio.startRecording();
        }
    }, [audio, topicId, router]);

    const handleClose = useCallback(() => {
        // Arrêter l'enregistrement si en cours
        if (audio.isRecording) {
            audio.stopRecording();
        }
        router.back();
    }, [audio, router]);

    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            // Reset audio state on unmount
            audio.reset();
        };
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        // Data
        topic,
        recordingState,
        isRecording: audio.isRecording,
        isAnalyzing,
        audioLevel: audio.audioLevel,
        audioUri: audio.audioUri,
        error: audio.error,
        hasPermission: audio.hasPermission,
        duration: audio.duration,

        // Methods
        toggleRecording,
        handleClose,
        requestPermission: audio.requestPermission,
    };
}

export default useSessionWithAudio;
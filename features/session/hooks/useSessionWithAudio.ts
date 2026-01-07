/**
 * @file useSessionWithAudio.ts
 * @description Logic Controller pour l'écran d'enregistrement avec audio réel
 * Combine useSession et useAudioRecording
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useStore, selectTopicById } from '@/store/useStore';
import { useAudioRecording } from './useAudioRecording';
import type { Topic, RecordingState } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseSessionWithAudioReturn {
    // Data
    topic: Topic | undefined;
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

    const topic = useStore(selectTopicById(topicId ?? ''));

    // Hook d'enregistrement audio
    const audio = useAudioRecording();

    // État d'analyse
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Ref pour stocker les fonctions audio et éviter les problèmes de closure
    const audioRef = useRef(audio);
    audioRef.current = audio;

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
        const currentAudio = audioRef.current;

        console.log('[useSessionWithAudio] toggleRecording called, isRecording:', currentAudio.isRecording);

        if (currentAudio.isRecording) {
            // Arrêter l'enregistrement
            const uri = await currentAudio.stopRecording();

            if (uri) {
                setIsAnalyzing(true);

                // TODO: Implémenter l'appel réel à l'API
                console.log('[useSessionWithAudio] Audio URI:', uri);
                console.log('[useSessionWithAudio] Duration:', currentAudio.duration, 'seconds');

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
            await currentAudio.startRecording();
        }
    }, [topicId, router]);

    const handleClose = useCallback(() => {
        const currentAudio = audioRef.current;

        // Arrêter l'enregistrement si en cours
        if (currentAudio.isRecording) {
            currentAudio.stopRecording();
        }
        router.back();
    }, [router]);

    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            // Reset audio state on unmount - utiliser la ref pour avoir la dernière version
            audioRef.current.reset();
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
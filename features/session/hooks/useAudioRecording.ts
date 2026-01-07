/**
 * @file useAudioRecording.ts
 * @description Hook pour gérer l'enregistrement audio avec analyse d'intensité
 * Utilise expo-audio (nouvelle API remplaçant expo-av)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { useAudioRecorder, AudioModule, RecordingPresets } from 'expo-audio';
import type { RecordingState } from '@/types';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface UseAudioRecordingReturn {
    /** État de l'enregistrement */
    recordingState: RecordingState;
    /** Niveau audio normalisé (0-1) */
    audioLevel: number;
    /** L'enregistrement est en cours */
    isRecording: boolean;
    /** L'analyse est en cours */
    isAnalyzing: boolean;
    /** URI du fichier audio enregistré */
    audioUri: string | null;
    /** Erreur éventuelle */
    error: string | null;
    /** Permission microphone accordée */
    hasPermission: boolean;
    /** Durée d'enregistrement en secondes */
    duration: number;

    // Actions
    /** Démarre l'enregistrement */
    startRecording: () => Promise<void>;
    /** Arrête l'enregistrement */
    stopRecording: () => Promise<string | null>;
    /** Bascule l'état d'enregistrement */
    toggleRecording: () => Promise<void>;
    /** Demande les permissions */
    requestPermission: () => Promise<boolean>;
    /** Reset l'état */
    reset: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

// Intervalle de mise à jour du niveau audio (ms)
const METERING_INTERVAL = 50;

// Lissage exponentiel pour le niveau audio
const SMOOTHING_FACTOR = 0.3;

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useAudioRecording(): UseAudioRecordingReturn {
    // États
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [audioLevel, setAudioLevel] = useState(0);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [duration, setDuration] = useState(0);

    // Expo Audio Recorder Hook
    const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);

    // Refs pour éviter les problèmes de closure et appels multiples
    const isRecordingRef = useRef(false);
    const isProcessingRef = useRef(false); // Protection contre appels multiples
    const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const smoothedLevelRef = useRef(0);
    const startTimeRef = useRef<number>(0);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Derived states
    const isRecording = recordingState === 'recording';
    const isAnalyzing = recordingState === 'analyzing';

    // ─────────────────────────────────────────────────────────────────────────
    // PERMISSIONS
    // ─────────────────────────────────────────────────────────────────────────

    const requestPermission = useCallback(async (): Promise<boolean> => {
        try {
            console.log('[useAudioRecording] Requesting permission...');
            const status = await AudioModule.requestRecordingPermissionsAsync();
            const granted = status.granted;
            setHasPermission(granted);

            if (!granted) {
                setError('Permission microphone refusée');
            } else {
                setError(null);
            }

            console.log('[useAudioRecording] Permission:', granted ? 'granted' : 'denied');
            return granted;
        } catch (err) {
            console.error('[useAudioRecording] Permission error:', err);
            setError('Erreur lors de la demande de permission');
            return false;
        }
    }, []);

    // Vérifier les permissions au montage
    useEffect(() => {
        const checkPermission = async () => {
            try {
                const status = await AudioModule.getRecordingPermissionsAsync();
                setHasPermission(status.granted);
            } catch (err) {
                console.error('[useAudioRecording] Check permission error:', err);
            }
        };
        checkPermission();
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // METERING (Niveau audio)
    // ─────────────────────────────────────────────────────────────────────────

    const startMetering = useCallback(() => {
        // Nettoyer l'intervalle existant
        if (meteringIntervalRef.current) {
            clearInterval(meteringIntervalRef.current);
        }

        meteringIntervalRef.current = setInterval(() => {
            // Utiliser notre ref au lieu de audioRecorder.isRecording
            if (isRecordingRef.current) {
                try {
                    // Récupérer le niveau de metering depuis le recorder
                    const metering = audioRecorder.currentMetering;

                    if (metering !== undefined && metering !== null) {
                        // Convertir les dB en valeur normalisée (0-1)
                        const db = metering;
                        const minDb = -60;
                        const maxDb = 0;

                        let normalizedLevel = (db - minDb) / (maxDb - minDb);
                        normalizedLevel = Math.max(0, Math.min(1, normalizedLevel));
                        normalizedLevel = Math.pow(normalizedLevel, 0.7);

                        smoothedLevelRef.current =
                            smoothedLevelRef.current * (1 - SMOOTHING_FACTOR) +
                            normalizedLevel * SMOOTHING_FACTOR;

                        setAudioLevel(smoothedLevelRef.current);
                    }
                } catch (err) {
                    console.debug('[useAudioRecording] Metering error:', err);
                }
            }
        }, METERING_INTERVAL);
    }, [audioRecorder]);

    const stopMetering = useCallback(() => {
        if (meteringIntervalRef.current) {
            clearInterval(meteringIntervalRef.current);
            meteringIntervalRef.current = null;
        }
        smoothedLevelRef.current = 0;
        setAudioLevel(0);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // DURATION TRACKING
    // ─────────────────────────────────────────────────────────────────────────

    const startDurationTracking = useCallback(() => {
        startTimeRef.current = Date.now();
        setDuration(0);

        durationIntervalRef.current = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setDuration(elapsed);
        }, 1000);
    }, []);

    const stopDurationTracking = useCallback(() => {
        if (durationIntervalRef.current) {
            clearInterval(durationIntervalRef.current);
            durationIntervalRef.current = null;
        }
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RECORDING ACTIONS
    // ─────────────────────────────────────────────────────────────────────────

    const startRecording = useCallback(async () => {
        // Protection contre appels multiples
        if (isProcessingRef.current || isRecordingRef.current) {
            console.log('[useAudioRecording] Already recording or processing, ignoring start');
            return;
        }

        isProcessingRef.current = true;

        try {
            setError(null);
            console.log('[useAudioRecording] Starting recording...');

            // Vérifier/demander les permissions
            if (!hasPermission) {
                const granted = await requestPermission();
                if (!granted) {
                    isProcessingRef.current = false;
                    return;
                }
            }

            // Configurer le mode audio pour iOS (OBLIGATOIRE avant d'enregistrer)
            await AudioModule.setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
            });

            // Démarrer l'enregistrement avec expo-audio
            audioRecorder.record();

            // Marquer comme en cours d'enregistrement
            isRecordingRef.current = true;
            setRecordingState('recording');
            setAudioUri(null);

            // Démarrer le monitoring
            startMetering();
            startDurationTracking();

            console.log('[useAudioRecording] Recording started');
        } catch (err) {
            console.error('[useAudioRecording] Start error:', err);
            setError('Erreur lors du démarrage de l\'enregistrement');
            setRecordingState('idle');
            isRecordingRef.current = false;
        } finally {
            isProcessingRef.current = false;
        }
    }, [hasPermission, requestPermission, audioRecorder, startMetering, startDurationTracking]);

    const stopRecording = useCallback(async (): Promise<string | null> => {
        // Protection contre appels multiples - utiliser notre ref
        if (isProcessingRef.current) {
            console.log('[useAudioRecording] Already processing, ignoring stop');
            return null;
        }

        if (!isRecordingRef.current) {
            console.warn('[useAudioRecording] Not recording, ignoring stop');
            return null;
        }

        isProcessingRef.current = true;

        try {
            console.log('[useAudioRecording] Stopping recording...');

            // Arrêter le monitoring
            stopMetering();
            stopDurationTracking();

            // Marquer immédiatement comme arrêté pour éviter les doubles appels
            isRecordingRef.current = false;

            // Arrêter l'enregistrement
            await audioRecorder.stop();

            // Récupérer l'URI
            const uri = audioRecorder.uri;

            // Réinitialiser le mode audio iOS
            await AudioModule.setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });

            console.log('[useAudioRecording] Recording stopped, URI:', uri);

            setAudioUri(uri ?? null);
            setRecordingState('idle');

            return uri ?? null;
        } catch (err) {
            console.error('[useAudioRecording] Stop error:', err);
            setError('Erreur lors de l\'arrêt de l\'enregistrement');
            setRecordingState('idle');
            isRecordingRef.current = false;
            return null;
        } finally {
            isProcessingRef.current = false;
        }
    }, [audioRecorder, stopMetering, stopDurationTracking]);

    const toggleRecording = useCallback(async () => {
        // Utiliser la ref pour une vérification fiable
        if (isRecordingRef.current) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }, [startRecording, stopRecording]);

    const reset = useCallback(() => {
        stopMetering();
        stopDurationTracking();
        isRecordingRef.current = false;
        isProcessingRef.current = false;
        setRecordingState('idle');
        setAudioLevel(0);
        setAudioUri(null);
        setError(null);
        setDuration(0);
    }, [stopMetering, stopDurationTracking]);

    // ─────────────────────────────────────────────────────────────────────────
    // CLEANUP
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        return () => {
            // Nettoyer les intervalles
            if (meteringIntervalRef.current) {
                clearInterval(meteringIntervalRef.current);
            }
            if (durationIntervalRef.current) {
                clearInterval(durationIntervalRef.current);
            }
        };
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        // State
        recordingState,
        audioLevel,
        isRecording,
        isAnalyzing,
        audioUri,
        error,
        hasPermission,
        duration,

        // Actions
        startRecording,
        stopRecording,
        toggleRecording,
        requestPermission,
        reset,
    };
}

export default useAudioRecording;
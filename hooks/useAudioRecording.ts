/**
 * @file useAudioRecording.ts
 * @description Hook pour gérer l'enregistrement audio avec analyse d'intensité
 * Utilise expo-av pour l'enregistrement et le monitoring du niveau audio
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio, type AVPlaybackStatus } from 'expo-av';
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

const AUDIO_RECORDING_OPTIONS: Audio.RecordingOptions = {
    isMeteringEnabled: true, // Important pour le niveau audio
    android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
    },
    ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
    },
    web: {
        mimeType: 'audio/webm',
        bitsPerSecond: 128000,
    },
};

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

    // Refs
    const recordingRef = useRef<Audio.Recording | null>(null);
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
            const { status } = await Audio.requestPermissionsAsync();
            const granted = status === 'granted';
            setHasPermission(granted);

            if (!granted) {
                setError('Permission microphone refusée');
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
            const { status } = await Audio.getPermissionsAsync();
            setHasPermission(status === 'granted');
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

        meteringIntervalRef.current = setInterval(async () => {
            if (recordingRef.current) {
                try {
                    const status = await recordingRef.current.getStatusAsync();

                    if (status.isRecording && status.metering !== undefined) {
                        // Convertir les dB en valeur normalisée (0-1)
                        // Les valeurs de metering sont généralement entre -160 et 0 dB
                        // On normalise pour avoir une réponse plus sensible
                        const db = status.metering;
                        const minDb = -60; // Seuil minimum considéré
                        const maxDb = 0;   // Maximum

                        // Normaliser entre 0 et 1
                        let normalizedLevel = (db - minDb) / (maxDb - minDb);
                        normalizedLevel = Math.max(0, Math.min(1, normalizedLevel));

                        // Appliquer une courbe pour plus de sensibilité aux voix normales
                        normalizedLevel = Math.pow(normalizedLevel, 0.7);

                        // Lissage exponentiel pour éviter les saccades
                        smoothedLevelRef.current =
                            smoothedLevelRef.current * (1 - SMOOTHING_FACTOR) +
                            normalizedLevel * SMOOTHING_FACTOR;

                        setAudioLevel(smoothedLevelRef.current);
                    }
                } catch (err) {
                    // Ignorer les erreurs de status pendant l'arrêt
                    console.debug('[useAudioRecording] Metering error:', err);
                }
            }
        }, METERING_INTERVAL);
    }, []);

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
        try {
            setError(null);
            console.log('[useAudioRecording] Starting recording...');

            // Vérifier/demander les permissions
            if (!hasPermission) {
                const granted = await requestPermission();
                if (!granted) return;
            }

            // Configurer le mode audio
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Créer et démarrer l'enregistrement
            const { recording } = await Audio.Recording.createAsync(
                AUDIO_RECORDING_OPTIONS,
                undefined,
                METERING_INTERVAL
            );

            recordingRef.current = recording;
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
        }
    }, [hasPermission, requestPermission, startMetering, startDurationTracking]);

    const stopRecording = useCallback(async (): Promise<string | null> => {
        try {
            console.log('[useAudioRecording] Stopping recording...');

            // Arrêter le monitoring
            stopMetering();
            stopDurationTracking();

            if (!recordingRef.current) {
                console.warn('[useAudioRecording] No recording to stop');
                return null;
            }

            // Arrêter et décharger l'enregistrement
            await recordingRef.current.stopAndUnloadAsync();

            // Récupérer l'URI
            const uri = recordingRef.current.getURI();
            recordingRef.current = null;

            // Réinitialiser le mode audio
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
            });

            console.log('[useAudioRecording] Recording stopped, URI:', uri);

            setAudioUri(uri);
            setRecordingState('idle');

            return uri;
        } catch (err) {
            console.error('[useAudioRecording] Stop error:', err);
            setError('Erreur lors de l\'arrêt de l\'enregistrement');
            setRecordingState('idle');
            return null;
        }
    }, [stopMetering, stopDurationTracking]);

    const toggleRecording = useCallback(async () => {
        if (isRecording) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }, [isRecording, startRecording, stopRecording]);

    const reset = useCallback(() => {
        stopMetering();
        stopDurationTracking();
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

            // Arrêter l'enregistrement si en cours
            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync().catch(console.error);
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
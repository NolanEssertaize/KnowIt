/**
 * @file useAudioRecording.ts
 * @description Hook pour gérer l'enregistrement audio avec analyse d'intensité
 * Version corrigée avec metering fonctionnel via expo-av
 *
 * IMPORTANT: expo-audio (nouvelle API) a des problèmes avec currentMetering
 * On utilise expo-av qui fonctionne mieux pour le metering en temps réel
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Audio } from 'expo-av';
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

/**
 * Options d'enregistrement avec metering activé
 * CRITIQUE: isMeteringEnabled doit être à true pour avoir les niveaux audio
 */
const AUDIO_RECORDING_OPTIONS: Audio.RecordingOptions = {
    isMeteringEnabled: true, // ⚠️ OBLIGATOIRE pour le niveau audio
    android: {
        extension: '.m4a',
        outputFormat: Audio.AndroidOutputFormat.MPEG_4,
        audioEncoder: Audio.AndroidAudioEncoder.AAC,
        sampleRate: 44100,
        numberOfChannels: 1, // Mono pour meilleure détection vocale
        bitRate: 128000,
    },
    ios: {
        extension: '.m4a',
        outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
        audioQuality: Audio.IOSAudioQuality.HIGH,
        sampleRate: 44100,
        numberOfChannels: 1, // Mono pour meilleure détection vocale
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

// Intervalle de mise à jour du niveau audio (ms) - 50ms = 20 updates/sec
const METERING_INTERVAL = 50;

// Lissage exponentiel pour le niveau audio (0.3 = réactif, 0.1 = lisse)
const SMOOTHING_FACTOR = 0.4;

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useAudioRecording(): UseAudioRecordingReturn {
    // ─────────────────────────────────────────────────────────────────────────
    // ÉTATS
    // ─────────────────────────────────────────────────────────────────────────
    const [recordingState, setRecordingState] = useState<RecordingState>('idle');
    const [audioLevel, setAudioLevel] = useState(0);
    const [audioUri, setAudioUri] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [hasPermission, setHasPermission] = useState(false);
    const [duration, setDuration] = useState(0);

    // ─────────────────────────────────────────────────────────────────────────
    // REFS
    // ─────────────────────────────────────────────────────────────────────────
    const recordingRef = useRef<Audio.Recording | null>(null);
    const meteringIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const smoothedLevelRef = useRef(0);
    const startTimeRef = useRef<number>(0);
    const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isRecordingRef = useRef(false); // Pour éviter les problèmes de closure

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
                const { status } = await Audio.getPermissionsAsync();
                setHasPermission(status === 'granted');
            } catch (err) {
                console.error('[useAudioRecording] Check permission error:', err);
            }
        };
        checkPermission();
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // METERING (Niveau audio) - VERSION CORRIGÉE
    // ─────────────────────────────────────────────────────────────────────────

    const startMetering = useCallback(() => {
        console.log('[useAudioRecording] Starting metering...');

        // Nettoyer l'intervalle existant
        if (meteringIntervalRef.current) {
            clearInterval(meteringIntervalRef.current);
        }

        // Reset le niveau lissé
        smoothedLevelRef.current = 0;

        meteringIntervalRef.current = setInterval(async () => {
            // Utiliser la ref pour vérifier l'état
            if (!isRecordingRef.current || !recordingRef.current) {
                return;
            }

            try {
                const status = await recordingRef.current.getStatusAsync();

                // Debug: afficher le status complet
                // console.log('[useAudioRecording] Status:', JSON.stringify(status));

                if (status.isRecording && status.metering !== undefined && status.metering !== null) {
                    // Convertir les dB en valeur normalisée (0-1)
                    // Les valeurs de metering sont généralement entre -160 et 0 dB
                    // -60dB = très silencieux, 0dB = maximum
                    const db = status.metering;
                    const minDb = -50; // Seuil minimum (ajusté pour être plus sensible)
                    const maxDb = -5;  // Maximum pratique (la voix normale atteint rarement 0dB)

                    // Normaliser entre 0 et 1
                    let normalizedLevel = (db - minDb) / (maxDb - minDb);
                    normalizedLevel = Math.max(0, Math.min(1, normalizedLevel));

                    // Appliquer une courbe pour plus de sensibilité aux voix normales
                    // Exposant < 1 = plus sensible aux niveaux bas
                    normalizedLevel = Math.pow(normalizedLevel, 0.6);

                    // Lissage exponentiel pour éviter les saccades
                    smoothedLevelRef.current =
                        smoothedLevelRef.current * (1 - SMOOTHING_FACTOR) +
                        normalizedLevel * SMOOTHING_FACTOR;

                    setAudioLevel(smoothedLevelRef.current);

                    // Debug log occasionnel
                    // console.log(`[useAudioRecording] Level: ${db.toFixed(1)}dB -> ${(smoothedLevelRef.current * 100).toFixed(0)}%`);
                } else {
                    console.log('[useAudioRecording] No metering data available, status.metering:', status.metering);
                }
            } catch (err) {
                // Ignorer les erreurs silencieusement pendant l'enregistrement
                // (peut arriver pendant l'arrêt)
                console.debug('[useAudioRecording] Metering error (ignoré):', err);
            }
        }, METERING_INTERVAL);
    }, []);

    const stopMetering = useCallback(() => {
        console.log('[useAudioRecording] Stopping metering...');
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
        // Protection contre les appels multiples
        if (isRecordingRef.current) {
            console.log('[useAudioRecording] Already recording, ignoring start');
            return;
        }

        try {
            setError(null);
            console.log('[useAudioRecording] Starting recording...');

            // Vérifier/demander les permissions
            if (!hasPermission) {
                const granted = await requestPermission();
                if (!granted) return;
            }

            // Configurer le mode audio (OBLIGATOIRE sur iOS)
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
            });

            // Créer et démarrer l'enregistrement avec les bonnes options
            // Le 3ème paramètre est l'intervalle de mise à jour du status en ms
            const { recording } = await Audio.Recording.createAsync(
                AUDIO_RECORDING_OPTIONS,
                undefined, // onRecordingStatusUpdate - on utilise notre propre polling
                METERING_INTERVAL // progressUpdateIntervalMillis
            );

            recordingRef.current = recording;
            isRecordingRef.current = true;
            setRecordingState('recording');
            setAudioUri(null);

            // Démarrer le monitoring du niveau audio
            startMetering();
            startDurationTracking();

            console.log('[useAudioRecording] Recording started successfully');
        } catch (err) {
            console.error('[useAudioRecording] Start error:', err);
            setError("Erreur lors du démarrage de l'enregistrement");
            setRecordingState('idle');
            isRecordingRef.current = false;
        }
    }, [hasPermission, requestPermission, startMetering, startDurationTracking]);

    const stopRecording = useCallback(async (): Promise<string | null> => {
        if (!isRecordingRef.current) {
            console.log('[useAudioRecording] Not recording, ignoring stop');
            return null;
        }

        try {
            console.log('[useAudioRecording] Stopping recording...');

            // Marquer comme arrêté immédiatement pour éviter les lectures de status
            isRecordingRef.current = false;

            // Arrêter le monitoring
            stopMetering();
            stopDurationTracking();

            if (!recordingRef.current) {
                console.warn('[useAudioRecording] No recording to stop');
                setRecordingState('idle');
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
            setError("Erreur lors de l'arrêt de l'enregistrement");
            setRecordingState('idle');
            isRecordingRef.current = false;
            return null;
        }
    }, [stopMetering, stopDurationTracking]);

    const toggleRecording = useCallback(async () => {
        if (isRecordingRef.current) {
            await stopRecording();
        } else {
            await startRecording();
        }
    }, [startRecording, stopRecording]);

    const reset = useCallback(() => {
        stopMetering();
        stopDurationTracking();

        if (recordingRef.current) {
            recordingRef.current.stopAndUnloadAsync().catch(() => {});
            recordingRef.current = null;
        }

        isRecordingRef.current = false;
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
            console.log('[useAudioRecording] Cleanup on unmount');
            stopMetering();
            stopDurationTracking();

            if (recordingRef.current) {
                recordingRef.current.stopAndUnloadAsync().catch(() => {});
            }
        };
    }, [stopMetering, stopDurationTracking]);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        recordingState,
        audioLevel,
        isRecording,
        isAnalyzing,
        audioUri,
        error,
        hasPermission,
        duration,
        startRecording,
        stopRecording,
        toggleRecording,
        requestPermission,
        reset,
    };
}

export default useAudioRecording;
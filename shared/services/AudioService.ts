/**
 * @file AudioService.ts
 * @description Service class d'enregistrement audio
 *
 * MIGRATION: expo-av → expo-audio
 * expo-av est déprécié et sera retiré dans SDK 54
 */

import {
    AudioModule,
    AudioRecorder,
    RecordingPresets,
    type RecordingOptions,
} from 'expo-audio';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

const RECORDING_OPTIONS: RecordingOptions = {
    ...RecordingPresets.HIGH_QUALITY,
    extension: '.m4a',
    isMeteringEnabled: true,
};

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE CLASS
// ═══════════════════════════════════════════════════════════════════════════

export class AudioService {
    private recorder: AudioRecorder | null = null;

    /**
     * Demande les permissions d'enregistrement
     */
    async requestPermissions(): Promise<boolean> {
        try {
            const status = await AudioModule.requestRecordingPermissionsAsync();
            return status.granted;
        } catch (err) {
            console.error('[AudioService] Permission error:', err);
            return false;
        }
    }

    /**
     * Vérifie si les permissions sont accordées
     */
    async hasPermissions(): Promise<boolean> {
        try {
            const status = await AudioModule.getRecordingPermissionsAsync();
            return status.granted;
        } catch (err) {
            console.error('[AudioService] Check permission error:', err);
            return false;
        }
    }

    /**
     * Démarre l'enregistrement audio
     */
    async startRecording(): Promise<void> {
        try {
            // Configurer le mode audio pour iOS
            await AudioModule.setAudioModeAsync({
                allowsRecording: true,
                playsInSilentMode: true,
            });

            // Créer et démarrer l'enregistrement
            this.recorder = new AudioRecorder(RECORDING_OPTIONS);
            await this.recorder.prepareToRecordAsync();
            this.recorder.record();

            console.log('[AudioService] Recording started');
        } catch (err) {
            console.error('[AudioService] Failed to start recording:', err);
            this.recorder = null;
            throw err;
        }
    }

    /**
     * Arrête l'enregistrement et retourne l'URI du fichier
     */
    async stopRecording(): Promise<string | null> {
        if (!this.recorder) {
            console.warn('[AudioService] No recording in progress');
            return null;
        }

        try {
            // Arrêter et récupérer l'URI
            const uri = await this.recorder.stop();
            this.recorder = null;

            // Réinitialiser le mode audio
            await AudioModule.setAudioModeAsync({
                allowsRecording: false,
                playsInSilentMode: true,
            });

            console.log('[AudioService] Recording stopped, URI:', uri);
            return uri;
        } catch (err) {
            console.error('[AudioService] Failed to stop recording:', err);
            this.recorder = null;
            throw err;
        }
    }

    /**
     * Annule l'enregistrement en cours
     */
    async cancelRecording(): Promise<void> {
        if (this.recorder) {
            try {
                await this.recorder.stop();
            } catch (err) {
                // Ignorer les erreurs de stop
            }
            this.recorder = null;
        }

        await AudioModule.setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: true,
        });
    }

    /**
     * Vérifie si un enregistrement est en cours
     */
    isRecording(): boolean {
        return this.recorder !== null && this.recorder.isRecording;
    }

    /**
     * Récupère le niveau audio actuel (metering) en dB
     */
    getCurrentMetering(): number | null {
        if (!this.recorder) return null;
        return this.recorder.currentMetering ?? null;
    }

    /**
     * Récupère la durée actuelle en millisecondes
     */
    getCurrentTime(): number {
        if (!this.recorder) return 0;
        return this.recorder.currentTime ?? 0;
    }
}
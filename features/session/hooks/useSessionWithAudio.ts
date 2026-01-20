/**
 * @file useSessionWithAudio.ts
 * @description Session Recording Hook - Handles audio recording and AI analysis
 * 
 * Pattern: MVVM - This hook serves as the ViewModel for SessionScreen
 * 
 * Flow:
 * 1. User starts recording → useAudioRecording
 * 2. User stops recording → Get audio URI
 * 3. Audio sent to API → Transcription (Whisper)
 * 4. Transcription analyzed → Analysis (GPT-4)
 * 5. Session saved and displayed
 */

import { useState, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';
import { LLMService } from '@/shared/services';
import { useStore } from '@/store';
import { ApiException } from '@/shared/api';
import type { Session } from '@/store';
import type { AnalysisResult } from '@/shared/api';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type RecordingState = 'idle' | 'recording' | 'analyzing' | 'complete' | 'error';

interface SessionResult {
  transcription: string;
  analysis: AnalysisResult;
  sessionId?: string;
}

interface UseSessionWithAudioReturn {
  // State
  recordingState: RecordingState;
  isRecording: boolean;
  isAnalyzing: boolean;
  error: string | null;
  result: SessionResult | null;
  duration: number;
  
  // Actions
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  cancelRecording: () => Promise<void>;
  processRecording: (topicId: string, topicTitle: string) => Promise<SessionResult | null>;
  reset: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// RECORDING CONFIG
// ═══════════════════════════════════════════════════════════════════════════

const RECORDING_OPTIONS: Audio.RecordingOptions = {
  android: {
    extension: '.m4a',
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  ios: {
    extension: '.m4a',
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.HIGH,
    sampleRate: 44100,
    numberOfChannels: 1,
    bitRate: 128000,
  },
  web: {
    mimeType: 'audio/webm',
    bitsPerSecond: 128000,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useSessionWithAudio(): UseSessionWithAudioReturn {
  // State
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SessionResult | null>(null);
  const [duration, setDuration] = useState(0);

  // Refs
  const recordingRef = useRef<Audio.Recording | null>(null);
  const audioUriRef = useRef<string | null>(null);
  const durationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Store
  const { addSessionToTopic } = useStore();

  // Derived state
  const isRecording = recordingState === 'recording';
  const isAnalyzing = recordingState === 'analyzing';

  /**
   * Request audio permissions
   */
  const requestPermissions = async (): Promise<boolean> => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        setError('Microphone permission is required');
        return false;
      }
      return true;
    } catch (err) {
      console.error('[useSessionWithAudio] Permission error:', err);
      setError('Failed to request microphone permission');
      return false;
    }
  };

  /**
   * Start audio recording
   */
  const startRecording = useCallback(async () => {
    console.log('[useSessionWithAudio] Starting recording...');
    setError(null);
    setResult(null);

    // Check permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Create and start recording
      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(RECORDING_OPTIONS);
      await recording.startAsync();

      recordingRef.current = recording;
      setRecordingState('recording');
      setDuration(0);

      // Start duration timer
      durationIntervalRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      console.log('[useSessionWithAudio] Recording started');
    } catch (err) {
      console.error('[useSessionWithAudio] Start recording error:', err);
      setError('Failed to start recording');
      setRecordingState('error');
    }
  }, []);

  /**
   * Stop audio recording
   */
  const stopRecording = useCallback(async () => {
    console.log('[useSessionWithAudio] Stopping recording...');

    // Clear duration timer
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (!recordingRef.current) {
      console.warn('[useSessionWithAudio] No active recording');
      return;
    }

    try {
      await recordingRef.current.stopAndUnloadAsync();
      
      // Reset audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
      });

      const uri = recordingRef.current.getURI();
      audioUriRef.current = uri;
      recordingRef.current = null;

      console.log('[useSessionWithAudio] Recording stopped, URI:', uri);
      setRecordingState('idle');
    } catch (err) {
      console.error('[useSessionWithAudio] Stop recording error:', err);
      setError('Failed to stop recording');
      setRecordingState('error');
    }
  }, []);

  /**
   * Cancel recording without saving
   */
  const cancelRecording = useCallback(async () => {
    console.log('[useSessionWithAudio] Cancelling recording...');

    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    if (recordingRef.current) {
      try {
        await recordingRef.current.stopAndUnloadAsync();
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
        });
      } catch (err) {
        console.error('[useSessionWithAudio] Cancel error:', err);
      }
      recordingRef.current = null;
    }

    audioUriRef.current = null;
    setRecordingState('idle');
    setDuration(0);
    setError(null);
  }, []);

  /**
   * Process recorded audio (transcribe + analyze)
   */
  const processRecording = useCallback(async (
    topicId: string,
    topicTitle: string,
  ): Promise<SessionResult | null> => {
    const uri = audioUriRef.current;

    if (!uri) {
      setError('No recording to process');
      return null;
    }

    console.log('[useSessionWithAudio] Processing recording for topic:', topicTitle);
    setRecordingState('analyzing');
    setError(null);

    try {
      // Call API - Transcribe + Analyze
      const { transcription, analysis } = await LLMService.processRecording(
        uri,
        topicTitle,
        { topicId },
      );

      // Create session object for local state
      const newSession: Session = {
        id: `session-${Date.now()}`, // Server will provide real ID
        date: new Date().toISOString(),
        audioUri: uri,
        transcription,
        analysis,
      };

      // Update store
      addSessionToTopic(topicId, newSession);

      const sessionResult: SessionResult = {
        transcription,
        analysis,
      };

      setResult(sessionResult);
      setRecordingState('complete');

      console.log('[useSessionWithAudio] Processing complete');
      return sessionResult;
    } catch (err) {
      console.error('[useSessionWithAudio] Processing error:', err);
      
      const message = err instanceof ApiException
        ? err.message
        : 'Failed to process recording';
      
      setError(message);
      setRecordingState('error');
      return null;
    }
  }, [addSessionToTopic]);

  /**
   * Reset all state
   */
  const reset = useCallback(() => {
    if (durationIntervalRef.current) {
      clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }

    recordingRef.current = null;
    audioUriRef.current = null;
    
    setRecordingState('idle');
    setError(null);
    setResult(null);
    setDuration(0);
  }, []);

  return {
    // State
    recordingState,
    isRecording,
    isAnalyzing,
    error,
    result,
    duration,

    // Actions
    startRecording,
    stopRecording,
    cancelRecording,
    processRecording,
    reset,
  };
}

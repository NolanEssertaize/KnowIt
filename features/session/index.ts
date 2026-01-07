/**
 * @file index.ts
 * @description Export de la feature Session avec enregistrement audio
 */

// Screens
export { SessionScreen } from './screens/SessionScreen';

// Components
export { VoiceRecordButton } from './components/VoiceRecordButton';

// Hooks
export { useSession } from './hooks/useSession';
export { useSessionWithAudio } from './hooks/useSessionWithAudio';
export { useAudioRecording } from './hooks/useAudioRecording';

// Services
export { RecordingService } from './services/RecordingService';
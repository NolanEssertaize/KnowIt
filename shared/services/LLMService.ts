/**
 * @file LLMService.ts
 * @description AI Service - NO expo-file-system dependency
 */

import { api, API_ENDPOINTS, uploadFile } from '@/shared/api';
import type {
    TranscriptionResponse,
    AnalysisRequest,
    AnalysisResponse,
    AnalysisResult,
    SessionRead,
} from '@/shared/api';

interface TranscriptionOptions {
    language?: string;
}

interface AnalysisOptions {
    topicId?: string;
}

export const LLMService = {
    async transcribeAudio(
        uri: string,
        options?: TranscriptionOptions,
    ): Promise<string> {
        console.log(`[LLMService] Transcribing: ${uri}`);

        const fileExtension = uri.split('.').pop()?.toLowerCase() || 'm4a';
        const mimeTypes: Record<string, string> = {
            m4a: 'audio/m4a',
            mp3: 'audio/mpeg',
            mp4: 'audio/mp4',
            wav: 'audio/wav',
            webm: 'audio/webm',
        };
        const mimeType = mimeTypes[fileExtension] || 'audio/m4a';

        const formData = new FormData();
        formData.append('file', {
            uri,
            type: mimeType,
            name: `recording.${fileExtension}`,
        } as unknown as Blob);

        if (options?.language) {
            formData.append('language', options.language);
        }

        const response = await uploadFile<TranscriptionResponse>(
            API_ENDPOINTS.TRANSCRIPTION,
            formData,
        );

        console.log(`[LLMService] ✅ Transcription: ${response.text.length} chars`);
        return response.text;
    },

    async analyzeText(
        text: string,
        topicTitle: string,
        options?: AnalysisOptions,
    ): Promise<AnalysisResult> {
        console.log(`[LLMService] Analyzing for topic: ${topicTitle}`);

        const response = await api.post<AnalysisResponse>(
            API_ENDPOINTS.ANALYSIS.ANALYZE,
            {
                text,
                topic_title: topicTitle,
                topic_id: options?.topicId || null,
            },
        );

        console.log(`[LLMService] ✅ Analysis complete`);
        return response.analysis;
    },

    async processRecording(
        uri: string,
        topicTitle: string,
        options?: { topicId?: string; language?: string },
    ): Promise<{ transcription: string; analysis: AnalysisResult }> {
        console.log(`[LLMService] 🎯 Processing recording...`);

        const transcription = await this.transcribeAudio(uri, {
            language: options?.language,
        });

        const analysis = await this.analyzeText(transcription, topicTitle, {
            topicId: options?.topicId,
        });

        console.log(`[LLMService] ✅ Done`);
        return { transcription, analysis };
    },

    async getSession(sessionId: string): Promise<SessionRead> {
        return api.get<SessionRead>(API_ENDPOINTS.ANALYSIS.SESSION(sessionId));
    },
} as const;

export type { AnalysisResult, TranscriptionResponse, SessionRead } from '@/shared/api';
/**
 * Recording Session Screen
 * Écran d'enregistrement vocal - Design Glassmorphism
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useStore } from '../../store/useStore';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassView } from '@/components/GlassView';
import { RecordButton } from '@/components/GlassButton';
import { GlassColors, BorderRadius, Spacing, Shadows } from '@/constants/theme';

export default function Session() {
    const { topicId } = useLocalSearchParams();
    const router = useRouter();
    const topic = useStore((state) =>
        state.topics.find((t) => t.id === topicId)
    );

    const [isRecording, setIsRecording] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const toggleRecording = async () => {
        if (isRecording) {
            // Arrêter l'enregistrement et analyser
            setIsRecording(false);
            setIsAnalyzing(true);

            // Simulation de l'analyse IA
            setTimeout(() => {
                router.replace({
                    pathname: `/${topicId}/result`,
                    params: {
                        valid: JSON.stringify([
                            'Point clé 1 correctement énoncé',
                            'Bonne compréhension du concept',
                        ]),
                        corrections: JSON.stringify([
                            'Préciser davantage ce point',
                        ]),
                        missing: JSON.stringify([
                            'Concept important non mentionné',
                        ]),
                    },
                });
            }, 2000);
        } else {
            setIsRecording(true);
        }
    };

    if (!topic) {
        return (
            <ScreenWrapper centered>
                <Text style={styles.errorText}>Topic introuvable</Text>
            </ScreenWrapper>
        );
    }

    return (
        <ScreenWrapper centered padding={Spacing.xl}>
            {/* Header avec titre du sujet */}
            <GlassView
                variant="accent"
                glow
                glowColor={GlassColors.accent.glow}
                style={styles.topicBanner}
            >
                <Text style={styles.topicLabel}>SUJET</Text>
                <Text style={styles.topicTitle}>{topic.title}</Text>
            </GlassView>

            {/* Zone principale */}
            <View style={styles.mainContent}>
                {isAnalyzing ? (
                    <View style={styles.analyzingContainer}>
                        <GlassView style={styles.loaderCard}>
                            <View style={styles.pulseContainer}>
                                <ActivityIndicator size="large" color={GlassColors.accent.primary} />
                            </View>
                            <Text style={styles.analyzingTitle}>Analyse IA en cours...</Text>
                            <Text style={styles.analyzingSubtitle}>
                                Évaluation de vos connaissances
                            </Text>
                        </GlassView>
                    </View>
                ) : (
                    <View style={styles.recordingContainer}>
                        {/* Indicateur d'état */}
                        <View style={styles.statusContainer}>
                            {isRecording && (
                                <View style={styles.recordingIndicator}>
                                    <View style={styles.recordingDot} />
                                    <Text style={styles.recordingText}>Enregistrement...</Text>
                                </View>
                            )}
                            {!isRecording && (
                                <Text style={styles.instructionText}>
                                    Appuyez pour commencer à parler
                                </Text>
                            )}
                        </View>

                        {/* Bouton d'enregistrement */}
                        <RecordButton
                            isRecording={isRecording}
                            onPress={toggleRecording}
                            size={160}
                        />

                        {/* Instructions */}
                        <GlassView style={styles.tipsCard}>
                            <Text style={styles.tipsTitle}>💡 Conseil</Text>
                            <Text style={styles.tipsText}>
                                Expliquez le sujet comme si vous l'enseigniez à quelqu'un.
                                L'IA analysera vos connaissances.
                            </Text>
                        </GlassView>
                    </View>
                )}
            </View>

            {/* Bouton fermer */}
            <TouchableOpacity
                style={styles.closeButton}
                onPress={() => router.back()}
                activeOpacity={0.7}
            >
                <GlassView style={styles.closeButtonInner}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </GlassView>
            </TouchableOpacity>
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    topicBanner: {
        padding: Spacing.lg,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        marginBottom: Spacing.xxl,
        width: '100%',
        maxWidth: 320,
    },
    topicLabel: {
        color: GlassColors.accent.primary,
        fontSize: 12,
        fontWeight: '600',
        letterSpacing: 2,
        marginBottom: Spacing.xs,
    },
    topicTitle: {
        color: GlassColors.text.primary,
        fontSize: 24,
        fontWeight: '700',
        textAlign: 'center',
    },
    mainContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    recordingContainer: {
        alignItems: 'center',
        width: '100%',
    },
    statusContainer: {
        height: 40,
        justifyContent: 'center',
        marginBottom: Spacing.xl,
    },
    recordingIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    recordingDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: GlassColors.semantic.error,
        marginRight: Spacing.sm,
        ...Shadows.glow(GlassColors.semantic.error),
    },
    recordingText: {
        color: GlassColors.semantic.error,
        fontSize: 16,
        fontWeight: '600',
    },
    instructionText: {
        color: GlassColors.text.secondary,
        fontSize: 16,
    },
    tipsCard: {
        marginTop: Spacing.xxl,
        padding: Spacing.lg,
        borderRadius: BorderRadius.lg,
        maxWidth: 300,
    },
    tipsTitle: {
        color: GlassColors.text.primary,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: Spacing.sm,
    },
    tipsText: {
        color: GlassColors.text.secondary,
        fontSize: 14,
        lineHeight: 20,
        textAlign: 'center',
    },
    analyzingContainer: {
        alignItems: 'center',
    },
    loaderCard: {
        padding: Spacing.xxl,
        borderRadius: BorderRadius.xl,
        alignItems: 'center',
        minWidth: 250,
    },
    pulseContainer: {
        marginBottom: Spacing.lg,
    },
    analyzingTitle: {
        color: GlassColors.text.primary,
        fontSize: 20,
        fontWeight: '600',
        marginBottom: Spacing.xs,
    },
    analyzingSubtitle: {
        color: GlassColors.text.secondary,
        fontSize: 14,
    },
    closeButton: {
        position: 'absolute',
        top: Spacing.xxl,
        right: Spacing.lg,
    },
    closeButtonInner: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        color: GlassColors.text.secondary,
        fontSize: 18,
        fontWeight: '600',
    },
    errorText: {
        color: GlassColors.text.secondary,
        fontSize: 16,
    },
});
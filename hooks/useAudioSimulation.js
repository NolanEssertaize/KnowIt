import { useEffect } from 'react';
import { useSharedValue, withRepeat, withTiming, withSequence, Easing } from 'react-native-reanimated';

/**
 * Simule un volume audio (entre 0 et 1) qui semble naturel.
 * Combine une "respiration" de base avec des pics aléatoires (la "voix").
 */
export const useAudioSimulation = () => {
    // La valeur partagée qui pilotera Skia (entre 0.0 et 1.0)
    const audioLevel = useSharedValue(0.1);

    useEffect(() => {
        const simulateVoice = () => {
            // 1. Base: une respiration lente et continue
            const baseBreathing = withRepeat(
                withSequence(
                    withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
                    withTiming(0.1, { duration: 1500, easing: Easing.inOut(Easing.quad) })
                ),
                -1, true
            );

            // 2. Pics: des sursauts aléatoires pour simuler la parole
            // On utilise un intervalle pour injecter du "bruit"
            const interval = setInterval(() => {
                // On injecte un pic aléatoire de temps en temps
                const isSpeaking = Math.random() > 0.6;
                const targetLevel = isSpeaking ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3;

                audioLevel.value = withTiming(targetLevel, {
                    duration: isSpeaking ? 150 : 400, // Montée rapide, descente lente
                    easing: Easing.linear
                });

            }, 300); // Mise à jour toutes les 300ms

            // Note: Dans cette simulation simplifiée, on écrase la respiration de base par l'intervalle.
            // Pour un effet plus complexe, on pourrait additionner deux sharedValues.
            // Pour ce POC, l'intervalle suffit à donner vie.

            return () => clearInterval(interval);
        };

        const cleanup = simulateVoice();
        return cleanup;
    }, []);

    return audioLevel;
};
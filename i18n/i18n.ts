/**
 * @file i18n.ts
 * @description Internationalization configuration using i18next + react-i18next
 *
 * FIXED VERSION - Proper initialization and type safety
 *
 * Setup:
 * 1. npm install i18next react-i18next @react-native-async-storage/async-storage
 * 2. Import this file in your root _layout.tsx: import '@/i18n';
 *
 * Usage:
 * import { useTranslation } from 'react-i18next';
 * const { t } = useTranslation();
 * <Text>{t('common.loading')}</Text>
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import translations
import fr from './locales/fr.json';
import en from './locales/en.json';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const LANGUAGE_STORAGE_KEY = '@knowit_language';
export const DEFAULT_LANGUAGE = 'fr';
export const SUPPORTED_LANGUAGES = ['fr', 'en'] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

// ═══════════════════════════════════════════════════════════════════════════
// LANGUAGE DETECTOR PLUGIN
// Custom plugin to detect and persist language preference
// ═══════════════════════════════════════════════════════════════════════════

const languageDetectorPlugin = {
    type: 'languageDetector' as const,
    async: true,
    init: () => {
        // No initialization needed
    },
    detect: async (callback: (lng: string) => void) => {
        try {
            const savedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);

            if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
                console.log('[i18n] Loaded saved language:', savedLanguage);
                callback(savedLanguage);
                return;
            }
        } catch (error) {
            console.warn('[i18n] Error reading language from storage:', error);
        }

        console.log('[i18n] Using default language:', DEFAULT_LANGUAGE);
        callback(DEFAULT_LANGUAGE);
    },
    cacheUserLanguage: async (language: string) => {
        try {
            await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
            console.log('[i18n] Saved language:', language);
        } catch (error) {
            console.warn('[i18n] Error saving language to storage:', error);
        }
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// RESOURCES
// Define all translation resources
// ═══════════════════════════════════════════════════════════════════════════

const resources = {
    fr: { translation: fr },
    en: { translation: en },
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// Configure and initialize i18next
// ═══════════════════════════════════════════════════════════════════════════

i18n
    .use(languageDetectorPlugin)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: DEFAULT_LANGUAGE,

        // Required for React Native - fixes plural rules
        compatibilityJSON: 'v4',

        interpolation: {
            // React already escapes values, so we don't need to escape again
            escapeValue: false,
        },

        react: {
            // Disable suspense for React Native compatibility
            // Suspense doesn't work well with React Native
            useSuspense: false,
        },

        // Pluralization separator (e.g., key_one, key_other)
        pluralSeparator: '_',

        // Enable debug logging in development
        debug: __DEV__,

        // Return key if translation is missing (helps identify missing translations)
        returnNull: false,
        returnEmptyString: false,
    });

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Change the current language
 * @param language - Language code ('fr' | 'en')
 */
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
    if (!SUPPORTED_LANGUAGES.includes(language)) {
        console.warn(`[i18n] Unsupported language: ${language}`);
        return;
    }

    try {
        await i18n.changeLanguage(language);
        await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
        console.log('[i18n] Language changed to:', language);
    } catch (error) {
        console.error('[i18n] Error changing language:', error);
    }
};

/**
 * Get the current language
 * @returns Current language code
 */
export const getCurrentLanguage = (): SupportedLanguage => {
    const lang = i18n.language;

    if (SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
        return lang as SupportedLanguage;
    }

    return DEFAULT_LANGUAGE;
};

/**
 * Check if a language is supported
 * @param lang - Language code to check
 */
export const isLanguageSupported = (lang: string): lang is SupportedLanguage => {
    return SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage);
};

/**
 * Get language display info
 * @param code - Language code
 */
export const getLanguageInfo = (code: SupportedLanguage) => {
    const info: Record<SupportedLanguage, { label: string; nativeLabel: string; flag: string }> = {
        fr: { label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
        en: { label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
    };
    return info[code];
};

/**
 * Get all supported languages with their info
 */
export const getAllLanguages = () => {
    return SUPPORTED_LANGUAGES.map((code) => ({
        code,
        ...getLanguageInfo(code),
    }));
};

export default i18n;
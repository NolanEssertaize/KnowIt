/**
 * @file i18n.ts
 * @description Internationalization configuration using i18next + react-i18next
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
// LANGUAGE DETECTOR
// ═══════════════════════════════════════════════════════════════════════════

const languageDetectorPlugin = {
    type: 'languageDetector' as const,
    async: true,
    init: () => {},
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
// ═══════════════════════════════════════════════════════════════════════════

const resources = {
    fr: { translation: fr },
    en: { translation: en },
};

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

i18n
    .use(languageDetectorPlugin)
    .use(initReactI18next)
    .init({
        resources,
        fallbackLng: DEFAULT_LANGUAGE,
        compatibilityJSON: 'v4', // Required for React Native

        interpolation: {
            escapeValue: false, // React already escapes by default
        },

        react: {
            useSuspense: false, // Disable suspense for React Native compatibility
        },

        // Pluralization
        pluralSeparator: '_',

        // Debug in development
        debug: __DEV__,
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
    await i18n.changeLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
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
 */
export const getLanguageInfo = (code: SupportedLanguage) => {
    const info: Record<SupportedLanguage, { label: string; nativeLabel: string; flag: string }> = {
        fr: { label: 'French', nativeLabel: 'Français', flag: '🇫🇷' },
        en: { label: 'English', nativeLabel: 'English', flag: '🇬🇧' },
    };
    return info[code];
};

export default i18n;
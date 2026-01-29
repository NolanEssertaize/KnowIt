/**
 * @file useLanguage.ts
 * @description Custom hook for language management with persistence
 *
 * Features:
 * - Current language state
 * - Language switching with AsyncStorage persistence
 * - Time-based greeting
 * - Date/number formatting utilities
 *
 * Usage:
 * const { language, setLanguage, t, greeting } = useLanguage();
 */

import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    changeLanguage,
    getCurrentLanguage,
    getLanguageInfo,
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from './i18n';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface LanguageOption {
    code: SupportedLanguage;
    label: string;
    nativeLabel: string;
    flag: string;
}

export interface UseLanguageReturn {
    /** Current language code ('fr' | 'en') */
    language: SupportedLanguage;

    /** Change the current language */
    setLanguage: (lang: SupportedLanguage) => Promise<void>;

    /** List of supported languages with labels */
    languages: LanguageOption[];

    /** Get time-based greeting */
    greeting: string;

    /** Translation function */
    t: (key: string, options?: Record<string, unknown>) => string;

    /** Check if current language is French */
    isFrench: boolean;

    /** Check if current language is English */
    isEnglish: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const LANGUAGE_OPTIONS: LanguageOption[] = SUPPORTED_LANGUAGES.map((code) => ({
    code,
    ...getLanguageInfo(code),
}));

// ═══════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Get time-based greeting key based on current hour
 */
function getGreetingKey(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();

    if (hour >= 5 && hour < 12) {
        return 'morning';
    } else if (hour >= 12 && hour < 18) {
        return 'afternoon';
    } else {
        return 'evening';
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useLanguage(): UseLanguageReturn {
    const { t, i18n } = useTranslation();

    // Current language (with fallback)
    const language = useMemo((): SupportedLanguage => {
        return getCurrentLanguage();
    }, [i18n.language]);

    // Change language handler
    const setLanguage = useCallback(async (lang: SupportedLanguage) => {
        if (SUPPORTED_LANGUAGES.includes(lang)) {
            await changeLanguage(lang);
        }
    }, []);

    // Time-based greeting
    const greeting = useMemo(() => {
        const greetingKey = getGreetingKey();
        return t(`topics.greeting.${greetingKey}`);
    }, [t, i18n.language]); // Re-compute when language changes

    // Derived states
    const isFrench = language === 'fr';
    const isEnglish = language === 'en';

    return {
        language,
        setLanguage,
        languages: LANGUAGE_OPTIONS,
        greeting,
        t,
        isFrench,
        isEnglish,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Format a relative time string
 * @param date - Date to format
 * @param t - Translation function from useTranslation
 */
export function formatRelativeTime(
    date: Date | string,
    t: (key: string, options?: Record<string, unknown>) => string
): string {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffWeeks = Math.floor(diffDays / 7);

    if (diffMins < 1) {
        return t('time.now');
    } else if (diffMins < 60) {
        return t('time.minutesAgo', { count: diffMins });
    } else if (diffHours < 24) {
        return t('time.hoursAgo', { count: diffHours });
    } else if (diffDays < 7) {
        return t('time.daysAgo', { count: diffDays });
    } else {
        return t('time.weeksAgo', { count: diffWeeks });
    }
}

/**
 * Get localized date format
 * @param date - Date to format
 * @param language - Current language
 * @param options - Intl.DateTimeFormat options
 */
export function formatDate(
    date: Date | string,
    language: SupportedLanguage,
    options?: Intl.DateTimeFormatOptions
): string {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    const defaultOptions: Intl.DateTimeFormatOptions = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        ...options,
    };

    return new Intl.DateTimeFormat(locale, defaultOptions).format(new Date(date));
}

/**
 * Get localized short date format (for cards, lists)
 * @param date - Date to format
 * @param language - Current language
 */
export function formatShortDate(date: Date | string, language: SupportedLanguage): string {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'short',
    }).format(new Date(date));
}

/**
 * Get localized time format
 * @param date - Date to format
 * @param language - Current language
 */
export function formatTime(date: Date | string, language: SupportedLanguage): string {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.DateTimeFormat(locale, {
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(date));
}

/**
 * Get localized number format
 * @param number - Number to format
 * @param language - Current language
 */
export function formatNumber(number: number, language: SupportedLanguage): string {
    const locale = language === 'fr' ? 'fr-FR' : 'en-US';
    return new Intl.NumberFormat(locale).format(number);
}

/**
 * Format duration in seconds to mm:ss or hh:mm:ss
 * @param seconds - Duration in seconds
 */
export function formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default useLanguage;
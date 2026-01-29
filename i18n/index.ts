/**
 * @file index.ts
 * @description i18n module exports
 *
 * Setup in app/_layout.tsx:
 * ```tsx
 * import '@/i18n';
 * ```
 *
 * Usage in components:
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 * // or
 * import { useLanguage } from '@/i18n';
 *
 * function MyComponent() {
 *   const { t } = useTranslation();
 *   return <Text>{t('common.loading')}</Text>;
 * }
 * ```
 */

// Initialize i18n (side effect - must be first)
import './i18n';

// Export i18n instance and helpers
export {
    default as i18n,
    changeLanguage,
    getCurrentLanguage,
    isLanguageSupported,
    getLanguageInfo,
    LANGUAGE_STORAGE_KEY,
    DEFAULT_LANGUAGE,
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from './i18n';

// Export custom hook and utilities
export {
    useLanguage,
    formatRelativeTime,
    formatDate,
    formatShortDate,
    formatTime,
    formatNumber,
    formatDuration,
    type UseLanguageReturn,
    type LanguageOption,
} from './useLanguage';

// Re-export react-i18next hooks for convenience
export { useTranslation, Trans } from 'react-i18next';
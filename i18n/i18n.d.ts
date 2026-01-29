/**
 * @file i18n.d.ts
 * @description TypeScript declarations for i18next type-safe translations
 *
 * This file provides autocomplete and type checking for translation keys.
 *
 * Usage:
 * const { t } = useTranslation();
 * t('auth.login.title') // ✅ Type-safe with autocomplete
 * t('invalid.key')      // ❌ TypeScript error
 */

import 'i18next';

// Import the French translations as the reference type
import type fr from './locales/fr.json';

// ═══════════════════════════════════════════════════════════════════════════
// TYPE DECLARATIONS
// ═══════════════════════════════════════════════════════════════════════════

declare module 'i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: typeof fr;
        };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// TRANSLATION KEY TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * All available translation namespaces
 */
export type TranslationNamespace = 'translation';

/**
 * Helper type for nested object keys with dot notation
 */
type NestedKeyOf<ObjectType extends object> = {
    [Key in keyof ObjectType & (string | number)]: ObjectType[Key] extends object
        ? `${Key}` | `${Key}.${NestedKeyOf<ObjectType[Key]>}`
        : `${Key}`;
}[keyof ObjectType & (string | number)];

/**
 * All available translation keys (with autocomplete)
 */
export type TranslationKey = NestedKeyOf<typeof fr>;

// ═══════════════════════════════════════════════════════════════════════════
// TYPED TRANSLATION SECTIONS
// For manual reference when building components
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Common translation keys
 */
export type CommonKeys =
    | 'common.loading'
    | 'common.error'
    | 'common.success'
    | 'common.cancel'
    | 'common.confirm'
    | 'common.save'
    | 'common.delete'
    | 'common.edit'
    | 'common.back'
    | 'common.close'
    | 'common.retry'
    | 'common.yes'
    | 'common.no'
    | 'common.ok'
    | 'common.search'
    | 'common.noResults';

/**
 * Auth login translation keys
 */
export type AuthLoginKeys =
    | 'auth.login.title'
    | 'auth.login.subtitle'
    | 'auth.login.email'
    | 'auth.login.emailPlaceholder'
    | 'auth.login.password'
    | 'auth.login.passwordPlaceholder'
    | 'auth.login.forgotPassword'
    | 'auth.login.signIn'
    | 'auth.login.noAccount'
    | 'auth.login.signUp'
    | 'auth.login.orContinueWith'
    | 'auth.login.loginFailed';

/**
 * Auth register translation keys
 */
export type AuthRegisterKeys =
    | 'auth.register.title'
    | 'auth.register.subtitle'
    | 'auth.register.fullName'
    | 'auth.register.fullNamePlaceholder'
    | 'auth.register.email'
    | 'auth.register.emailPlaceholder'
    | 'auth.register.password'
    | 'auth.register.passwordPlaceholder'
    | 'auth.register.confirmPassword'
    | 'auth.register.confirmPasswordPlaceholder'
    | 'auth.register.passwordHint'
    | 'auth.register.createAccount'
    | 'auth.register.hasAccount'
    | 'auth.register.signIn';

/**
 * Auth validation translation keys
 */
export type AuthValidationKeys =
    | 'auth.validation.emailRequired'
    | 'auth.validation.emailInvalid'
    | 'auth.validation.passwordRequired'
    | 'auth.validation.passwordTooShort'
    | 'auth.validation.passwordsDoNotMatch'
    | 'auth.validation.fixErrors';

/**
 * Profile translation keys
 */
export type ProfileKeys =
    | 'profile.title'
    | 'profile.tabs.profile'
    | 'profile.tabs.preferences'
    | 'profile.tabs.about'
    | 'profile.sections.personalInfo'
    | 'profile.sections.security'
    | 'profile.sections.appearance'
    | 'profile.sections.language'
    | 'profile.preferences.theme'
    | 'profile.preferences.themeDescription'
    | 'profile.preferences.themeLight'
    | 'profile.preferences.themeDark'
    | 'profile.preferences.themeSystem'
    | 'profile.preferences.interfaceLanguage'
    | 'profile.actions.logout';

/**
 * Topics translation keys
 */
export type TopicsKeys =
    | 'topics.title'
    | 'topics.greeting.morning'
    | 'topics.greeting.afternoon'
    | 'topics.greeting.evening'
    | 'topics.search.placeholder'
    | 'topics.search.noResults'
    | 'topics.categories.all'
    | 'topics.categories.recent'
    | 'topics.categories.favorites'
    | 'topics.empty.title'
    | 'topics.empty.description'
    | 'topics.addTopic.title'
    | 'topics.addTopic.placeholder'
    | 'topics.addTopic.submit';

/**
 * Session translation keys
 */
export type SessionKeys =
    | 'session.title'
    | 'session.status.idle'
    | 'session.status.recording'
    | 'session.status.analyzing'
    | 'session.status.complete'
    | 'session.status.error'
    | 'session.instructions.idle'
    | 'session.instructions.recording'
    | 'session.instructions.analyzing'
    | 'session.audioLevel'
    | 'session.error.microphone'
    | 'session.error.recording'
    | 'session.error.analysis';

/**
 * Result translation keys
 */
export type ResultKeys =
    | 'result.title'
    | 'result.tabs.transcription'
    | 'result.tabs.analysis'
    | 'result.analysis.correctPoints'
    | 'result.analysis.corrections'
    | 'result.analysis.missingElements'
    | 'result.analysis.noCorrectPoints'
    | 'result.analysis.noCorrections'
    | 'result.analysis.noMissingElements'
    | 'result.transcription.empty'
    | 'result.transcription.copy'
    | 'result.transcription.copied'
    | 'result.actions.newSession'
    | 'result.actions.close';
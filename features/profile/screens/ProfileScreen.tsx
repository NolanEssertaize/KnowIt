/**
 * @file ProfileScreen.tsx
 * @description Profile screen - Bottom Sheet Modal Style - Theme & i18n Aware
 *
 * FIXED:
 * - Added minHeight to prevent sheet size changes between tabs
 * - Added fixed content area height for consistency
 */

import React, { memo, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TextInput,
    TouchableOpacity,
    Switch,
    Alert,
    ActivityIndicator,
    Platform,
    StyleSheet,
    Animated,
    Dimensions,
    Pressable,
    StatusBar,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';

import { GlassView } from '@/shared/components';
import { Spacing, BorderRadius, useTheme, ThemeSelector } from '@/theme';
import { useLanguage } from '@/i18n';

import { useProfile, type ProfileTab } from '../hooks/useProfile';
import { PasswordChangeModal } from '../components/PasswordChangeModal';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { LogoutConfirmationModal } from '../components/LogoutConfirmationModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// ✅ FIX: Fixed height for the sheet content area
const SHEET_MIN_HEIGHT = SCREEN_HEIGHT * 0.65;
const CONTENT_MIN_HEIGHT = SCREEN_HEIGHT * 0.45;

// ═══════════════════════════════════════════════════════════════════════════
// TAB BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface TabButtonProps {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isActive: boolean;
    onPress: () => void;
}

const TabButton = memo(function TabButton({ label, icon, isActive, onPress }: TabButtonProps) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.tab,
                isActive && { backgroundColor: colors.text.primary },
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <MaterialIcons
                name={icon}
                size={20}
                color={isActive ? colors.text.inverse : colors.text.muted}
            />
            <Text
                style={[
                    styles.tabText,
                    { color: isActive ? colors.text.inverse : colors.text.muted },
                ]}
            >
                {label}
            </Text>
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// PRIMARY BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
    loading?: boolean;
}

const PrimaryButton = memo(function PrimaryButton({
                                                      title,
                                                      onPress,
                                                      disabled = false,
                                                      loading = false,
                                                  }: PrimaryButtonProps) {
    const { colors } = useTheme();

    return (
        <TouchableOpacity
            style={[
                styles.primaryButton,
                { backgroundColor: colors.text.primary },
                disabled && { opacity: 0.5 },
            ]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? (
                <ActivityIndicator size="small" color={colors.text.inverse} />
            ) : (
                <Text style={[styles.primaryButtonText, { color: colors.text.inverse }]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

function ProfileScreenComponent() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { colors, isDark } = useTheme();
    const { t } = useTranslation();
    const { language, setLanguage, languages } = useLanguage();

    const logic = useProfile();
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;

    // ─────────────────────────────────────────────────────────────────────────
    // ANIMATIONS
    // ─────────────────────────────────────────────────────────────────────────

    useEffect(() => {
        Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
        }).start();
    }, [slideAnim]);

    const handleClose = useCallback(() => {
        Animated.timing(slideAnim, {
            toValue: SCREEN_HEIGHT,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            router.back();
        });
    }, [slideAnim, router]);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleExportData = useCallback(() => {
        Alert.alert(
            t('profile.exportData.title') || 'Exporter mes données',
            t('profile.exportData.message') || 'Voulez-vous recevoir une copie de toutes vos données par email ?',
            [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('common.confirm'), onPress: () => console.log('Export data') },
            ]
        );
    }, [t]);

    const handleDeleteConfirm = useCallback(async () => {
        await logic.handleDeleteAccount();
        router.replace('/');
    }, [logic, router]);

    const handleLogoutConfirm = useCallback(async () => {
        await logic.handleLogout();
        router.replace('/');
    }, [logic, router]);

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.user && logic.isLoading) {
        return (
            <View style={[styles.container, { backgroundColor: 'transparent' }]}>
                <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.text.primary} />
                    <Text style={[styles.loadingText, { color: colors.text.secondary }]}>
                        {t('common.loading')}
                    </Text>
                </View>
            </View>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER PROFILE TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderProfileTab = () => (
        <View style={styles.tabContent}>
            {/* Personal Information */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.personalInfo')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    {/* Email */}
                    <View style={styles.listItem}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="email" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.fields.email') || 'Email'}
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                {logic.user?.email}
                            </Text>
                        </View>
                    </View>

                    {/* Full Name */}
                    <View style={[styles.listItem, styles.listItemLast]}>
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="person" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                {t('profile.fields.name') || 'Nom'}
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                {logic.user?.full_name || '-'}
                            </Text>
                        </View>
                    </View>
                </GlassView>
            </View>

            {/* Security */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.security')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity
                        style={[styles.listItem, styles.listItemLast]}
                        onPress={logic.showPasswordModal}
                    >
                        <View style={[styles.listItemIcon, { backgroundColor: colors.surface.glass }]}>
                            <MaterialIcons name="lock" size={20} color={colors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                {t('profile.actions.changePassword') || 'Changer le mot de passe'}
                            </Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color={colors.text.muted} />
                    </TouchableOpacity>
                </GlassView>
            </View>
        </View>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER PREFERENCES TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderPreferencesTab = () => (
        <View style={styles.tabContent}>
            {/* Appearance */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.appearance')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={styles.themeSection}>
                        <View style={styles.themeSectionHeader}>
                            <Text style={[styles.switchTitle, { color: colors.text.primary }]}>
                                {t('profile.preferences.theme')}
                            </Text>
                            <Text style={[styles.switchDescription, { color: colors.text.secondary }]}>
                                {t('profile.preferences.themeDescription')}
                            </Text>
                        </View>
                        <View style={styles.themeSelectorContainer}>
                            <ThemeSelector language={language} showDescriptions={false} />
                        </View>
                    </View>
                </GlassView>
            </View>

            {/* Language */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.sections.language')}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={styles.themeSection}>
                        <Text style={[styles.switchTitle, { color: colors.text.primary }]}>
                            {t('profile.preferences.interfaceLanguage')}
                        </Text>
                        <View style={styles.languageSelector}>
                            {languages.map((lang) => (
                                <TouchableOpacity
                                    key={lang.code}
                                    style={[
                                        styles.languageOption,
                                        {
                                            backgroundColor:
                                                language === lang.code
                                                    ? colors.text.primary
                                                    : colors.surface.glass,
                                            borderColor:
                                                language === lang.code
                                                    ? colors.text.primary
                                                    : colors.glass.border,
                                        },
                                    ]}
                                    onPress={() => setLanguage(lang.code)}
                                >
                                    <Text
                                        style={[
                                            styles.languageText,
                                            {
                                                color:
                                                    language === lang.code
                                                        ? colors.text.inverse
                                                        : colors.text.primary,
                                            },
                                        ]}
                                    >
                                        {lang.flag} {lang.nativeLabel}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </GlassView>
            </View>
        </View>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER ABOUT TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderAboutTab = () => (
        <View style={styles.tabContent}>
            {/* App Info */}
            <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text.muted }]}>
                    {t('profile.about.appInfo') || 'Application'}
                </Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={styles.listItem}>
                        <View style={styles.listItemContent}>
                            <Text style={[styles.listItemLabel, { color: colors.text.secondary }]}>
                                Version
                            </Text>
                            <Text style={[styles.listItemValue, { color: colors.text.primary }]}>
                                1.0.0
                            </Text>
                        </View>
                    </View>
                </GlassView>
            </View>

            {/* Copyright */}
            <View style={styles.copyright}>
                <Text style={[styles.copyrightText, { color: colors.text.muted }]}>
                    © 2024 KnowIt
                </Text>
                <Text style={[styles.copyrightText, { color: colors.text.muted }]}>
                    {t('profile.about.allRightsReserved') || 'Tous droits réservés.'}
                </Text>
            </View>
        </View>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <View style={[styles.container, { backgroundColor: 'transparent' }]}>
            <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

            {/* Backdrop */}
            <Pressable style={styles.backdrop} onPress={handleClose} />

            {/* Bottom Sheet */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        backgroundColor: colors.background.primary,
                        paddingBottom: insets.bottom,
                        transform: [{ translateY: slideAnim }],
                    },
                ]}
            >
                {/* Handle */}
                <View style={styles.handleContainer}>
                    <View style={[styles.handle, { backgroundColor: colors.glass.border }]} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.headerTitle, { color: colors.text.primary }]}>
                        {t('profile.title')}
                    </Text>
                    <TouchableOpacity onPress={handleClose}>
                        <MaterialIcons name="close" size={24} color={colors.text.muted} />
                    </TouchableOpacity>
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
                    <GlassView style={styles.tabsWrapper}>
                        <TabButton
                            label={t('profile.tabs.profile')}
                            icon="person"
                            isActive={logic.activeTab === 'profile'}
                            onPress={() => logic.setActiveTab('profile')}
                        />
                        <TabButton
                            label={t('profile.tabs.preferences')}
                            icon="tune"
                            isActive={logic.activeTab === 'preferences'}
                            onPress={() => logic.setActiveTab('preferences')}
                        />
                        <TabButton
                            label={t('profile.tabs.about')}
                            icon="info"
                            isActive={logic.activeTab === 'about'}
                            onPress={() => logic.setActiveTab('about')}
                        />
                    </GlassView>
                </View>

                {/* Content - ✅ FIX: Fixed minimum height */}
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {logic.activeTab === 'profile' && renderProfileTab()}
                    {logic.activeTab === 'preferences' && renderPreferencesTab()}
                    {logic.activeTab === 'about' && renderAboutTab()}

                    {/* Logout Button (all tabs) */}
                    <View style={[styles.section, styles.logoutSection]}>
                        <TouchableOpacity
                            style={[
                                styles.logoutButton,
                                {
                                    backgroundColor: colors.surface.glass,
                                    borderColor: colors.glass.border,
                                },
                            ]}
                            onPress={logic.showLogoutModal}
                        >
                            <MaterialIcons name="logout" size={20} color={colors.text.primary} />
                            <Text style={[styles.logoutText, { color: colors.text.primary }]}>
                                {t('profile.actions.logout')}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </Animated.View>

            {/* Modals */}
            <PasswordChangeModal
                visible={logic.isPasswordModalVisible}
                onClose={logic.hidePasswordModal}
                currentPassword={logic.passwordData.currentPassword}
                newPassword={logic.passwordData.newPassword}
                confirmPassword={logic.passwordData.confirmPassword}
                onCurrentPasswordChange={logic.setCurrentPassword}
                onNewPasswordChange={logic.setNewPassword}
                onConfirmPasswordChange={logic.setConfirmPassword}
                onSubmit={logic.handleChangePassword}
                errors={logic.passwordErrors}
                isLoading={logic.isLoading}
            />

            <DeleteAccountModal
                visible={logic.isDeleteModalVisible}
                onClose={logic.hideDeleteModal}
                onConfirm={handleDeleteConfirm}
                isLoading={logic.isLoading}
            />

            <LogoutConfirmationModal
                visible={logic.isLogoutModalVisible}
                onClose={logic.hideLogoutModal}
                onConfirm={handleLogoutConfirm}
                isLoading={logic.isLoading}
            />
        </View>
    );
}

export const ProfileScreen = memo(ProfileScreenComponent);

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        minHeight: SHEET_MIN_HEIGHT, // ✅ FIX: Fixed minimum height
        maxHeight: SCREEN_HEIGHT * 0.9,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.1,
                shadowRadius: 12,
            },
            android: {
                elevation: 16,
            },
        }),
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '700',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: Spacing.md,
        fontSize: 16,
    },
    tabsContainer: {
        paddingHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    tabsWrapper: {
        flexDirection: 'row',
        padding: 4,
        borderRadius: BorderRadius.lg,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        gap: 6,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xl,
        minHeight: CONTENT_MIN_HEIGHT, // ✅ FIX: Fixed minimum content height
    },
    // ✅ FIX: Add tabContent style for consistent height
    tabContent: {
        minHeight: CONTENT_MIN_HEIGHT - 100, // Account for logout button
    },
    section: {
        marginBottom: Spacing.lg,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },
    sectionCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },
    listItemLast: {
        borderBottomWidth: 0,
    },
    listItemIcon: {
        width: 40,
        height: 40,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    listItemContent: {
        flex: 1,
    },
    listItemLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
    listItemValue: {
        fontSize: 16,
        fontWeight: '500',
    },
    primaryButton: {
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    themeSection: {
        padding: Spacing.md,
    },
    themeSectionHeader: {
        marginBottom: Spacing.md,
    },
    themeSelectorContainer: {
        marginTop: Spacing.sm,
    },
    switchTitle: {
        fontSize: 16,
        fontWeight: '500',
        marginBottom: 2,
    },
    switchDescription: {
        fontSize: 13,
    },
    languageSelector: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.md,
    },
    languageOption: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        alignItems: 'center',
    },
    languageText: {
        fontSize: 14,
        fontWeight: '500',
    },
    copyright: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
    },
    copyrightText: {
        fontSize: 12,
    },
    logoutSection: {
        marginTop: Spacing.lg,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        gap: Spacing.sm,
    },
    logoutText: {
        fontSize: 16,
        fontWeight: '500',
    },
});

export default ProfileScreen;
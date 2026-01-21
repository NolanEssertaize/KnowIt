/**
 * @file ProfileScreen.tsx
 * @description Écran de profil utilisateur - Monochrome "AI Driver" Theme
 *
 * Pattern: MVVM - Uses useProfile hook for business logic
 *
 * REWORK:
 * - Pure black/white aesthetic
 * - Native iOS back button style
 * - Monochrome switches and icons
 * - No colored accents
 */

import React, { memo, useCallback } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

import { ScreenWrapper, GlassView, GlassButton } from '@/shared/components';
import { GlassColors } from '@/theme';

import { useProfile, type ProfileTab } from '../hooks/useProfile';
import { PasswordChangeModal } from '../components/PasswordChangeModal';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { LogoutConfirmationModal } from '../components/LogoutConfirmationModal';
import { styles } from './ProfileScreen.styles';

// ═══════════════════════════════════════════════════════════════════════════
// SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

interface TabButtonProps {
    label: string;
    icon: keyof typeof MaterialIcons.glyphMap;
    isActive: boolean;
    onPress: () => void;
}

const TabButton = memo(function TabButton({ label, icon, isActive, onPress }: TabButtonProps) {
    return (
        <TouchableOpacity
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <MaterialIcons
                name={icon}
                size={20}
                // Monochrome: primary for active, tertiary for inactive
                color={isActive ? GlassColors.text.primary : GlassColors.text.tertiary}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ProfileScreen = memo(function ProfileScreen() {
    const router = useRouter();
    const logic = useProfile();

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleBack = useCallback(() => {
        router.back();
    }, [router]);

    const handleSaveProfile = useCallback(async () => {
        const result = await logic.handleUpdateProfile();
        if (result.success) {
            Alert.alert('Succès', 'Profil mis à jour avec succès');
        } else if (result.error) {
            Alert.alert('Erreur', result.error);
        }
    }, [logic]);

    const handleExportData = useCallback(async () => {
        Alert.alert(
            'Exporter mes données',
            'Voulez-vous recevoir un export de toutes vos données par email ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Exporter',
                    onPress: async () => {
                        await logic.handleExportData();
                        Alert.alert('Succès', 'Vos données vous seront envoyées par email');
                    },
                },
            ]
        );
    }, [logic]);

    const handleLogoutConfirm = useCallback(async () => {
        const result = await logic.handleLogout();
        if (result.success) {
            router.replace('/(auth)/login');
        } else if (result.error) {
            Alert.alert('Erreur', result.error);
        }
    }, [logic, router]);

    const handleDeleteConfirm = useCallback(
        async (password: string) => {
            const result = await logic.handleDeleteAccount(password);
            if (result.success) {
                router.replace('/(auth)/login');
            } else if (result.error) {
                Alert.alert('Erreur', result.error);
            }
        },
        [logic, router]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // LOADING STATE
    // ─────────────────────────────────────────────────────────────────────────

    if (!logic.user) {
        return (
            <ScreenWrapper>
                <View style={styles.loadingContainer}>
                    {/* Monochrome: Use primary foreground color */}
                    <ActivityIndicator size="large" color={GlassColors.text.primary} />
                    <Text style={styles.loadingText}>Chargement...</Text>
                </View>
            </ScreenWrapper>
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER PROFILE TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderProfileTab = () => (
        <>
            {/* Personal Information */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Informations personnelles</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    {/* Full Name */}
                    <View style={styles.inputItem}>
                        <Text style={styles.inputLabel}>Nom complet</Text>
                        <TextInput
                            style={styles.input}
                            value={logic.fullName}
                            onChangeText={logic.setFullName}
                            placeholder="Votre nom"
                            placeholderTextColor={GlassColors.text.tertiary}
                        />
                    </View>

                    {/* Email (read-only) */}
                    <View style={[styles.inputItem, styles.listItemLast]}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <Text style={styles.inputReadOnly}>{logic.user.email}</Text>
                    </View>
                </GlassView>

                <GlassButton
                    title="Enregistrer les modifications"
                    variant="primary"
                    onPress={handleSaveProfile}
                    disabled={logic.isLoading}
                    loading={logic.isLoading}
                    fullWidth
                    style={styles.saveButton}
                />
            </View>

            {/* Security */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sécurité</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity
                        style={[styles.listItem, styles.listItemLast]}
                        onPress={logic.openPasswordModal}
                        activeOpacity={0.7}
                    >
                        <View style={styles.listItemIcon}>
                            {/* Monochrome: use primary color */}
                            <MaterialIcons name="lock" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Modifier le mot de passe</Text>
                            <Text style={styles.listItemValue}>••••••••</Text>
                        </View>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                            style={styles.listItemChevron}
                        />
                    </TouchableOpacity>
                </GlassView>
            </View>

            {/* Data Management */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mes données</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity
                        style={styles.listItem}
                        onPress={handleExportData}
                        activeOpacity={0.7}
                    >
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="download" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Exporter mes données</Text>
                            <Text style={styles.listItemValue}>Recevoir une copie de vos données</Text>
                        </View>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                            style={styles.listItemChevron}
                        />
                    </TouchableOpacity>

                    {/* Delete Account - Monochrome (no red) */}
                    <TouchableOpacity
                        style={[styles.dangerItem, styles.listItemLast]}
                        onPress={logic.openDeleteModal}
                        activeOpacity={0.7}
                    >
                        <View style={styles.dangerIcon}>
                            <MaterialIcons name="delete-forever" size={20} color={GlassColors.text.primary} />
                        </View>
                        <Text style={styles.dangerText}>Supprimer mon compte</Text>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                        />
                    </TouchableOpacity>
                </GlassView>
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER PREFERENCES TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderPreferencesTab = () => (
        <>
            {/* Notifications */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={[styles.switchItem, styles.listItemLast]}>
                        <View style={styles.switchLabel}>
                            <Text style={styles.switchTitle}>Notifications push</Text>
                            <Text style={styles.switchDescription}>Recevoir des rappels d'étude</Text>
                        </View>
                        <Switch
                            value={logic.preferences.notifications}
                            onValueChange={logic.toggleNotifications}
                            trackColor={{
                                false: GlassColors.glass.background,
                                // Monochrome: use primary foreground instead of colored accent
                                true: GlassColors.text.primary,
                            }}
                            // Monochrome: inverse color for thumb
                            thumbColor={
                                logic.preferences.notifications
                                    ? GlassColors.glass.background
                                    : GlassColors.text.primary
                            }
                            ios_backgroundColor={GlassColors.glass.background}
                        />
                    </View>
                </GlassView>
            </View>

            {/* Appearance */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Apparence</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={[styles.switchItem, styles.listItemLast]}>
                        <View style={styles.switchLabel}>
                            <Text style={styles.switchTitle}>Mode sombre</Text>
                            <Text style={styles.switchDescription}>Thème sombre pour l'application</Text>
                        </View>
                        <Switch
                            value={logic.preferences.darkMode}
                            onValueChange={logic.toggleDarkMode}
                            trackColor={{
                                false: GlassColors.glass.background,
                                true: GlassColors.text.primary,
                            }}
                            thumbColor={
                                logic.preferences.darkMode
                                    ? GlassColors.glass.background
                                    : GlassColors.text.primary
                            }
                            ios_backgroundColor={GlassColors.glass.background}
                        />
                    </View>
                </GlassView>
            </View>

            {/* Language */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Langue</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={[styles.switchItem, styles.listItemLast]}>
                        <View style={styles.switchLabel}>
                            <Text style={styles.switchTitle}>Langue de l'interface</Text>
                            <View style={styles.languageSelector}>
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        logic.preferences.language === 'fr' && styles.languageOptionActive,
                                    ]}
                                    onPress={() => logic.setLanguage('fr')}
                                >
                                    <Text
                                        style={[
                                            styles.languageText,
                                            logic.preferences.language === 'fr' && styles.languageTextActive,
                                        ]}
                                    >
                                        Français
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.languageOption,
                                        logic.preferences.language === 'en' && styles.languageOptionActive,
                                    ]}
                                    onPress={() => logic.setLanguage('en')}
                                >
                                    <Text
                                        style={[
                                            styles.languageText,
                                            logic.preferences.language === 'en' && styles.languageTextActive,
                                        ]}
                                    >
                                        English
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </GlassView>
            </View>

            {/* Data & Storage */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Données & Stockage</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={styles.switchItem}>
                        <View style={styles.switchLabel}>
                            <Text style={styles.switchTitle}>Sauvegarde automatique</Text>
                            <Text style={styles.switchDescription}>Sauvegarder vos sessions en ligne</Text>
                        </View>
                        <Switch
                            value={logic.preferences.autoSave}
                            onValueChange={logic.toggleAutoSave}
                            trackColor={{
                                false: GlassColors.glass.background,
                                true: GlassColors.text.primary,
                            }}
                            thumbColor={
                                logic.preferences.autoSave
                                    ? GlassColors.glass.background
                                    : GlassColors.text.primary
                            }
                            ios_backgroundColor={GlassColors.glass.background}
                        />
                    </View>

                    <View style={[styles.switchItem, styles.listItemLast]}>
                        <View style={styles.switchLabel}>
                            <Text style={styles.switchTitle}>Analytiques</Text>
                            <Text style={styles.switchDescription}>Aider à améliorer l'application</Text>
                        </View>
                        <Switch
                            value={logic.preferences.analyticsEnabled}
                            onValueChange={logic.toggleAnalytics}
                            trackColor={{
                                false: GlassColors.glass.background,
                                true: GlassColors.text.primary,
                            }}
                            thumbColor={
                                logic.preferences.analyticsEnabled
                                    ? GlassColors.glass.background
                                    : GlassColors.text.primary
                            }
                            ios_backgroundColor={GlassColors.glass.background}
                        />
                    </View>
                </GlassView>
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER ABOUT TAB
    // ─────────────────────────────────────────────────────────────────────────

    const renderAboutTab = () => (
        <>
            {/* App Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Application</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <View style={styles.listItem}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="info" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Version</Text>
                            <Text style={styles.listItemValue}>1.0.0 (Build 1)</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="star" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Noter l'application</Text>
                            <Text style={styles.listItemValue}>Laissez-nous un avis</Text>
                        </View>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                            style={styles.listItemChevron}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, styles.listItemLast]} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="share" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Partager KnowIt</Text>
                            <Text style={styles.listItemValue}>Invitez vos amis</Text>
                        </View>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                            style={styles.listItemChevron}
                        />
                    </TouchableOpacity>
                </GlassView>
            </View>

            {/* Legal */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Légal</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="description" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Conditions d'utilisation</Text>
                        </View>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                            style={styles.listItemChevron}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, styles.listItemLast]} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="privacy-tip" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Politique de confidentialité</Text>
                        </View>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                            style={styles.listItemChevron}
                        />
                    </TouchableOpacity>
                </GlassView>
            </View>

            {/* Support */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Support</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="help" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Centre d'aide</Text>
                            <Text style={styles.listItemValue}>FAQ et tutoriels</Text>
                        </View>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                            style={styles.listItemChevron}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, styles.listItemLast]} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="email" size={20} color={GlassColors.text.primary} />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Nous contacter</Text>
                            <Text style={styles.listItemValue}>support@knowit.app</Text>
                        </View>
                        <MaterialIcons
                            name="chevron-right"
                            size={24}
                            color={GlassColors.text.tertiary}
                            style={styles.listItemChevron}
                        />
                    </TouchableOpacity>
                </GlassView>
            </View>

            {/* Copyright */}
            <View style={styles.copyright}>
                <Text style={styles.copyrightText}>© 2026 KnowIt.</Text>
                <Text style={styles.copyrightText}>Tous droits réservés.</Text>
            </View>
        </>
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────

    return (
        <ScreenWrapper>
            {/* Header - Native iOS Back Button Style */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                    <MaterialIcons
                        name={Platform.OS === 'ios' ? 'arrow-back-ios' : 'arrow-back'}
                        size={24}
                        color={GlassColors.text.primary}
                    />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Mon Profil</Text>
            </View>

            {/* iOS Glassmorphism Tabs */}
            <GlassView variant="default" style={styles.tabsContainer}>
                <TabButton
                    label="Profil"
                    icon="person"
                    isActive={logic.activeTab === 'profile'}
                    onPress={() => logic.setActiveTab('profile')}
                />
                <TabButton
                    label="Préférences"
                    icon="tune"
                    isActive={logic.activeTab === 'preferences'}
                    onPress={() => logic.setActiveTab('preferences')}
                />
                <TabButton
                    label="À propos"
                    icon="info"
                    isActive={logic.activeTab === 'about'}
                    onPress={() => logic.setActiveTab('about')}
                />
            </GlassView>

            {/* Content */}
            <ScrollView
                style={styles.content}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {logic.activeTab === 'profile' && renderProfileTab()}
                {logic.activeTab === 'preferences' && renderPreferencesTab()}
                {logic.activeTab === 'about' && renderAboutTab()}

                {/* Logout Button - Primary variant (solid monochrome) */}
                <GlassButton
                    title="Se déconnecter"
                    variant="outline"
                    onPress={logic.openLogoutModal}
                    fullWidth
                    style={styles.logoutButton}
                />
            </ScrollView>

            {/* Modals */}
            <PasswordChangeModal
                visible={logic.isPasswordModalVisible}
                onClose={logic.closePasswordModal}
                currentPassword={logic.currentPassword}
                newPassword={logic.newPassword}
                confirmPassword={logic.confirmPassword}
                onCurrentPasswordChange={logic.setCurrentPassword}
                onNewPasswordChange={logic.setNewPassword}
                onConfirmPasswordChange={logic.setConfirmPassword}
                onSubmit={logic.handlePasswordChange}
                errors={logic.passwordErrors}
                isLoading={logic.isLoading}
            />

            <LogoutConfirmationModal
                visible={logic.isLogoutModalVisible}
                onClose={logic.closeLogoutModal}
                onConfirm={handleLogoutConfirm}
                isLoading={logic.isLoading}
            />

            <DeleteAccountModal
                visible={logic.isDeleteModalVisible}
                onClose={logic.closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                isLoading={logic.isLoading}
            />
        </ScreenWrapper>
    );
});
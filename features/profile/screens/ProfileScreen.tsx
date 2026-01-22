/**
 * @file ProfileScreen.tsx
 * @description Écran de profil - Bottom Sheet Modal Style - Monochrome Theme
 *
 * FIXES:
 * - "Enregistrer les modifications" button: HIGH CONTRAST (white bg, black text)
 * - Logout properly calls AuthService.logout() via useAuthStore
 * - All buttons visible with proper contrast
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

import { GlassView } from '@/shared/components';
import { Spacing, BorderRadius } from '@/theme';

import { useProfile, type ProfileTab } from '../hooks/useProfile';
import { PasswordChangeModal } from '../components/PasswordChangeModal';
import { DeleteAccountModal } from '../components/DeleteAccountModal';
import { LogoutConfirmationModal } from '../components/LogoutConfirmationModal';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

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
    return (
        <TouchableOpacity
            style={[styles.tab, isActive && styles.tabActive]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <MaterialIcons
                name={icon}
                size={20}
                color={isActive ? '#000000' : 'rgba(255,255,255,0.6)'}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {label}
            </Text>
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// PRIMARY BUTTON COMPONENT - HIGH CONTRAST
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
    return (
        <Pressable
            style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.primaryButtonPressed,
                disabled && styles.primaryButtonDisabled,
            ]}
            onPress={onPress}
            disabled={disabled || loading}
        >
            {loading ? (
                <ActivityIndicator size="small" color="#000000" />
            ) : (
                <Text style={styles.primaryButtonText}>{title}</Text>
            )}
        </Pressable>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// OUTLINE BUTTON COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

interface OutlineButtonProps {
    title: string;
    onPress: () => void;
    disabled?: boolean;
}

const OutlineButton = memo(function OutlineButton({
                                                      title,
                                                      onPress,
                                                      disabled = false,
                                                  }: OutlineButtonProps) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.outlineButton,
                pressed && styles.outlineButtonPressed,
                disabled && styles.outlineButtonDisabled,
            ]}
            onPress={onPress}
            disabled={disabled}
        >
            <Text style={styles.outlineButtonText}>{title}</Text>
        </Pressable>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const ProfileScreen = memo(function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const logic = useProfile();

    // Animation for slide-up effect
    const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
    const overlayAnim = useRef(new Animated.Value(0)).current;

    // Animate in on mount
    useEffect(() => {
        Animated.parallel([
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 65,
                friction: 11,
                useNativeDriver: true,
            }),
            Animated.timing(overlayAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const handleClose = useCallback(() => {
        Animated.parallel([
            Animated.timing(slideAnim, {
                toValue: SCREEN_HEIGHT,
                duration: 250,
                useNativeDriver: true,
            }),
            Animated.timing(overlayAnim, {
                toValue: 0,
                duration: 250,
                useNativeDriver: true,
            }),
        ]).start(() => {
            router.back();
        });
    }, [router, slideAnim, overlayAnim]);

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

    // LOGOUT HANDLER - Properly calls the API
    const handleLogoutConfirm = useCallback(async () => {
        console.log('[ProfileScreen] Logout requested');

        try {
            const result = await logic.handleLogout();

            if (result.success) {
                console.log('[ProfileScreen] Logout successful, redirecting...');
                // Close the modal first, then navigate
                handleClose();
                // Use setTimeout to ensure modal is closed before navigation
                setTimeout(() => {
                    router.replace('/(auth)/login');
                }, 300);
            } else if (result.error) {
                console.error('[ProfileScreen] Logout failed:', result.error);
                Alert.alert('Erreur', result.error);
            }
        } catch (error) {
            console.error('[ProfileScreen] Logout error:', error);
            Alert.alert('Erreur', 'Une erreur est survenue lors de la déconnexion');
        }
    }, [logic, router, handleClose]);

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
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFFFFF" />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
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
                    <View style={styles.inputItem}>
                        <Text style={styles.inputLabel}>Nom complet</Text>
                        <TextInput
                            style={styles.input}
                            value={logic.fullName}
                            onChangeText={logic.setFullName}
                            placeholder="Votre nom"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                        />
                    </View>

                    <View style={[styles.inputItem, styles.listItemLast]}>
                        <Text style={styles.inputLabel}>Email</Text>
                        <Text style={styles.inputReadOnly}>{logic.user.email}</Text>
                    </View>
                </GlassView>

                {/* SAVE BUTTON - HIGH CONTRAST */}
                <PrimaryButton
                    title="Enregistrer les modifications"
                    onPress={handleSaveProfile}
                    disabled={logic.isLoading}
                    loading={logic.isLoading}
                />
            </View>

            {/* Security */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Sécurité</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity
                        style={[styles.listItem, styles.listItemLast]}
                        onPress={logic.showPasswordModal}
                        activeOpacity={0.7}
                    >
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="lock" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Modifier le mot de passe</Text>
                            <Text style={styles.listItemValue}>••••••••</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
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
                            <MaterialIcons name="download" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Exporter mes données</Text>
                            <Text style={styles.listItemValue}>Recevoir une copie de vos données</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.listItem, styles.listItemLast]}
                        onPress={logic.showDeleteModal}
                        activeOpacity={0.7}
                    >
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="delete-forever" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Supprimer mon compte</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
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
                                false: 'rgba(255,255,255,0.2)',
                                true: '#FFFFFF',
                            }}
                            thumbColor={logic.preferences.notifications ? '#000000' : '#FFFFFF'}
                            ios_backgroundColor="rgba(255,255,255,0.2)"
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
                                false: 'rgba(255,255,255,0.2)',
                                true: '#FFFFFF',
                            }}
                            thumbColor={logic.preferences.darkMode ? '#000000' : '#FFFFFF'}
                            ios_backgroundColor="rgba(255,255,255,0.2)"
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
                                false: 'rgba(255,255,255,0.2)',
                                true: '#FFFFFF',
                            }}
                            thumbColor={logic.preferences.autoSave ? '#000000' : '#FFFFFF'}
                            ios_backgroundColor="rgba(255,255,255,0.2)"
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
                                false: 'rgba(255,255,255,0.2)',
                                true: '#FFFFFF',
                            }}
                            thumbColor={logic.preferences.analyticsEnabled ? '#000000' : '#FFFFFF'}
                            ios_backgroundColor="rgba(255,255,255,0.2)"
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
                            <MaterialIcons name="info" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Version</Text>
                            <Text style={styles.listItemValue}>1.0.0 (Build 1)</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="star" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Noter l'application</Text>
                            <Text style={styles.listItemValue}>Laissez-nous un avis</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, styles.listItemLast]} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="share" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Partager KnowIt</Text>
                            <Text style={styles.listItemValue}>Invitez vos amis</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                </GlassView>
            </View>

            {/* Legal */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Légal</Text>
                <GlassView variant="default" style={styles.sectionCard}>
                    <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="description" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Conditions d'utilisation</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>

                    <TouchableOpacity style={[styles.listItem, styles.listItemLast]} activeOpacity={0.7}>
                        <View style={styles.listItemIcon}>
                            <MaterialIcons name="privacy-tip" size={20} color="#FFFFFF" />
                        </View>
                        <View style={styles.listItemContent}>
                            <Text style={styles.listItemLabel}>Politique de confidentialité</Text>
                        </View>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
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
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />

            {/* Grey overlay background */}
            <Animated.View
                style={[
                    styles.overlay,
                    {
                        opacity: overlayAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.6],
                        }),
                    },
                ]}
            >
                <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
            </Animated.View>

            {/* Bottom Sheet Modal */}
            <Animated.View
                style={[
                    styles.sheet,
                    {
                        transform: [{ translateY: slideAnim }],
                        paddingBottom: insets.bottom,
                    },
                ]}
            >
                {/* Drag Handle */}
                <View style={styles.dragHandleContainer}>
                    <View style={styles.dragHandle} />
                </View>

                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                        <MaterialIcons name="close" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Mon Profil</Text>
                    <View style={styles.headerSpacer} />
                </View>

                {/* Tabs */}
                <View style={styles.tabsContainer}>
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
                </View>

                {/* Content */}
                <ScrollView
                    style={styles.content}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {logic.activeTab === 'profile' && renderProfileTab()}
                    {logic.activeTab === 'preferences' && renderPreferencesTab()}
                    {logic.activeTab === 'about' && renderAboutTab()}

                    {/* Logout Button - Outline style */}
                    <OutlineButton
                        title="Se déconnecter"
                        onPress={logic.showLogoutModal}
                    />
                </ScrollView>
            </Animated.View>

            {/* Modals */}
            <PasswordChangeModal
                visible={logic.isPasswordModalVisible}
                onClose={logic.hidePasswordModal}
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
                onClose={logic.hideLogoutModal}
                onConfirm={handleLogoutConfirm}
                isLoading={logic.isLoading}
            />

            <DeleteAccountModal
                visible={logic.isDeleteModalVisible}
                onClose={logic.hideDeleteModal}
                onConfirm={handleDeleteConfirm}
                isLoading={logic.isLoading}
            />
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },

    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: '#000000',
    },

    sheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: SCREEN_HEIGHT * 0.9,
        backgroundColor: '#0A0A0A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        overflow: 'hidden',
    },

    dragHandleContainer: {
        alignItems: 'center',
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.xs,
    },

    dragHandle: {
        width: 36,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
        paddingTop: Spacing.sm,
        paddingBottom: Spacing.md,
    },

    closeButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: '600',
        color: '#FFFFFF',
        textAlign: 'center',
    },

    headerSpacer: {
        width: 40,
    },

    // Tabs
    tabsContainer: {
        flexDirection: 'row',
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.lg,
        borderRadius: BorderRadius.lg,
        padding: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },

    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.xs,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
    },

    tabActive: {
        backgroundColor: '#FFFFFF',
    },

    tabText: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
    },

    tabTextActive: {
        color: '#000000',
        fontWeight: '600',
    },

    // Content
    content: {
        flex: 1,
        paddingHorizontal: Spacing.lg,
    },

    scrollContent: {
        paddingBottom: Spacing.xxl + 100,
    },

    // Section
    section: {
        marginBottom: Spacing.xl,
    },

    sectionTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: 'rgba(255, 255, 255, 0.5)',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: Spacing.sm,
        marginLeft: Spacing.xs,
    },

    sectionCard: {
        borderRadius: BorderRadius.lg,
        overflow: 'hidden',
    },

    // List items
    listItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
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
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },

    listItemContent: {
        flex: 1,
    },

    listItemLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 2,
    },

    listItemValue: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },

    // Input
    inputItem: {
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },

    inputLabel: {
        fontSize: 13,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
        marginBottom: Spacing.xs,
    },

    input: {
        fontSize: 16,
        color: '#FFFFFF',
        paddingVertical: Spacing.xs,
    },

    inputReadOnly: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.4)',
        paddingVertical: Spacing.xs,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // PRIMARY BUTTON - HIGH CONTRAST (White bg, Black text)
    // ═══════════════════════════════════════════════════════════════════════
    primaryButton: {
        marginTop: Spacing.md,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: BorderRadius.lg,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        ...Platform.select({
            ios: {
                shadowColor: '#FFFFFF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
            },
            android: {
                elevation: 4,
            },
        }),
    },

    primaryButtonPressed: {
        opacity: 0.9,
        transform: [{ scale: 0.98 }],
    },

    primaryButtonDisabled: {
        opacity: 0.5,
    },

    primaryButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000000',
    },

    // ═══════════════════════════════════════════════════════════════════════
    // OUTLINE BUTTON (Glass bg, White text)
    // ═══════════════════════════════════════════════════════════════════════
    outlineButton: {
        marginTop: Spacing.lg,
        marginBottom: Spacing.xl,
        paddingVertical: 16,
        paddingHorizontal: 24,
        borderRadius: BorderRadius.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        alignItems: 'center',
        justifyContent: 'center',
    },

    outlineButtonPressed: {
        opacity: 0.7,
    },

    outlineButtonDisabled: {
        opacity: 0.5,
    },

    outlineButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },

    // Switch
    switchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.08)',
    },

    switchLabel: {
        flex: 1,
        marginRight: Spacing.md,
    },

    switchTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 2,
    },

    switchDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
    },

    // Language
    languageSelector: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginTop: Spacing.sm,
    },

    languageOption: {
        flex: 1,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
    },

    languageOptionActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
    },

    languageText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'rgba(255, 255, 255, 0.6)',
    },

    languageTextActive: {
        color: '#000000',
        fontWeight: '600',
    },

    // Copyright
    copyright: {
        alignItems: 'center',
        paddingVertical: Spacing.xl,
        marginTop: Spacing.lg,
    },

    copyrightText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.4)',
    },

    // Loading
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#000000',
    },

    loadingText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.6)',
        marginTop: Spacing.md,
    },
});

export default ProfileScreen;
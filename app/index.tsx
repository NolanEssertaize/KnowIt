/**
 * Topics List Screen - Redesign
 * Page principale avec icônes Material (sans emojis)
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    FlatList,
    StyleSheet,
    ScrollView,
    Keyboard,
    Modal,
    KeyboardAvoidingView,
    Platform,
    Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { TouchableOpacity } from 'react-native-gesture-handler';
import ReanimatedSwipeable, {
    SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
    SharedValue,
    useAnimatedStyle,
    interpolate,
} from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useStore } from '../store/useStore';
import { GlassView, GlassCard } from '@/components/GlassView';
import { ScreenWrapper } from '@/components/ScreenWrapper';
import { GlassButton } from '@/components/GlassButton';
import { GlassColors, BorderRadius, Shadows, Spacing } from '@/constants/theme';

// Icônes et couleurs pour les catégories de sujets
const TOPIC_THEMES = [
    { icon: 'laptop', color: '#3B82F6', gradient: ['#3B82F6', '#1D4ED8'] },
    { icon: 'brain', color: '#8B5CF6', gradient: ['#8B5CF6', '#6D28D9'] },
    { icon: 'chart-line', color: '#10B981', gradient: ['#10B981', '#059669'] },
    { icon: 'palette', color: '#F59E0B', gradient: ['#F59E0B', '#D97706'] },
    { icon: 'flask', color: '#EF4444', gradient: ['#EF4444', '#DC2626'] },
    { icon: 'book-open-variant', color: '#EC4899', gradient: ['#EC4899', '#DB2777'] },
    { icon: 'earth', color: '#06B6D4', gradient: ['#06B6D4', '#0891B2'] },
    { icon: 'lightning-bolt', color: '#F97316', gradient: ['#F97316', '#EA580C'] },
];

// Catégories de filtrage
const CATEGORIES = [
    { id: 'all', label: 'Tous', icon: 'view-grid' },
    { id: 'recent', label: 'Récents', icon: 'clock-outline' },
    { id: 'favorite', label: 'Favoris', icon: 'star-outline' },
    { id: 'progress', label: 'En cours', icon: 'trending-up' },
];

// Largeur des boutons d'action
const ACTION_BUTTON_WIDTH = 70;
const ACTIONS_WIDTH = ACTION_BUTTON_WIDTH * 3;

// Composant pour les actions de swipe avec Reanimated
function RightActions({
                          progress,
                          drag,
                          topicId,
                          onEdit,
                          onShare,
                          onDelete,
                      }: {
    progress: SharedValue<number>;
    drag: SharedValue<number>;
    topicId: string;
    onEdit: (id: string) => void;
    onShare: (id: string) => void;
    onDelete: (id: string) => void;
}) {
    const animatedStyle = useAnimatedStyle(() => {
        const translateX = interpolate(
            progress.value,
            [0, 1],
            [ACTIONS_WIDTH, 0]
        );
        const opacity = interpolate(
            progress.value,
            [0, 0.5, 1],
            [0, 0.5, 1]
        );
        return {
            transform: [{ translateX }],
            opacity,
        };
    });

    return (
        <Reanimated.View style={[styles.actionsContainer, animatedStyle]}>
            {/* Bouton Éditer */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onEdit(topicId)}
                activeOpacity={0.7}
            >
                <View style={styles.actionButtonInner}>
                    <MaterialIcons name="edit" size={22} color={GlassColors.accent.primary} />
                    <Text style={styles.actionButtonText}>Éditer</Text>
                </View>
            </TouchableOpacity>

            {/* Bouton Partager */}
            <TouchableOpacity
                style={styles.actionButton}
                onPress={() => onShare(topicId)}
                activeOpacity={0.7}
            >
                <View style={styles.actionButtonInner}>
                    <MaterialIcons name="share" size={22} color={GlassColors.accent.primary} />
                    <Text style={styles.actionButtonText}>Partager</Text>
                </View>
            </TouchableOpacity>

            {/* Bouton Supprimer */}
            <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => onDelete(topicId)}
                activeOpacity={0.7}
            >
                <View style={styles.actionButtonInner}>
                    <MaterialIcons name="delete" size={22} color="#FFFFFF" />
                    <Text style={styles.deleteButtonText}>Supprimer</Text>
                </View>
            </TouchableOpacity>
        </Reanimated.View>
    );
}

export default function TopicsList() {
    const [searchText, setSearchText] = useState('');
    const [newTopicText, setNewTopicText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);
    const { topics, addTopic } = useStore();
    const router = useRouter();

    // Ref pour gérer les swipeables ouverts
    const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

    // Obtenir la salutation selon l'heure
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    };

    // Filtrer les topics
    const filteredTopics = useMemo(() => {
        let result = topics;

        if (searchText.trim()) {
            result = result.filter((t) =>
                t.title.toLowerCase().includes(searchText.toLowerCase())
            );
        }

        if (selectedCategory === 'recent') {
            result = [...result].sort((a, b) => {
                const dateA = a.sessions[0]?.date || 0;
                const dateB = b.sessions[0]?.date || 0;
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
        }

        return result;
    }, [topics, searchText, selectedCategory]);

    const getTopicTheme = (index: number) => {
        return TOPIC_THEMES[index % TOPIC_THEMES.length];
    };

    const handleAddTopic = () => {
        if (!newTopicText.trim()) return;
        addTopic(newTopicText);
        setNewTopicText('');
        setShowAddModal(false);
        Keyboard.dismiss();
    };

    // Fermer tous les swipeables ouverts
    const closeAllSwipeables = useCallback((exceptId?: string) => {
        swipeableRefs.current.forEach((ref, id) => {
            if (id !== exceptId) {
                ref.close();
            }
        });
        if (!exceptId) {
            setOpenSwipeableId(null);
        }
    }, []);

    // Gérer le tap sur une carte
    const handleCardPress = useCallback((topicId: string) => {
        // Si un swipeable est ouvert, le fermer au lieu de naviguer
        if (openSwipeableId) {
            closeAllSwipeables();
            return;
        }
        router.push(`/${topicId}`);
    }, [openSwipeableId, closeAllSwipeables, router]);

    // Actions handlers (à implémenter plus tard)
    const handleEdit = useCallback((topicId: string) => {
        console.log('Edit topic:', topicId);
        closeAllSwipeables();
        // TODO: Implémenter l'édition
    }, [closeAllSwipeables]);

    const handleShare = useCallback((topicId: string) => {
        console.log('Share topic:', topicId);
        closeAllSwipeables();
        // TODO: Implémenter le partage
    }, [closeAllSwipeables]);

    const handleDelete = useCallback((topicId: string) => {
        console.log('Delete topic:', topicId);
        closeAllSwipeables();
        // TODO: Implémenter la suppression
    }, [closeAllSwipeables]);

    const totalSessions = topics.reduce((acc, t) => acc + t.sessions.length, 0);

    const renderHeader = () => (
        <View style={styles.header}>
            {/* Salutation */}
            <View style={styles.greetingSection}>
                <View style={styles.greetingLeft}>
                    <View style={styles.greetingRow}>
                        <Text style={styles.greetingText}>{getGreeting()}</Text>
                        <MaterialCommunityIcons
                            name="hand-wave"
                            size={20}
                            color={GlassColors.accent.primary}
                            style={styles.waveIcon}
                        />
                    </View>
                    <Text style={styles.userName}>Prêt à apprendre ?</Text>
                </View>
                <Pressable
                    style={styles.profileButton}
                    onPress={() => setShowAddModal(true)}
                >
                    <LinearGradient
                        colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                        style={styles.addButtonGradient}
                    >
                        <MaterialIcons name="add" size={28} color={GlassColors.text.primary} />
                    </LinearGradient>
                </Pressable>
            </View>

            {/* Stats rapides */}
            <View style={styles.statsRow}>
                <GlassView style={styles.statCard}>
                    <MaterialCommunityIcons name="book-multiple" size={24} color={GlassColors.accent.primary} />
                    <Text style={styles.statNumber}>{topics.length}</Text>
                    <Text style={styles.statLabel}>Sujets</Text>
                </GlassView>
                <GlassView style={styles.statCard}>
                    <MaterialCommunityIcons name="microphone" size={24} color={GlassColors.semantic.success} />
                    <Text style={styles.statNumber}>{totalSessions}</Text>
                    <Text style={styles.statLabel}>Sessions</Text>
                </GlassView>
                <GlassView style={styles.statCard}>
                    <MaterialCommunityIcons name="fire" size={24} color={GlassColors.semantic.warning} />
                    <Text style={styles.statNumber}>0</Text>
                    <Text style={styles.statLabel}>Streak</Text>
                </GlassView>
            </View>

            {/* Barre de recherche */}
            <GlassView style={styles.searchContainer}>
                <MaterialIcons name="search" size={22} color={GlassColors.text.tertiary} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un sujet..."
                    placeholderTextColor={GlassColors.text.tertiary}
                    value={searchText}
                    onChangeText={setSearchText}
                />
                {searchText.length > 0 && (
                    <Pressable onPress={() => setSearchText('')}>
                        <MaterialIcons name="close" size={20} color={GlassColors.text.tertiary} />
                    </Pressable>
                )}
            </GlassView>

            {/* Catégories */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoriesContainer}
            >
                {CATEGORIES.map((cat) => (
                    <Pressable
                        key={cat.id}
                        onPress={() => setSelectedCategory(cat.id)}
                    >
                        {selectedCategory === cat.id ? (
                            <LinearGradient
                                colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.categoryChip}
                            >
                                <MaterialCommunityIcons
                                    name={cat.icon as any}
                                    size={16}
                                    color={GlassColors.text.primary}
                                />
                                <Text style={styles.categoryLabelActive}>{cat.label}</Text>
                            </LinearGradient>
                        ) : (
                            <GlassView style={styles.categoryChip}>
                                <MaterialCommunityIcons
                                    name={cat.icon as any}
                                    size={16}
                                    color={GlassColors.text.secondary}
                                />
                                <Text style={styles.categoryLabel}>{cat.label}</Text>
                            </GlassView>
                        )}
                    </Pressable>
                ))}
            </ScrollView>

            {/* Titre de section */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Mes Sujets</Text>
                <Text style={styles.sectionCount}>{filteredTopics.length} sujets</Text>
            </View>

            {/* Indication de swipe */}
            <Text style={styles.swipeHint}>
                ← Glissez pour plus d'options
            </Text>
        </View>
    );

    const renderTopic = ({ item, index }: { item: any; index: number }) => {
        const theme = getTopicTheme(index);
        const lastSession = item.sessions[0];
        const lastDate = lastSession
            ? new Date(lastSession.date).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'short',
            })
            : 'Jamais';

        return (
            <View style={styles.topicCardWrapper}>
                <ReanimatedSwipeable
                    ref={(ref) => {
                        if (ref) {
                            swipeableRefs.current.set(item.id, ref);
                        } else {
                            swipeableRefs.current.delete(item.id);
                        }
                    }}
                    renderRightActions={(progress, drag) => (
                        <RightActions
                            progress={progress}
                            drag={drag}
                            topicId={item.id}
                            onEdit={handleEdit}
                            onShare={handleShare}
                            onDelete={handleDelete}
                        />
                    )}
                    onSwipeableWillOpen={() => {
                        closeAllSwipeables(item.id);
                        setOpenSwipeableId(item.id);
                    }}
                    onSwipeableClose={() => {
                        if (openSwipeableId === item.id) {
                            setOpenSwipeableId(null);
                        }
                    }}
                    overshootRight={false}
                    friction={2}
                    rightThreshold={40}
                >
                    <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() => handleCardPress(item.id)}
                    >
                        <GlassCard style={styles.topicCard}>
                            <View style={styles.topicContent}>
                                {/* Icône avec gradient */}
                                <LinearGradient
                                    colors={theme.gradient as [string, string]}
                                    style={styles.topicIconContainer}
                                >
                                    <MaterialCommunityIcons
                                        name={theme.icon as any}
                                        size={26}
                                        color="#FFFFFF"
                                    />
                                </LinearGradient>

                                {/* Infos du topic */}
                                <View style={styles.topicInfo}>
                                    <Text style={styles.topicTitle} numberOfLines={1}>
                                        {item.title}
                                    </Text>
                                    <View style={styles.topicMeta}>
                                        <View style={styles.metaItem}>
                                            <MaterialCommunityIcons
                                                name="text-box-outline"
                                                size={14}
                                                color={GlassColors.text.secondary}
                                            />
                                            <Text style={styles.metaText}>
                                                {item.sessions.length} session{item.sessions.length !== 1 ? 's' : ''}
                                            </Text>
                                        </View>
                                        <View style={styles.metaDot} />
                                        <View style={styles.metaItem}>
                                            <MaterialCommunityIcons
                                                name="clock-outline"
                                                size={14}
                                                color={GlassColors.text.secondary}
                                            />
                                            <Text style={styles.metaText}>{lastDate}</Text>
                                        </View>
                                    </View>
                                </View>

                                {/* Chevron */}
                                <View style={styles.chevronContainer}>
                                    <MaterialIcons
                                        name="chevron-right"
                                        size={24}
                                        color={GlassColors.accent.primary}
                                    />
                                </View>
                            </View>

                            {/* Barre de progression */}
                            <View style={styles.progressBarContainer}>
                                <View style={styles.progressBarBg}>
                                    <LinearGradient
                                        colors={theme.gradient as [string, string]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 0 }}
                                        style={[
                                            styles.progressBarFill,
                                            { width: `${Math.min(item.sessions.length * 20, 100)}%` },
                                        ]}
                                    />
                                </View>
                            </View>
                        </GlassCard>
                    </TouchableOpacity>
                </ReanimatedSwipeable>
            </View>
        );
    };

    const renderEmpty = () => (
        <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
                <MaterialCommunityIcons
                    name="book-open-page-variant"
                    size={56}
                    color={GlassColors.accent.primary}
                />
            </View>
            <Text style={styles.emptyTitle}>Aucun sujet</Text>
            <Text style={styles.emptySubtitle}>
                Commencez par ajouter votre premier sujet d'apprentissage
            </Text>
            <GlassButton
                title="Ajouter un sujet"
                variant="primary"
                size="md"
                onPress={() => setShowAddModal(true)}
                style={styles.emptyButton}
                leftIcon={<MaterialIcons name="add" size={20} color="#FFF" />}
            />
        </View>
    );

    // Modal d'ajout avec glassmorphism amélioré et gestion du clavier
    const renderAddModal = () => (
        <Modal
            visible={showAddModal}
            transparent
            animationType="fade"
            onRequestClose={() => setShowAddModal(false)}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.modalKeyboardAvoid}
            >
                <View style={styles.modalOverlay}>
                    <Pressable
                        style={styles.modalBackdrop}
                        onPress={() => setShowAddModal(false)}
                    />
                    <View style={styles.modalContent}>
                        {/* Fond avec glassmorphism amélioré */}
                        <LinearGradient
                            colors={['rgba(30, 41, 59, 0.98)', 'rgba(15, 23, 42, 0.98)']}
                            style={styles.modalGradient}
                        >
                            {/* Overlay glass effect */}
                            <View style={styles.modalGlassOverlay} />

                            <View style={styles.modalInner}>
                                <View style={styles.modalHeader}>
                                    <View style={styles.modalIconContainer}>
                                        <LinearGradient
                                            colors={[GlassColors.accent.primary, GlassColors.accent.secondary]}
                                            style={styles.modalIconGradient}
                                        >
                                            <MaterialCommunityIcons name="book-plus" size={28} color="#FFF" />
                                        </LinearGradient>
                                    </View>
                                    <Text style={styles.modalTitle}>Nouveau Sujet</Text>
                                    <Text style={styles.modalSubtitle}>
                                        Quel sujet souhaitez-vous apprendre ?
                                    </Text>
                                </View>

                                <View style={styles.modalInputContainer}>
                                    <MaterialCommunityIcons
                                        name="text"
                                        size={20}
                                        color={GlassColors.text.tertiary}
                                        style={styles.modalInputIcon}
                                    />
                                    <TextInput
                                        style={styles.modalInput}
                                        placeholder="Ex: React Native, Photoshop..."
                                        placeholderTextColor={GlassColors.text.tertiary}
                                        value={newTopicText}
                                        onChangeText={setNewTopicText}
                                        autoFocus
                                        onSubmitEditing={handleAddTopic}
                                    />
                                </View>

                                <View style={styles.modalButtons}>
                                    <Pressable
                                        style={styles.modalCancelButton}
                                        onPress={() => setShowAddModal(false)}
                                    >
                                        <Text style={styles.modalCancelText}>Annuler</Text>
                                    </Pressable>
                                    <GlassButton
                                        title="Ajouter"
                                        variant="primary"
                                        size="md"
                                        onPress={handleAddTopic}
                                        disabled={!newTopicText.trim()}
                                        style={styles.modalAddButton}
                                    />
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );

    return (
        <ScreenWrapper useSafeArea padding={0}>
            <FlatList
                data={filteredTopics}
                keyExtractor={(item) => item.id}
                renderItem={renderTopic}
                ListHeaderComponent={renderHeader}
                ListEmptyComponent={renderEmpty}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            />
            {renderAddModal()}
        </ScreenWrapper>
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
        flexGrow: 1,
    },

    // Header
    header: {
        paddingTop: Spacing.lg,
        marginBottom: Spacing.lg,
    },
    greetingSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    greetingLeft: {
        flex: 1,
    },
    greetingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    greetingText: {
        color: GlassColors.text.secondary,
        fontSize: 16,
    },
    waveIcon: {
        marginLeft: 6,
    },
    userName: {
        color: GlassColors.text.primary,
        fontSize: 26,
        fontWeight: '700',
    },
    profileButton: {
        marginLeft: Spacing.md,
    },
    addButtonGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadows.glow(GlassColors.accent.primary),
    },

    // Stats
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.lg,
    },
    statCard: {
        flex: 1,
        padding: Spacing.md,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
    },
    statNumber: {
        color: GlassColors.text.primary,
        fontSize: 20,
        fontWeight: '700',
        marginTop: 6,
        marginBottom: 2,
    },
    statLabel: {
        color: GlassColors.text.secondary,
        fontSize: 12,
    },

    // Search
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.md,
        marginBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    searchInput: {
        flex: 1,
        color: GlassColors.text.primary,
        fontSize: 16,
        paddingVertical: Spacing.sm,
    },

    // Categories
    categoriesContainer: {
        paddingBottom: Spacing.lg,
        gap: Spacing.sm,
    },
    categoryChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        marginRight: Spacing.sm,
        gap: Spacing.xs,
    },
    categoryLabel: {
        color: GlassColors.text.secondary,
        fontSize: 14,
        fontWeight: '500',
    },
    categoryLabelActive: {
        color: GlassColors.text.primary,
        fontSize: 14,
        fontWeight: '600',
    },

    // Section Header
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xs,
    },
    sectionTitle: {
        color: GlassColors.text.primary,
        fontSize: 20,
        fontWeight: '700',
    },
    sectionCount: {
        color: GlassColors.text.secondary,
        fontSize: 14,
    },
    swipeHint: {
        color: GlassColors.text.tertiary,
        fontSize: 12,
        marginBottom: Spacing.md,
    },

    // Topic Cards
    topicCardWrapper: {
        marginBottom: Spacing.md,
    },
    topicCard: {
        padding: Spacing.md,
    },
    topicContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    topicIconContainer: {
        width: 52,
        height: 52,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
    },
    topicInfo: {
        flex: 1,
    },
    topicTitle: {
        color: GlassColors.text.primary,
        fontSize: 17,
        fontWeight: '600',
        marginBottom: 4,
    },
    topicMeta: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        color: GlassColors.text.secondary,
        fontSize: 13,
    },
    metaDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: GlassColors.text.tertiary,
        marginHorizontal: Spacing.sm,
    },
    chevronContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: GlassColors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    progressBarContainer: {
        marginTop: Spacing.md,
        paddingTop: Spacing.sm,
        borderTopWidth: 1,
        borderTopColor: GlassColors.glass.border,
    },
    progressBarBg: {
        height: 4,
        backgroundColor: GlassColors.glass.background,
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
    },

    // Swipe Actions
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: Spacing.sm,
    },
    actionButton: {
        width: ACTION_BUTTON_WIDTH,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        borderRadius: BorderRadius.md,
        marginHorizontal: 2,
    },
    actionButtonInner: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: Spacing.sm,
    },
    actionButtonText: {
        color: GlassColors.accent.primary,
        fontSize: 11,
        fontWeight: '500',
        marginTop: 4,
    },
    deleteButton: {
        backgroundColor: GlassColors.semantic.error,
        borderRadius: BorderRadius.md,
    },
    deleteButtonText: {
        color: '#FFFFFF',
        fontSize: 11,
        fontWeight: '600',
        marginTop: 4,
    },

    // Empty State
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxl * 2,
        paddingHorizontal: Spacing.xl,
    },
    emptyIconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: GlassColors.glass.background,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
    },
    emptyTitle: {
        color: GlassColors.text.primary,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: Spacing.sm,
    },
    emptySubtitle: {
        color: GlassColors.text.secondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: Spacing.xl,
    },
    emptyButton: {
        minWidth: 180,
    },

    // Modal - Amélioré avec meilleur glassmorphism et gestion du clavier
    modalKeyboardAvoid: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        paddingBottom: Platform.OS === 'ios' ? 20 : 40,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    modalContent: {
        marginHorizontal: Spacing.lg,
        borderRadius: BorderRadius.xl,
        overflow: 'hidden',
        // Ombre pour effet de profondeur
        shadowColor: GlassColors.accent.primary,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    modalGradient: {
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    modalGlassOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        borderRadius: BorderRadius.xl,
    },
    modalInner: {
        padding: Spacing.xl,
    },
    modalHeader: {
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    modalIconContainer: {
        marginBottom: Spacing.md,
    },
    modalIconGradient: {
        width: 64,
        height: 64,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalTitle: {
        color: GlassColors.text.primary,
        fontSize: 24,
        fontWeight: '700',
        marginBottom: Spacing.xs,
        textAlign: 'center',
    },
    modalSubtitle: {
        color: GlassColors.text.secondary,
        fontSize: 15,
        textAlign: 'center',
    },
    modalInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.12)',
        marginBottom: Spacing.lg,
        paddingHorizontal: Spacing.md,
    },
    modalInputIcon: {
        marginRight: Spacing.sm,
    },
    modalInput: {
        flex: 1,
        color: GlassColors.text.primary,
        fontSize: 16,
        paddingVertical: Spacing.md,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: Spacing.md,
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    modalCancelText: {
        color: GlassColors.text.secondary,
        fontSize: 16,
        fontWeight: '500',
    },
    modalAddButton: {
        flex: 1,
    },
});
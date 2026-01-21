/**
 * @file useTopicsList.ts
 * @description Logic Controller pour l'écran de liste des topics
 *
 * FIXES:
 * - Added safety filters to prevent crashes on undefined topics
 * - Added useEffect to load topics on mount for synchronization
 * - Added streak property for tracking consecutive days of study
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useStore, selectTopics, selectIsLoading, selectError } from '@/store/useStore';
import type { Topic, TopicTheme, TopicCategory } from '@/types';
import { formatDateRelative } from '@/shared/utils/dateUtils';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════════════════

export const TOPIC_THEMES: TopicTheme[] = [
    { icon: 'laptop', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'brain', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'chart-line', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'palette', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'flask', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
    { icon: 'book-open-variant', color: '#FFFFFF', gradient: ['rgba(255,255,255,0.75)', 'rgba(255,255,255,0.35)'] },
];


export const CATEGORIES: TopicCategory[] = [
    { id: 'all', label: 'Tous', icon: 'view-grid' },
    { id: 'recent', label: 'Récents', icon: 'clock-outline' },
    { id: 'favorites', label: 'Favoris', icon: 'star-outline' },
];

const DEBOUNCE_DELAY = 300; // ms

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TopicItemData {
    topic: Topic;
    theme: TopicTheme;
    lastSessionDate: string;
}

export interface UseTopicsListReturn {
    // Data
    filteredTopics: TopicItemData[];
    searchText: string;
    selectedCategory: string;
    showAddModal: boolean;
    newTopicText: string;
    totalSessions: number;
    topicsCount: number;
    greeting: string;
    hasActiveFilters: boolean;
    isLoading: boolean;
    error: string | null;
    streak: number;

    // Methods
    setSearchText: (text: string) => void;
    setSelectedCategory: (category: string) => void;
    setShowAddModal: (show: boolean) => void;
    setNewTopicText: (text: string) => void;
    handleAddTopic: () => void;
    handleCardPress: (topicId: string) => void;
    handleEdit: (topicId: string) => void;
    handleShare: (topicId: string) => void;
    handleDelete: (topicId: string) => void;
    closeAllSwipeables: (exceptId?: string) => void;
    registerSwipeableRef: (id: string, ref: SwipeableMethods) => void;
    unregisterSwipeableRef: (id: string) => void;
    resetFilters: () => void;
    refreshTopics: () => Promise<void>;
}

// ═══════════════════════════════════════════════════════════════════════════
// CUSTOM HOOK - useDebounce
// ═══════════════════════════════════════════════════════════════════════════

function useDebounce<T>(value: T, delay: number): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPER - Calculate streak from sessions
// ═══════════════════════════════════════════════════════════════════════════

function calculateStreak(topics: Topic[]): number {
    // SAFETY CHECK: Ensure topics array exists
    if (!topics || !Array.isArray(topics)) return 0;

    // Get all session dates from all topics
    const allSessionDates: Date[] = [];

    topics.forEach(topic => {
        // SAFETY CHECK: Ensure topic and sessions exist
        if (topic && topic.sessions && Array.isArray(topic.sessions)) {
            topic.sessions.forEach(session => {
                if (session && session.date) {
                    allSessionDates.push(new Date(session.date));
                }
            });
        }
    });

    if (allSessionDates.length === 0) return 0;

    // Sort dates descending (most recent first)
    allSessionDates.sort((a, b) => b.getTime() - a.getTime());

    // Get unique days (normalize to start of day)
    const uniqueDays = new Set<string>();
    allSessionDates.forEach(date => {
        const dayKey = date.toISOString().split('T')[0];
        uniqueDays.add(dayKey);
    });

    const sortedDays = Array.from(uniqueDays).sort().reverse();

    if (sortedDays.length === 0) return 0;

    // Check if today or yesterday has a session
    const today = new Date();
    const todayKey = today.toISOString().split('T')[0];

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    // If no session today or yesterday, streak is 0
    if (sortedDays[0] !== todayKey && sortedDays[0] !== yesterdayKey) {
        return 0;
    }

    // Count consecutive days
    let streak = 1;
    let currentDate = new Date(sortedDays[0]);

    for (let i = 1; i < sortedDays.length; i++) {
        const prevDate = new Date(currentDate);
        prevDate.setDate(prevDate.getDate() - 1);
        const prevKey = prevDate.toISOString().split('T')[0];

        if (sortedDays[i] === prevKey) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }

    return streak;
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOK
// ═══════════════════════════════════════════════════════════════════════════

export function useTopicsList(): UseTopicsListReturn {
    const router = useRouter();

    // Store state
    const topics = useStore(selectTopics);
    const isLoading = useStore(selectIsLoading);
    const error = useStore(selectError);

    // Store actions
    const { addTopic, deleteTopic, loadTopics } = useStore();

    // État local
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTopicText, setNewTopicText] = useState('');
    const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);

    // Debounce du texte de recherche
    const debouncedSearchText = useDebounce(searchText, DEBOUNCE_DELAY);

    // Refs pour les swipeables
    const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

    // ─────────────────────────────────────────────────────────────────────────
    // EFFECTS
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        console.log('[useTopicsList] Loading topics on mount...');
        loadTopics();
    }, [loadTopics]);

    // ─────────────────────────────────────────────────────────────────────────
    // MEMOIZED VALUES
    // ─────────────────────────────────────────────────────────────────────────

    const hasActiveFilters = useMemo(() => {
        return debouncedSearchText.trim().length > 0 || selectedCategory !== 'all';
    }, [debouncedSearchText, selectedCategory]);

    const greeting = useMemo(() => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Bonjour';
        if (hour < 18) return 'Bon après-midi';
        return 'Bonsoir';
    }, []);

    // Topics filtrés et enrichis
    const filteredTopics = useMemo((): TopicItemData[] => {
        // SAFETY CHECK 1: Ensure topics exists
        if (!topics || !Array.isArray(topics)) return [];

        // SAFETY CHECK 2: Filter out undefined/null topics immediately
        // This is the main fix for "Cannot read property 'topic' of undefined"
        let result = topics.filter((t) => t && t.id);

        // Filtre par recherche
        if (debouncedSearchText.trim()) {
            const query = debouncedSearchText.toLowerCase();
            result = result.filter((t) => t.title && t.title.toLowerCase().includes(query));
        }

        // Tri par catégorie
        if (selectedCategory === 'recent') {
            result.sort((a, b) => {
                // Safety check on sessions access
                const dateA = (a.sessions && a.sessions[0]?.date) || '';
                const dateB = (b.sessions && b.sessions[0]?.date) || '';
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
        }

        // Enrichissement
        return result.map((topic, index) => ({
            topic,
            theme: TOPIC_THEMES[index % TOPIC_THEMES.length],
            // Safety check on sessions access
            lastSessionDate: topic.sessions && topic.sessions[0]?.date
                ? formatDateRelative(topic.sessions[0].date)
                : 'Jamais',
        }));
    }, [topics, debouncedSearchText, selectedCategory]);

    // Stats (with safety check)
    const totalSessions = useMemo(
        () => (topics || []).reduce((acc, t) => acc + (t?.sessions?.length || 0), 0),
        [topics]
    );

    // Streak
    const streak = useMemo(() => calculateStreak(topics), [topics]);

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    const resetFilters = useCallback(() => {
        setSearchText('');
        setSelectedCategory('all');
    }, []);

    const refreshTopics = useCallback(async () => {
        console.log('[useTopicsList] Refreshing topics...');
        await loadTopics();
    }, [loadTopics]);

    const handleAddTopic = useCallback(async () => {
        const trimmed = newTopicText.trim();
        if (!trimmed) return;

        console.log('[useTopicsList] Adding topic:', trimmed);

        try {
            const newTopic = await addTopic(trimmed);

            if (newTopic) {
                console.log('[useTopicsList] Topic created:', newTopic.id);
                setNewTopicText('');
                setShowAddModal(false);
                Keyboard.dismiss();
            } else {
                console.error('[useTopicsList] Failed to create topic - no topic returned');
            }
        } catch (error) {
            console.error('[useTopicsList] Error creating topic:', error);
        }
    }, [newTopicText, addTopic]);

    const closeAllSwipeables = useCallback((exceptId?: string) => {
        swipeableRefs.current.forEach((ref, id) => {
            if (id !== exceptId) {
                ref?.close();
            }
        });
        if (!exceptId) {
            setOpenSwipeableId(null);
        }
    }, []);

    const handleCardPress = useCallback(
        (topicId: string) => {
            if (openSwipeableId) {
                closeAllSwipeables();
                return;
            }
            router.push(`/${topicId}`);
        },
        [openSwipeableId, closeAllSwipeables, router]
    );

    const handleEdit = useCallback(
        (topicId: string) => {
            console.log('Edit topic:', topicId);
            closeAllSwipeables();
            // TODO: Implémenter l'édition
        },
        [closeAllSwipeables]
    );

    const handleShare = useCallback(
        (topicId: string) => {
            console.log('Share topic:', topicId);
            closeAllSwipeables();
            // TODO: Implémenter le partage
        },
        [closeAllSwipeables]
    );

    const handleDelete = useCallback(
        (topicId: string) => {
            deleteTopic(topicId);
            closeAllSwipeables();
        },
        [deleteTopic, closeAllSwipeables]
    );

    const registerSwipeableRef = useCallback((id: string, ref: SwipeableMethods) => {
        if (ref) {
            swipeableRefs.current.set(id, ref);
        }
    }, []);

    const unregisterSwipeableRef = useCallback((id: string) => {
        swipeableRefs.current.delete(id);
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        filteredTopics,
        searchText,
        selectedCategory,
        showAddModal,
        newTopicText,
        totalSessions,
        topicsCount: (topics || []).length,
        greeting,
        hasActiveFilters,
        isLoading,
        error,
        streak,
        setSearchText,
        setSelectedCategory,
        setShowAddModal,
        setNewTopicText,
        handleAddTopic,
        handleCardPress,
        handleEdit,
        handleShare,
        handleDelete,
        closeAllSwipeables,
        registerSwipeableRef,
        unregisterSwipeableRef,
        resetFilters,
        refreshTopics,
    };
}
/**
 * @file useTopicsList.ts
 * @description Logic Controller pour l'écran de liste des topics
 *
 * FIXED:
 * - Removed loadTopics from useEffect dependencies to prevent infinite refresh loop
 * - Added hasLoadedRef to ensure topics are only loaded ONCE on mount
 * - User can manually refresh using pull-to-refresh (refreshTopics function)
 */

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Keyboard } from 'react-native';
import { useRouter } from 'expo-router';
import type { SwipeableMethods } from 'react-native-gesture-handler/ReanimatedSwipeable';
import { useStore, selectTopics, selectIsLoading, selectError } from '@/store/useStore';
import type { Topic } from '@/store';
import { formatDateRelative } from '@/shared/utils/dateUtils';

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const DEBOUNCE_DELAY = 300;

const TOPIC_THEMES = [
    { icon: 'lightbulb-outline', color: '#FFB347', gradient: ['#FFB347', '#FFCC80'] },
    { icon: 'code-braces', color: '#87CEEB', gradient: ['#87CEEB', '#ADD8E6'] },
    { icon: 'book-open-variant', color: '#98D8C8', gradient: ['#98D8C8', '#B2DFDB'] },
    { icon: 'brain', color: '#DDA0DD', gradient: ['#DDA0DD', '#E6E6FA'] },
    { icon: 'flask-outline', color: '#F0E68C', gradient: ['#F0E68C', '#FFFACD'] },
    { icon: 'music-note', color: '#FFB6C1', gradient: ['#FFB6C1', '#FFC0CB'] },
    { icon: 'palette-outline', color: '#C9A0DC', gradient: ['#C9A0DC', '#D8BFD8'] },
    { icon: 'earth', color: '#87CEFA', gradient: ['#87CEFA', '#B0E0E6'] },
];

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export interface TopicTheme {
    icon: string;
    color: string;
    gradient: string[];
}

export interface TopicCategory {
    id: string;
    label: string;
    icon: string;
}

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
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    return 'evening';
}

function calculateStreak(topics: Topic[]): number {
    if (!topics || topics.length === 0) return 0;

    const allSessions = topics
        .flatMap((t) => t.sessions || [])
        .map((s) => s.date)
        .filter(Boolean)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (allSessions.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(checkDate.getDate() - i);
        const expectedKey = checkDate.toISOString().split('T')[0];

        if (allSessions.some((d) => d.startsWith(expectedKey))) {
            streak++;
        } else if (i > 0) {
            // Allow skipping today if no session yet
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

    // Local state
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTopicText, setNewTopicText] = useState('');
    const [openSwipeableId, setOpenSwipeableId] = useState<string | null>(null);

    // ✅ FIX: Track if initial load has happened to prevent auto-refresh
    const hasLoadedRef = useRef(false);

    // Debounce search text
    const debouncedSearchText = useDebounce(searchText, DEBOUNCE_DELAY);

    // Refs for swipeables
    const swipeableRefs = useRef<Map<string, SwipeableMethods>>(new Map());

    // ─────────────────────────────────────────────────────────────────────────
    // ✅ FIX: Load topics only ONCE on mount - NO auto-refresh
    // User can manually refresh using pull-to-refresh (refreshTopics)
    // ─────────────────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!hasLoadedRef.current) {
            console.log('[useTopicsList] Loading topics on mount (once)...');
            hasLoadedRef.current = true;
            loadTopics();
        }
        // ✅ FIX: Intentionally NOT including loadTopics in dependencies
        // to prevent infinite refresh loop. Topics are loaded once on mount.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ─────────────────────────────────────────────────────────────────────────
    // MEMOIZED VALUES
    // ─────────────────────────────────────────────────────────────────────────

    // Check if filters are active
    const hasActiveFilters = useMemo(() => {
        return debouncedSearchText.trim().length > 0 || selectedCategory !== 'all';
    }, [debouncedSearchText, selectedCategory]);

    // Filtered and enriched topics (uses debounced text)
    const filteredTopics = useMemo((): TopicItemData[] => {
        let result = [...(topics || [])];

        // Filter by search (with debounce)
        if (debouncedSearchText.trim()) {
            const query = debouncedSearchText.toLowerCase();
            result = result.filter((t) => t.title.toLowerCase().includes(query));
        }

        // Sort by category
        if (selectedCategory === 'recent') {
            result.sort((a, b) => {
                const dateA = a.sessions?.[0]?.date || '';
                const dateB = b.sessions?.[0]?.date || '';
                return new Date(dateB).getTime() - new Date(dateA).getTime();
            });
        }

        // Enrich with theme and date
        return result.map((topic, index) => ({
            topic,
            theme: TOPIC_THEMES[index % TOPIC_THEMES.length],
            lastSessionDate: topic.sessions?.[0]?.date
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
    const streak = useMemo(() => calculateStreak(topics || []), [topics]);

    // Greeting
    const greeting = useMemo(() => getGreeting(), []);

    // Topics count
    const topicsCount = topics?.length || 0;

    // ─────────────────────────────────────────────────────────────────────────
    // HANDLERS
    // ─────────────────────────────────────────────────────────────────────────

    // Reset filters
    const resetFilters = useCallback(() => {
        setSearchText('');
        setSelectedCategory('all');
    }, []);

    // ✅ Manual refresh - called by pull-to-refresh
    const refreshTopics = useCallback(async () => {
        console.log('[useTopicsList] Manual refresh triggered by user...');
        await loadTopics();
    }, [loadTopics]);

    // Add topic handler
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
        } catch (err) {
            console.error('[useTopicsList] Error creating topic:', err);
        }
    }, [newTopicText, addTopic]);

    // Close all swipeables
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

    // Register swipeable ref
    const registerSwipeableRef = useCallback((id: string, ref: SwipeableMethods) => {
        swipeableRefs.current.set(id, ref);
    }, []);

    // Unregister swipeable ref
    const unregisterSwipeableRef = useCallback((id: string) => {
        swipeableRefs.current.delete(id);
    }, []);

    // Card press handler
    const handleCardPress = useCallback(
        (topicId: string) => {
            closeAllSwipeables();
            router.push(`/${topicId}`);
        },
        [closeAllSwipeables, router]
    );

    // Edit handler
    const handleEdit = useCallback(
        (topicId: string) => {
            closeAllSwipeables();
            router.push(`/${topicId}`);
        },
        [closeAllSwipeables, router]
    );

    // Share handler
    const handleShare = useCallback(
        (topicId: string) => {
            closeAllSwipeables();
            console.log('[useTopicsList] Share topic:', topicId);
            // TODO: Implement share functionality
        },
        [closeAllSwipeables]
    );

    // Delete handler
    const handleDelete = useCallback(
        async (topicId: string) => {
            closeAllSwipeables();
            console.log('[useTopicsList] Deleting topic:', topicId);

            try {
                await deleteTopic(topicId);
                console.log('[useTopicsList] Topic deleted:', topicId);
            } catch (err) {
                console.error('[useTopicsList] Error deleting topic:', err);
            }
        },
        [closeAllSwipeables, deleteTopic]
    );

    // ─────────────────────────────────────────────────────────────────────────
    // RETURN
    // ─────────────────────────────────────────────────────────────────────────

    return {
        // Data
        filteredTopics,
        searchText,
        selectedCategory,
        showAddModal,
        newTopicText,
        totalSessions,
        topicsCount,
        greeting,
        hasActiveFilters,
        isLoading,
        error,
        streak,

        // Methods
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

export default useTopicsList;
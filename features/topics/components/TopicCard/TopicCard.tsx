/**
 * @file TopicCard.tsx
 * @description Topic Card with swipe actions - Theme Aware + i18n
 *
 * FIXED:
 * - Uses data: TopicItemData prop (main branch interface)
 * - All colors use useTheme() hook
 * - Swipe action buttons adaptive to theme
 * - Added i18n translations
 */

import React, { memo, useEffect, useRef, useCallback, useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import ReanimatedSwipeable, {
    type SwipeableMethods,
} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Reanimated, {
    type SharedValue,
    useAnimatedStyle,
    interpolate,
} from 'react-native-reanimated';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTranslation } from 'react-i18next';
import { useTheme, Spacing, BorderRadius } from '@/theme';
import type { TopicItemData } from '../../hooks/useTopicsList';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface TopicCardProps {
    data: TopicItemData;
    onPress: () => void;
    onEdit: () => void;
    onShare: () => void;
    onDelete: () => void;
    registerRef: (ref: SwipeableMethods) => void;
    unregisterRef: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// SWIPE ACTIONS - Theme Aware
// ═══════════════════════════════════════════════════════════════════════════

interface RightActionsProps {
    progress: SharedValue<number>;
    onEdit: () => void;
    onShare: () => void;
    onDelete: () => void;
}

const RightActions = memo(function RightActions({
                                                    progress,
                                                    onEdit,
                                                    onShare,
                                                    onDelete,
                                                }: RightActionsProps) {
    const { colors } = useTheme();

    const animatedStyle = useAnimatedStyle(() => ({
        opacity: interpolate(progress.value, [0, 1], [0, 1]),
        transform: [
            {
                translateX: interpolate(progress.value, [0, 1], [100, 0]),
            },
        ],
    }));

    return (
        <Reanimated.View style={[styles.actionsContainer, animatedStyle]}>
            {/* Edit Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    {
                        backgroundColor: colors.surface.glass,
                        borderWidth: 1,
                        borderColor: colors.glass.borderLight,
                    },
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onEdit}
            >
                <MaterialIcons name="edit" size={20} color={colors.text.primary} />
            </Pressable>

            {/* Share Button */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    {
                        backgroundColor: colors.surface.glass,
                        borderWidth: 1,
                        borderColor: colors.glass.borderLight,
                    },
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onShare}
            >
                <MaterialIcons name="share" size={20} color={colors.text.primary} />
            </Pressable>

            {/* Delete Button - HIGH CONTRAST */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    { backgroundColor: colors.text.primary },
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onDelete}
            >
                <MaterialIcons name="delete" size={20} color={colors.text.inverse} />
            </Pressable>
        </Reanimated.View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const TopicCard = memo(function TopicCard({
                                                     data,
                                                     onPress,
                                                     onEdit,
                                                     onShare,
                                                     onDelete,
                                                     registerRef,
                                                     unregisterRef,
                                                 }: TopicCardProps) {
    const swipeableRef = useRef<SwipeableMethods>(null);
    const { topic, theme, lastSessionDate } = data;
    const { colors } = useTheme();
    const { t } = useTranslation();

    const [isSwipeOpen, setIsSwipeOpen] = useState(false);
    const isSwipingRef = useRef(false);
    const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate session count from topic.sessions
    const sessionCount = topic.sessions?.length || 0;

    useEffect(() => {
        if (swipeableRef.current) {
            registerRef(swipeableRef.current);
        }
        return () => {
            unregisterRef();
            if (swipeTimeoutRef.current) {
                clearTimeout(swipeTimeoutRef.current);
            }
        };
    }, [registerRef, unregisterRef]);

    const handleSwipeableWillOpen = useCallback(() => {
        isSwipingRef.current = true;
        setIsSwipeOpen(true);
    }, []);

    const handleSwipeableOpen = useCallback(() => {
        setIsSwipeOpen(true);
        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }
        swipeTimeoutRef.current = setTimeout(() => {
            isSwipingRef.current = false;
        }, 100);
    }, []);

    const handleSwipeableWillClose = useCallback(() => {
        isSwipingRef.current = true;
    }, []);

    const handleSwipeableClose = useCallback(() => {
        setIsSwipeOpen(false);
        if (swipeTimeoutRef.current) {
            clearTimeout(swipeTimeoutRef.current);
        }
        swipeTimeoutRef.current = setTimeout(() => {
            isSwipingRef.current = false;
        }, 150);
    }, []);

    const handleCardPress = useCallback(() => {
        if (isSwipeOpen || isSwipingRef.current) {
            if (isSwipeOpen && swipeableRef.current) {
                swipeableRef.current.close();
            }
            return;
        }
        onPress();
    }, [isSwipeOpen, onPress]);

    const renderRightActions = useCallback(
        (progress: SharedValue<number>) => (
            <RightActions
                progress={progress}
                onEdit={onEdit}
                onShare={onShare}
                onDelete={onDelete}
            />
        ),
        [onEdit, onShare, onDelete]
    );

    return (
        <View style={styles.swipeableContainer}>
            <ReanimatedSwipeable
                ref={swipeableRef}
                friction={2}
                rightThreshold={40}
                overshootRight={false}
                renderRightActions={renderRightActions}
                onSwipeableWillOpen={handleSwipeableWillOpen}
                onSwipeableOpen={handleSwipeableOpen}
                onSwipeableWillClose={handleSwipeableWillClose}
                onSwipeableClose={handleSwipeableClose}
            >
                <Pressable
                    onPress={handleCardPress}
                    style={({ pressed }) => [
                        styles.cardContainer,
                        {
                            backgroundColor: colors.surface.glass,
                            borderColor: colors.glass.borderLight,
                        },
                        pressed && !isSwipeOpen && styles.cardPressed,
                    ]}
                >
                    {/* Left Icon */}
                    <View
                        style={[
                            styles.iconContainer,
                            { backgroundColor: colors.surface.elevated },
                        ]}
                    >
                        <MaterialCommunityIcons
                            name={theme.icon as any}
                            size={24}
                            color={colors.text.primary}
                        />
                    </View>

                    {/* Content */}
                    <View style={styles.contentContainer}>
                        <Text
                            style={[styles.title, { color: colors.text.primary }]}
                            numberOfLines={1}
                        >
                            {topic.title}
                        </Text>
                        <View style={styles.metaContainer}>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="history"
                                    size={14}
                                    color={colors.text.muted}
                                />
                                <Text style={[styles.metaText, { color: colors.text.muted }]}>
                                    {sessionCount} {t('topics.card.sessions')}
                                </Text>
                            </View>
                            <View style={styles.metaDot} />
                            <Text style={[styles.metaText, { color: colors.text.muted }]}>
                                {lastSessionDate}
                            </Text>
                        </View>
                    </View>

                    {/* Chevron */}
                    <MaterialIcons
                        name="chevron-right"
                        size={24}
                        color={colors.text.muted}
                    />
                </Pressable>
            </ReanimatedSwipeable>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    swipeableContainer: {
        marginBottom: Spacing.sm,
    },
    cardContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        gap: Spacing.md,
    },
    cardPressed: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        flex: 1,
        gap: 4,
    },
    title: {
        fontSize: 16,
        fontWeight: '600',
    },
    metaContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    metaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metaText: {
        fontSize: 12,
    },
    metaDot: {
        width: 3,
        height: 3,
        borderRadius: 1.5,
        backgroundColor: '#666',
    },
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: Spacing.sm,
        gap: Spacing.xs,
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: BorderRadius.md,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },
});

export default TopicCard;
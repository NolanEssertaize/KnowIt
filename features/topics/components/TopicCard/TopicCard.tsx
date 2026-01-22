/**
 * @file TopicCard.tsx
 * @description Carte de topic avec swipe actions - Monochrome Theme
 *
 * FIXES:
 * - Swipe action buttons use HIGH CONTRAST colors
 * - Delete button: White bg + Black icon
 * - Edit/Share buttons: Glass bg + White icon with visible border
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
import type { TopicItemData } from '../../hooks/useTopicsList';
import { Spacing, BorderRadius } from '@/theme';

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
// SWIPE ACTIONS - HIGH CONTRAST
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
            {/* Edit Button - Glass style */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    styles.editButton,
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onEdit}
            >
                <MaterialIcons name="edit" size={20} color="#FFFFFF" />
            </Pressable>

            {/* Share Button - Glass style */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    styles.shareButton,
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onShare}
            >
                <MaterialIcons name="share" size={20} color="#FFFFFF" />
            </Pressable>

            {/* Delete Button - HIGH CONTRAST (White bg, Black icon) */}
            <Pressable
                style={({ pressed }) => [
                    styles.actionButton,
                    styles.deleteButton,
                    pressed && styles.actionButtonPressed,
                ]}
                onPress={onDelete}
            >
                <MaterialIcons name="delete" size={20} color="#000000" />
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

    const [isSwipeOpen, setIsSwipeOpen] = useState(false);
    const isSwipingRef = useRef(false);
    const swipeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
                renderRightActions={renderRightActions}
                overshootRight={false}
                onSwipeableWillOpen={handleSwipeableWillOpen}
                onSwipeableOpen={handleSwipeableOpen}
                onSwipeableWillClose={handleSwipeableWillClose}
                onSwipeableClose={handleSwipeableClose}
            >
                <Pressable
                    style={({ pressed }) => [
                        styles.card,
                        pressed && styles.cardPressed,
                    ]}
                    onPress={handleCardPress}
                >
                    {/* Topic Icon Container */}
                    <View style={styles.iconContainer}>
                        <MaterialCommunityIcons
                            name={theme.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                            size={26}
                            color="#FFFFFF"
                        />
                    </View>

                    {/* Topic Info */}
                    <View style={styles.topicInfo}>
                        <Text style={styles.topicTitle} numberOfLines={1}>
                            {topic.title}
                        </Text>
                        <View style={styles.topicMeta}>
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="text-box-outline"
                                    size={14}
                                    color="rgba(255,255,255,0.6)"
                                />
                                <Text style={styles.metaText}>
                                    {topic.sessions.length} session{topic.sessions.length !== 1 ? 's' : ''}
                                </Text>
                            </View>
                            <View style={styles.metaDot} />
                            <View style={styles.metaItem}>
                                <MaterialCommunityIcons
                                    name="clock-outline"
                                    size={14}
                                    color="rgba(255,255,255,0.6)"
                                />
                                <Text style={styles.metaText}>{lastSessionDate}</Text>
                            </View>
                        </View>
                    </View>

                    {/* Chevron */}
                    <View style={styles.chevronContainer}>
                        <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.4)" />
                    </View>
                </Pressable>
            </ReanimatedSwipeable>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES - Monochrome Theme
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    swipeableContainer: {
        marginBottom: Spacing.md,
    },

    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderRadius: BorderRadius.lg,
        backgroundColor: 'rgba(255, 255, 255, 0.06)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },

    cardPressed: {
        opacity: 0.8,
    },

    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.md,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },

    topicInfo: {
        flex: 1,
    },

    topicTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: Spacing.xs,
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
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
    },

    metaDot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        marginHorizontal: Spacing.sm,
    },

    chevronContainer: {
        padding: Spacing.xs,
    },

    // ═══════════════════════════════════════════════════════════════════════
    // SWIPE ACTIONS - HIGH CONTRAST
    // ═══════════════════════════════════════════════════════════════════════
    actionsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: Spacing.sm,
    },

    actionButton: {
        width: 48,
        height: 48,
        borderRadius: BorderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.xs,
    },

    actionButtonPressed: {
        opacity: 0.7,
        transform: [{ scale: 0.95 }],
    },

    // Edit button - Glass style with border
    editButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    // Share button - Glass style with border
    shareButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },

    // Delete button - HIGH CONTRAST (White bg, Black icon)
    deleteButton: {
        backgroundColor: '#FFFFFF',
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
            },
            android: {
                elevation: 4,
            },
        }),
    },
});

export default TopicCard;
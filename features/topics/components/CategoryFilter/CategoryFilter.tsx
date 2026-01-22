/**
 * @file CategoryFilter.tsx
 * @description Filtre horizontal par catégories - Monochrome Theme
 *
 * FIX: White-on-white bug
 * - Removed LinearGradient (was causing invisible active state)
 * - High contrast: Black text on White bg (inactive), White text on Black bg (active)
 * - Native iOS Segmented Control style
 */

import React, { memo } from 'react';
import { View, ScrollView, Pressable, Text, StyleSheet, Platform } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { GlassColors, Spacing, BorderRadius, Shadows } from '@/theme';
import { CATEGORIES } from '../../hooks/useTopicsList';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface CategoryFilterProps {
    selectedCategory: string;
    onSelectCategory: (categoryId: string) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT
// ═══════════════════════════════════════════════════════════════════════════

export const CategoryFilter = memo(function CategoryFilter({
                                                               selectedCategory,
                                                               onSelectCategory,
                                                           }: CategoryFilterProps) {
    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.contentContainer}
            >
                {CATEGORIES.map((cat) => {
                    const isActive = selectedCategory === cat.id;

                    return (
                        <Pressable
                            key={cat.id}
                            onPress={() => onSelectCategory(cat.id)}
                            style={({ pressed }) => [
                                styles.chip,
                                isActive && styles.chipActive,
                                pressed && styles.chipPressed,
                            ]}
                        >
                            <MaterialCommunityIcons
                                name={cat.icon as keyof typeof MaterialCommunityIcons.glyphMap}
                                size={16}
                                // HIGH CONTRAST: Black icon when active (on white bg), white when inactive (on dark bg)
                                color={isActive ? '#000000' : '#FFFFFF'}
                            />
                            <Text style={[styles.label, isActive && styles.labelActive]}>
                                {cat.label}
                            </Text>
                        </Pressable>
                    );
                })}
            </ScrollView>
        </View>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES - High Contrast Monochrome
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        paddingVertical: Spacing.sm,
    },

    contentContainer: {
        gap: Spacing.sm,
        paddingHorizontal: Spacing.xs,
    },

    // Inactive chip: Transparent/glass background, white text
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.full,
        gap: Spacing.xs,
        // Glass background for inactive state
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.15)',
    },

    // Active chip: SOLID WHITE background, BLACK text (HIGH CONTRAST)
    chipActive: {
        backgroundColor: '#FFFFFF',
        borderColor: '#FFFFFF',
        ...Shadows.glassLight,
    },

    chipPressed: {
        opacity: 0.8,
    },

    // Inactive label: White text
    label: {
        fontSize: 14,
        fontWeight: '500',
        color: '#FFFFFF',
    },

    // Active label: BLACK text on WHITE background (HIGH CONTRAST)
    labelActive: {
        color: '#000000',
        fontWeight: '600',
    },
});

export default CategoryFilter;
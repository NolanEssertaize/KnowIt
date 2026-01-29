/**
 * @file CategoryFilter.tsx
 * @description Category Filter Component - Theme Aware, Internationalized
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useTheme, Spacing, BorderRadius } from '@/theme';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type TopicCategory = 'all' | 'recent' | 'favorites';

interface CategoryFilterProps {
    selectedCategory: TopicCategory;
    onSelectCategory: (category: TopicCategory) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export const CategoryFilter = memo(function CategoryFilter({
                                                               selectedCategory,
                                                               onSelectCategory,
                                                           }: CategoryFilterProps) {
    const { colors } = useTheme();
    const { t } = useTranslation();

    const categories: { key: TopicCategory; label: string }[] = [
        { key: 'all', label: t('topics.categories.all') },
        { key: 'recent', label: t('topics.categories.recent') },
        { key: 'favorites', label: t('topics.categories.favorites') },
    ];

    return (
        <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.container}
        >
            {categories.map((category) => {
                const isSelected = selectedCategory === category.key;

                return (
                    <TouchableOpacity
                        key={category.key}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: isSelected
                                    ? colors.text.primary
                                    : colors.surface.glass,
                                borderColor: isSelected
                                    ? colors.text.primary
                                    : colors.glass.border,
                            },
                        ]}
                        onPress={() => onSelectCategory(category.key)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.chipText,
                                {
                                    color: isSelected
                                        ? colors.text.inverse
                                        : colors.text.secondary,
                                },
                            ]}
                        >
                            {category.label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </ScrollView>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// STYLES
// ═══════════════════════════════════════════════════════════════════════════

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingVertical: Spacing.xs,
    },
    chip: {
        paddingVertical: Spacing.xs,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.full,
        borderWidth: 1,
    },
    chipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default CategoryFilter;
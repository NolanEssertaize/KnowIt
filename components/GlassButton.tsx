/**
 * @file GlassButton.tsx
 * @description Bouton avec effet verre - Monochrome "AI Driver" Theme
 *
 * REWORK:
 * - Removed LinearGradient (solid fills only)
 * - Removed colored glows
 * - Native platform styling (iOS HIG / Material 3)
 * - Pure black/white aesthetic
 */

import React, { memo, type ReactNode } from 'react';
import {
    TouchableOpacity,
    Text,
    View,
    ActivityIndicator,
    type ViewStyle,
    type StyleProp,
    Platform,
} from 'react-native';
import { GlassColors, Shadows, BorderRadius } from '@/theme';
import { styles, SIZE_STYLES } from './GlassButton.styles';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type ButtonVariant = 'primary' | 'secondary' | 'glass' | 'outline' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface GlassButtonProps {
    /** Button text */
    title: string;
    /** Press handler */
    onPress: () => void;
    /** Visual variant */
    variant?: ButtonVariant;
    /** Size variant */
    size?: ButtonSize;
    /** Disabled state */
    disabled?: boolean;
    /** Loading state */
    loading?: boolean;
    /** Full width */
    fullWidth?: boolean;
    /** Left icon */
    leftIcon?: ReactNode;
    /** Right icon */
    rightIcon?: ReactNode;
    /** Additional styles */
    style?: StyleProp<ViewStyle>;
    /** Text style override */
    textStyle?: StyleProp<any>;
}

// ═══════════════════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export const GlassButton = memo(function GlassButton({
                                                         title,
                                                         onPress,
                                                         variant = 'primary',
                                                         size = 'md',
                                                         disabled = false,
                                                         loading = false,
                                                         fullWidth = false,
                                                         leftIcon,
                                                         rightIcon,
                                                         style,
                                                         textStyle,
                                                     }: GlassButtonProps) {
    const isDisabled = disabled || loading;
    const sizeConfig = SIZE_STYLES[size];

    // Get variant-specific styles
    const getVariantStyles = (): ViewStyle => {
        switch (variant) {
            case 'primary':
                return isDisabled ? styles.primaryButtonDisabled : styles.primaryButton;
            case 'secondary':
                return isDisabled ? styles.secondaryButtonDisabled : styles.secondaryButton;
            case 'glass':
                return isDisabled ? styles.glassButtonDisabled : styles.glassButton;
            case 'outline':
                return isDisabled ? styles.outlineButtonDisabled : styles.outlineButton;
            case 'ghost':
                return styles.ghostButton;
            default:
                return styles.primaryButton;
        }
    };

    // Get text color based on variant
    const getTextStyle = () => {
        if (isDisabled) return styles.textDisabled;

        switch (variant) {
            case 'primary':
                return styles.textPrimary; // Inverse color
            case 'secondary':
                return styles.textSecondary;
            case 'glass':
                return styles.textGlass;
            case 'outline':
                return styles.textOutline;
            case 'ghost':
                return styles.textGhost;
            default:
                return styles.textPrimary;
        }
    };

    // Get loading indicator color
    const getLoadingColor = () => {
        switch (variant) {
            case 'primary':
                // Inverse color for primary button
                return GlassColors.glass.background === 'rgba(255, 255, 255, 0.06)'
                    ? '#000000'
                    : '#FFFFFF';
            default:
                return GlassColors.text.primary;
        }
    };

    // Shadow style (monochrome, no colored glow)
    const shadowStyle = variant === 'primary' && !isDisabled
        ? Shadows.glassLight
        : undefined;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={isDisabled}
            activeOpacity={0.7}
            style={[
                styles.container,
                sizeConfig.container,
                getVariantStyles(),
                shadowStyle,
                fullWidth && styles.fullWidth,
                style,
            ]}
        >
            <View style={styles.contentWrapper}>
                {loading ? (
                    <ActivityIndicator size="small" color={getLoadingColor()} />
                ) : (
                    <>
                        {leftIcon && <View style={styles.iconLeft}>{leftIcon}</View>}
                        <Text
                            style={[
                                styles.text,
                                sizeConfig.text,
                                getTextStyle(),
                                textStyle,
                            ]}
                        >
                            {title}
                        </Text>
                        {rightIcon && <View style={styles.iconRight}>{rightIcon}</View>}
                    </>
                )}
            </View>
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// SPECIALIZED VARIANTS
// ═══════════════════════════════════════════════════════════════════════════

interface RecordButtonProps {
    isRecording: boolean;
    onPress: () => void;
    size?: number;
    style?: StyleProp<ViewStyle>;
}

/**
 * Record Button - Monochrome version
 * Uses solid black/white instead of colored gradients
 */
export const RecordButton = memo(function RecordButton({
                                                           isRecording,
                                                           onPress,
                                                           size = 72,
                                                           style,
                                                       }: RecordButtonProps) {
    return (
        <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            style={[
                {
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    backgroundColor: isRecording
                        ? GlassColors.text.primary // Solid fill when recording
                        : GlassColors.glass.background,
                    borderWidth: isRecording ? 0 : 2,
                    borderColor: GlassColors.text.primary,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
                Shadows.glass,
                style,
            ]}
        >
            <View
                style={{
                    width: isRecording ? size * 0.35 : size * 0.4,
                    height: isRecording ? size * 0.35 : size * 0.4,
                    borderRadius: isRecording ? 4 : (size * 0.4) / 2,
                    backgroundColor: isRecording
                        ? GlassColors.glass.background === 'rgba(255, 255, 255, 0.06)'
                            ? '#000000'
                            : '#FFFFFF'
                        : GlassColors.text.primary,
                }}
            />
        </TouchableOpacity>
    );
});

// ═══════════════════════════════════════════════════════════════════════════
// INDEX EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default GlassButton;
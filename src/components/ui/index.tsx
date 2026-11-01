/**
 * Componentes de UI luxuosos do PUFF & LOUNGE.
 * Seguem estritamente o Design System com paleta escura e acentos dourados.
 */
import React from 'react';
import {
  ActivityIndicator,
  GestureResponderEvent,
  Platform,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radius, shadows, spacing, type } from '../../theme';

// ============================================================================
// Botão Luxo (Gold Button)
// ============================================================================
export interface ButtonProps {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  variant?: 'gold' | 'outline' | 'subtle' | 'tobacco';
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'gold',
  icon,
  size = 'md',
  loading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  const isGold = variant === 'gold';
  const isOutline = variant === 'outline';
  const isSubtle = variant === 'subtle';
  const isTobacco = variant === 'tobacco';

  const sizeStyle: ViewStyle = {
    paddingVertical: size === 'sm' ? 8 : size === 'lg' ? 16 : 12,
    paddingHorizontal: size === 'sm' ? 14 : size === 'lg' ? 24 : 18,
    borderRadius: radius.md,
  };

  const content = (
    <View style={styles.buttonContentRow}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isGold ? '#0F0E0E' : colors.gold}
          style={{ marginRight: 8 }}
        />
      ) : icon ? (
        <Ionicons
          name={icon}
          size={size === 'sm' ? 16 : 18}
          color={isGold ? '#0F0E0E' : isTobacco ? '#F5F2EB' : colors.gold}
          style={{ marginRight: 8 }}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          size === 'sm' && { fontSize: 13 },
          size === 'lg' && { fontSize: 16 },
          isGold && { color: '#0F0E0E', fontFamily: fonts.sansBold },
          isOutline && { color: colors.gold, fontFamily: fonts.sansSemiBold },
          isSubtle && { color: colors.textSecondary, fontFamily: fonts.sansMedium },
          isTobacco && { color: '#F5F2EB', fontFamily: fonts.sansBold },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );

  if (isGold) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled || loading}
        style={({ pressed }) => [
          styles.buttonBase,
          shadows.glow,
          sizeStyle,
          pressed && styles.pressed,
          disabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={['#F4DA8D', '#D4AF37', '#B68E24']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: radius.md }]}
        />
        {content}
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.buttonBase,
        sizeStyle,
        isOutline && styles.buttonOutline,
        isSubtle && styles.buttonSubtle,
        isTobacco && styles.buttonTobacco,
        pressed && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {content}
    </Pressable>
  );
};

// ============================================================================
// Card de Luxo (Surface Card)
// ============================================================================
export interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'surface' | 'surfaceAlt' | 'bordered';
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  style,
  variant = 'surface',
}) => {
  const bg = variant === 'surfaceAlt' ? colors.surfaceAlt : colors.surface;
  const isBordered = variant === 'bordered' || variant === 'surface';

  const containerStyle = [
    styles.card,
    { backgroundColor: bg },
    isBordered && styles.goldBorder,
    shadows.card,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [containerStyle, pressed && styles.cardPressed]}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

// ============================================================================
// Badge / Chip Tag
// ============================================================================
export interface BadgeProps {
  label: string;
  variant?: 'gold' | 'tobacco' | 'muted' | 'outline';
  icon?: keyof typeof Ionicons.glyphMap;
  size?: 'sm' | 'md';
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'muted',
  icon,
  size = 'sm',
  style,
  textStyle,
}) => {
  const isGold = variant === 'gold';
  const isTobacco = variant === 'tobacco';
  const isOutline = variant === 'outline';

  return (
    <View
      style={[
        styles.badge,
        size === 'md' && styles.badgeMd,
        isGold && styles.badgeGold,
        isTobacco && styles.badgeTobacco,
        isOutline && styles.badgeOutline,
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={size === 'md' ? 14 : 12}
          color={isGold ? colors.gold : isTobacco ? colors.tobaccoLight : colors.textSecondary}
          style={{ marginRight: 4 }}
        />
      )}
      <Text
        style={[
          styles.badgeText,
          size === 'md' && { fontSize: 12 },
          isGold && { color: colors.gold, fontFamily: fonts.sansSemiBold },
          isTobacco && { color: colors.tobaccoLight, fontFamily: fonts.sansMedium },
          isOutline && { color: colors.text, fontFamily: fonts.sansMedium },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

// ============================================================================
// Divisor Dourado Decorativo
// ============================================================================
export const GoldDivider: React.FC<{ style?: StyleProp<ViewStyle> }> = ({ style }) => (
  <View style={[styles.dividerContainer, style]}>
    <View style={styles.dividerLine} />
    <View style={styles.dividerDiamond} />
    <View style={styles.dividerLine} />
  </View>
);

// ============================================================================
// Cabeçalho de Seção Editorial
// ============================================================================
export interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  overline?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: StyleProp<ViewStyle>;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  overline,
  actionLabel,
  onAction,
  style,
}) => (
  <View style={[styles.sectionHeader, style]}>
    <View style={{ flex: 1, paddingRight: 8 }}>
      {overline ? <Text style={type.overline}>{overline}</Text> : null}
      <Text style={[type.h2, overline && { marginTop: 4 }]}>{title}</Text>
      {subtitle ? <Text style={[type.bodySecondary, { marginTop: 4 }]}>{subtitle}</Text> : null}
    </View>
    {actionLabel && onAction && (
      <Pressable onPress={onAction} style={({ pressed }) => pressed && styles.pressed}>
        <Text style={[type.caption, { color: colors.gold, fontFamily: fonts.sansSemiBold }]}>
          {actionLabel} →
        </Text>
      </Pressable>
    )}
  </View>
);

// ============================================================================
// Avaliação com Estrelas Douradas
// ============================================================================
export const StarRating: React.FC<{
  rating: number;
  count?: number;
  size?: number;
}> = ({ rating, count, size = 13 }) => (
  <View style={styles.ratingRow}>
    <Ionicons name="star" size={size} color={colors.gold} />
    <Text style={[styles.ratingScore, { fontSize: size + 1 }]}>{rating.toFixed(1)}</Text>
    {count !== undefined && <Text style={styles.ratingCount}>({count})</Text>}
  </View>
);

// ============================================================================
// Estilos
// ============================================================================
const styles = StyleSheet.create({
  buttonBase: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    overflow: 'hidden',
  },
  buttonContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.gold,
  },
  buttonSubtle: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  buttonTobacco: {
    backgroundColor: colors.tobacco,
  },
  buttonText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 14,
    letterSpacing: 0.2,
  },
  pressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.45,
  },
  card: {
    borderRadius: radius.lg,
    padding: spacing.lg,
    overflow: 'hidden',
  },
  goldBorder: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardPressed: {
    borderColor: colors.gold,
    opacity: 0.94,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  badgeMd: {
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  badgeGold: {
    backgroundColor: 'rgba(212, 175, 55, 0.12)',
    borderColor: 'rgba(212, 175, 55, 0.35)',
  },
  badgeTobacco: {
    backgroundColor: 'rgba(140, 90, 60, 0.18)',
    borderColor: 'rgba(140, 90, 60, 0.4)',
  },
  badgeOutline: {
    backgroundColor: 'transparent',
    borderColor: colors.borderSubtle,
  },
  badgeText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: spacing.xl,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
  },
  dividerDiamond: {
    width: 6,
    height: 6,
    backgroundColor: colors.gold,
    transform: [{ rotate: '45deg' }],
    marginHorizontal: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingScore: {
    color: colors.gold,
    fontFamily: fonts.sansBold,
    marginLeft: 4,
  },
  ratingCount: {
    color: colors.textMuted,
    fontFamily: fonts.sans,
    fontSize: 12,
    marginLeft: 3,
  },
});

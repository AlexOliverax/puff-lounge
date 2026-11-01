/**
 * Card de Local (Venue Card) refinado e interativo.
 * Apresenta foto de alta definição, categoria, badges, avaliação, distância e ações rápidas.
 */
import React from 'react';
import {
  Image,
  Pressable,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, StarRating } from './ui';
import { CATEGORY_META } from '../data/amenities';
import { distanceKm, formatDistance, isOpenNow, priceLabel, todayHoursLabel } from '../lib/geo';
import { useExploreStore } from '../store/useExploreStore';
import { useUserStore } from '../store/useUserStore';
import { colors, fonts, radius, shadows, spacing, type } from '../theme';
import { Venue } from '../types';

interface VenueCardProps {
  venue: Venue;
  style?: StyleProp<ViewStyle>;
}

export const VenueCard: React.FC<VenueCardProps> = ({ venue, style }) => {
  const router = useRouter();
  const { userLocation } = useExploreStore();
  const { favoriteVenueIds, toggleFavoriteVenue } = useUserStore();

  const isFav = favoriteVenueIds.includes(venue.id);
  const open = isOpenNow(venue.hours);
  const dist = distanceKm(userLocation, venue.coords);
  const categoryMeta = CATEGORY_META[venue.category];

  const handlePress = () => {
    router.push({
      pathname: '/venue/[id]',
      params: { id: venue.id },
    });
  };

  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.cardContainer,
        shadows.card,
        pressed && styles.pressed,
        style,
      ]}
    >
      {/* Imagem de Capa com Gradiente */}
      <View style={styles.imageWrapper}>
        <Image source={venue.images[0]} style={styles.coverImage} resizeMode="cover" />
        <LinearGradient
          colors={['rgba(15, 14, 14, 0.2)', 'transparent', 'rgba(15, 14, 14, 0.95)']}
          style={StyleSheet.absoluteFill}
        />

        {/* Categoria Flutuante */}
        <View style={styles.topBadgesRow}>
          <Badge
            label={categoryMeta.short}
            variant="gold"
            icon={categoryMeta.icon as any}
            size="md"
          />
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              toggleFavoriteVenue(venue.id);
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.favButton, pressed && { opacity: 0.7 }]}
          >
            <Ionicons
              name={isFav ? 'bookmark' : 'bookmark-outline'}
              size={18}
              color={isFav ? colors.gold : colors.text}
            />
          </Pressable>
        </View>

        {/* Status de Aberto / Distância sobre a imagem */}
        <View style={styles.imageBottomRow}>
          <View style={styles.openStatusTag}>
            <View
              style={[
                styles.openDot,
                { backgroundColor: open ? colors.success : colors.danger },
              ]}
            />
            <Text style={styles.openStatusText}>{open ? 'Aberto agora' : 'Fechado'}</Text>
          </View>
          <View style={styles.distanceTag}>
            <Ionicons name="navigate-outline" size={12} color={colors.gold} />
            <Text style={styles.distanceText}>{formatDistance(dist)}</Text>
          </View>
        </View>
      </View>

      {/* Conteúdo do Card */}
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.venueName} numberOfLines={1}>
            {venue.name}
          </Text>
          <Text style={styles.priceLevel}>{priceLabel(venue.priceLevel)}</Text>
        </View>

        <Text style={styles.neighborhood}>
          {venue.neighborhood} · {venue.city}, {venue.state}
        </Text>

        <Text style={styles.tagline} numberOfLines={2}>
          {venue.tagline}
        </Text>

        {/* Rodapé: Avaliação e Horário */}
        <View style={styles.footerRow}>
          <StarRating rating={venue.rating} count={venue.reviewsCount} />
          <Text style={styles.hoursText} numberOfLines={1}>
            {todayHoursLabel(venue)}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.lg,
  },
  pressed: {
    opacity: 0.94,
    borderColor: colors.gold,
  },
  imageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: colors.surfaceAlt,
    position: 'relative',
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  topBadgesRow: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  favButton: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 14, 14, 0.65)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageBottomRow: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  openStatusTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 14, 14, 0.8)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  openStatusText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.text,
  },
  distanceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 14, 14, 0.8)',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
  },
  distanceText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
    marginLeft: 4,
  },
  content: {
    padding: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  venueName: {
    flex: 1,
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.text,
    marginRight: 8,
  },
  priceLevel: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: colors.gold,
    letterSpacing: 1,
  },
  neighborhood: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.goldSoft,
    marginTop: 2,
  },
  tagline: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  hoursText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    maxWidth: '55%',
  },
});

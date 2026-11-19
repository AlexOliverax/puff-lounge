/**
 * Tela de Detalhes do Local (Venue Detail Page)
 * Carrossel de fotos HD responsivo, rotas diretas (Google Maps / Waze / Apple Maps),
 * ligação, Instagram, compartilhamento, comodidades, dress code e marcas da casa.
 */
import React, { useEffect, useState } from 'react';
import {
  Image,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Badge, Button, Card, GoldDivider, StarRating } from '../../src/components/ui';
import { AMENITY_MAP, CATEGORY_META, WEEKDAYS } from '../../src/data/amenities';
import { BRANDS } from '../../src/data/brands';
import { distanceKm, formatDistance, isOpenNow, priceLabel } from '../../src/lib/geo';
import {
  callVenue,
  openInstagram,
  openRoute,
  openWebsite,
  shareVenue,
} from '../../src/lib/links';
import { hydrateDiscoveredCache, resolveVenueById } from '../../src/services/nearbyVenues';
import { useExploreStore } from '../../src/store/useExploreStore';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, fonts, radius, spacing, type } from '../../src/theme';

export default function VenueDetailScreen() {
  const router = useRouter();
  const { width: windowWidth } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { userLocation, nearbyVenues } = useExploreStore();
  const { favoriteVenueIds, toggleFavoriteVenue } = useUserStore();
  const [, setCacheLoaded] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  useEffect(() => {
    hydrateDiscoveredCache().then(() => setCacheLoaded(true));
  }, []);

  const venue =
    resolveVenueById(id) || nearbyVenues.find((v) => v.id === id);

  if (!venue) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={type.h2}>Local não encontrado</Text>
        <Button label="Voltar" variant="gold" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const isFav = favoriteVenueIds.includes(venue.id);
  const open = isOpenNow(venue.hours);
  const dist = distanceKm(userLocation, venue.coords);
  const categoryMeta = CATEGORY_META[venue.category];
  const carouselWidth = Math.min(windowWidth, 820);

  const handleShare = async () => {
    const res = await shareVenue(venue);
    if (res === 'copied') {
      setShareFeedback('Link copiado para compartilhar!');
      setTimeout(() => setShareFeedback(null), 2800);
    }
  };

  return (
    <View style={styles.container}>
      {/* Barra Flutuante de Voltar, Compartilhar e Salvar */}
      <View style={styles.floatingNav}>
        <Pressable onPress={() => router.back()} style={styles.circleBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>

        <View style={styles.floatingRightGroup}>
          <Pressable onPress={handleShare} style={styles.circleBtn}>
            <Ionicons name="share-social-outline" size={19} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => toggleFavoriteVenue(venue.id)} style={styles.circleBtn}>
            <Ionicons
              name={isFav ? 'bookmark' : 'bookmark-outline'}
              size={20}
              color={isFav ? colors.gold : colors.text}
            />
          </Pressable>
        </View>
      </View>

      {shareFeedback && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#0F0E0E" />
          <Text style={styles.toastText}>{shareFeedback}</Text>
        </View>
      )}

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.centeredShell}>
          {/* Carrossel de Imagens HD com Gradiente */}
          <View style={styles.carouselContainer}>
            <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
              {venue.images.map((img, idx) => (
                <Image
                  key={idx}
                  source={img}
                  style={[styles.carouselImage, { width: carouselWidth }]}
                  resizeMode="cover"
                />
              ))}
            </ScrollView>
            <LinearGradient
              colors={['rgba(15,14,14,0.45)', 'transparent', '#0F0E0E']}
              style={StyleSheet.absoluteFill}
              pointerEvents="none"
            />
          </View>

          {/* Informações Principais */}
          <View style={styles.bodyContent}>
            <View style={styles.badgeRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Badge
                  label={categoryMeta.label}
                  variant="gold"
                  icon={categoryMeta.icon as any}
                  size="md"
                />
                {venue.isCurated !== false && (
                  <Badge label="Curadoria Oficial" variant="outline" icon="sparkles" />
                )}
              </View>
              <Text style={styles.priceTag}>{priceLabel(venue.priceLevel)}</Text>
            </View>

            <Text style={styles.venueTitle}>{venue.name}</Text>
            <Text style={styles.tagline}>{venue.tagline}</Text>

            <View style={styles.metaRow}>
              <StarRating rating={venue.rating} count={venue.reviewsCount} size={15} />
              <View style={styles.metaDivider} />
              <View style={styles.openIndicator}>
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: open ? colors.success : colors.danger },
                  ]}
                />
                <Text style={styles.openLabel}>{open ? 'Aberto agora' : 'Fechado'}</Text>
              </View>
              <View style={styles.metaDivider} />
              <Text style={styles.distanceLabel}>{formatDistance(dist)} de você</Text>
            </View>

            {/* Destaques (Highlights) */}
            <View style={styles.highlightsBox}>
              {venue.highlights.map((h) => (
                <View key={h} style={styles.highlightItem}>
                  <Ionicons
                    name="checkmark-circle"
                    size={16}
                    color={colors.gold}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={styles.highlightText}>{h}</Text>
                </View>
              ))}
            </View>

            {/* Botões de Navegação GPS (Google Maps & Waze) */}
            <Text style={styles.sectionHeader}>NAVEGAÇÃO & CONTATO DIRETO</Text>
            <View style={styles.actionButtonsRow}>
              <Button
                label="Google Maps"
                icon="navigate"
                variant="gold"
                onPress={() => openRoute('google', venue)}
                style={{ flex: 1 }}
              />
              <Button
                label="Waze"
                icon="car-sport-outline"
                variant="outline"
                onPress={() => openRoute('waze', venue)}
                style={{ flex: 1 }}
              />
            </View>

            {/* Segunda linha: Ligar, Instagram, Site */}
            <View style={[styles.actionButtonsRow, { marginTop: spacing.sm }]}>
              {venue.phone ? (
                <Button
                  label="Ligar"
                  icon="call-outline"
                  variant="subtle"
                  size="sm"
                  onPress={() => callVenue(venue)}
                  style={{ flex: 1 }}
                />
              ) : null}
              {venue.instagram ? (
                <Button
                  label={venue.instagram}
                  icon="logo-instagram"
                  variant="subtle"
                  size="sm"
                  onPress={() => openInstagram(venue)}
                  style={{ flex: 1 }}
                />
              ) : null}
              {venue.website ? (
                <Button
                  label="Site Oficial"
                  icon="globe-outline"
                  variant="subtle"
                  size="sm"
                  onPress={() => openWebsite(venue)}
                  style={{ flex: 1 }}
                />
              ) : null}
            </View>

            <GoldDivider />

            {/* Descrição Editorial */}
            <Text style={styles.sectionHeader}>SOBRE O ESPAÇO</Text>
            <Text style={styles.descriptionText}>{venue.description}</Text>

            {/* Comodidades Disponíveis */}
            <Text style={styles.sectionHeader}>INFRAESTRUTURA & COMODIDADES</Text>
            <View style={styles.amenitiesGrid}>
              {venue.amenities.map((amenityId) => {
                const item = AMENITY_MAP[amenityId];
                if (!item) return null;
                return (
                  <View key={amenityId} style={styles.amenityItem}>
                    <Ionicons name={item.icon as any} size={18} color={colors.gold} />
                    <Text style={styles.amenityLabel}>{item.label}</Text>
                  </View>
                );
              })}
            </View>

            {/* Dress Code e Etiqueta */}
            <View style={styles.dressCodeCard}>
              <Ionicons
                name="shirt-outline"
                size={20}
                color={colors.gold}
                style={{ marginRight: 10 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.dressCodeTitle}>Dress Code & Recomendações</Text>
                <Text style={styles.dressCodeText}>{venue.dressCode}</Text>
              </View>
            </View>

            {/* Marcas de Charuto em Destaque na Casa */}
            {venue.houseBrands.length > 0 && (
              <>
                <Text style={styles.sectionHeader}>MARCAS EM DESTAQUE NO UMIDOR</Text>
                <View style={styles.brandsRow}>
                  {venue.houseBrands.map((bId) => {
                    const brand = BRANDS.find((b) => b.id === bId);
                    return (
                      <Card
                        key={bId}
                        onPress={() =>
                          brand &&
                          router.push({
                            pathname: '/brand/[id]',
                            params: { id: brand.id },
                          })
                        }
                        style={styles.brandChip}
                      >
                        <Text style={styles.brandChipName}>
                          {brand ? brand.name : bId}
                        </Text>
                        <Ionicons name="arrow-forward" size={14} color={colors.gold} />
                      </Card>
                    );
                  })}
                </View>
              </>
            )}

            {/* Horários de Funcionamento */}
            <Text style={styles.sectionHeader}>HORÁRIOS DE FUNCIONAMENTO</Text>
            <Card style={styles.hoursCard}>
              {venue.hours.map((h) => {
                const dayName = WEEKDAYS[h.day];
                const isToday = new Date().getDay() === h.day;
                return (
                  <View key={h.day} style={styles.hourRow}>
                    <Text style={[styles.hourDay, isToday && styles.hourToday]}>
                      {dayName} {isToday ? '(Hoje)' : ''}
                    </Text>
                    <Text style={[styles.hourTime, isToday && styles.hourToday]}>
                      {h.closed ? 'Fechado' : `${h.open} – ${h.close}`}
                    </Text>
                  </View>
                );
              })}
            </Card>

            {/* Endereço Completo */}
            <Text style={styles.sectionHeader}>ENDEREÇO & LOCALIZAÇÃO</Text>
            <Card style={styles.addressCard}>
              <View style={styles.addressRow}>
                <Ionicons name="location-outline" size={20} color={colors.gold} />
                <Text style={styles.addressText}>{venue.address}</Text>
              </View>
            </Card>

            <View style={{ height: 60 }} />
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredShell: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingNav: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 100,
    flexDirection: 'row',
    justifyContent: 'space-between',
    maxWidth: 790,
    alignSelf: 'center',
    width: '92%',
  },
  floatingRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  circleBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(15, 14, 14, 0.78)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 100 : 72,
    alignSelf: 'center',
    zIndex: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
  },
  toastText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: '#0F0E0E',
  },
  carouselContainer: {
    width: '100%',
    height: 310,
    position: 'relative',
  },
  carouselImage: {
    height: 310,
  },
  bodyContent: {
    paddingHorizontal: spacing.xl,
    marginTop: -20,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  priceTag: {
    fontFamily: fonts.sansBold,
    fontSize: 15,
    color: colors.gold,
    letterSpacing: 1,
  },
  venueTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: colors.text,
  },
  tagline: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.goldSoft,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginTop: spacing.md,
  },
  metaDivider: {
    width: 1,
    height: 12,
    backgroundColor: colors.borderSubtle,
    marginHorizontal: 10,
  },
  openIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  openLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
  },
  distanceLabel: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  highlightsBox: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: spacing.lg,
    gap: 6,
  },
  highlightItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  highlightText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.text,
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  sectionHeader: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  amenityLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
  },
  dressCodeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    marginTop: spacing.lg,
  },
  dressCodeTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 14,
    color: colors.text,
  },
  dressCodeText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 16,
  },
  brandsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  brandChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  brandChipName: {
    fontFamily: fonts.serifBold,
    fontSize: 13,
    color: colors.text,
    marginRight: 8,
  },
  hoursCard: {
    padding: spacing.md,
  },
  hourRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  hourDay: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  hourTime: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
  },
  hourToday: {
    fontFamily: fonts.sansBold,
    color: colors.gold,
  },
  addressCard: {
    padding: spacing.md,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addressText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.text,
    lineHeight: 19,
  },
});

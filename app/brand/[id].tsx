/**
 * Tela de Perfil e História da Marca (Brand Detail Page)
 * Origem, história dos mestres tabaqueiros, perfil aromático, vitolas emblemáticas
 * com botão de 1 toque para adicionar ao Meu Umidor e lista de Lounges onde encontrar.
 */
import React, { useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Button, Card, GoldDivider } from '../../src/components/ui';
import { BRANDS, ORIGIN_MAP, STRENGTH_META } from '../../src/data/brands';
import { VENUES } from '../../src/data/venues';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, fonts, radius, spacing, type } from '../../src/theme';

export default function BrandDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    favoriteBrandIds,
    toggleFavoriteBrand,
    addHumidorEntry,
  } = useUserStore();
  const [addedToast, setAddedToast] = useState<string | null>(null);

  const brand = BRANDS.find((b) => b.id === id);

  if (!brand) {
    return (
      <SafeAreaView style={styles.notFound}>
        <Text style={type.h2}>Marca não encontrada</Text>
        <Button label="Voltar" variant="gold" onPress={() => router.back()} style={{ marginTop: 16 }} />
      </SafeAreaView>
    );
  }

  const origin = ORIGIN_MAP[brand.origin];
  const strengthInfo = STRENGTH_META[brand.strength];
  const isFav = favoriteBrandIds.includes(brand.id);
  const partnerVenues = VENUES.filter((v) => v.houseBrands.includes(brand.id));

  const handleQuickAddHumidor = (vitolaName: string, ringGauge: number, lengthMm: number, status: 'provado' | 'desejo') => {
    addHumidorEntry({
      cigarName: `${brand.name} ${vitolaName}`,
      brandId: brand.id,
      vitola: `${vitolaName} (${ringGauge} × ${lengthMm} mm)`,
      status,
      rating: status === 'provado' ? 5 : undefined,
      quantity: 1,
      notes: `Notas da marca: ${brand.flavorProfile.slice(0, 3).join(', ')}.`,
    });
    setAddedToast(
      status === 'provado'
        ? `${brand.name} ${vitolaName} registrado como Degustado!`
        : `${brand.name} ${vitolaName} salvo na Lista de Desejos!`,
    );
    setTimeout(() => setAddedToast(null), 2600);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>{brand.name}</Text>
        <Pressable onPress={() => toggleFavoriteBrand(brand.id)} style={styles.backBtn}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={20}
            color={isFav ? colors.gold : colors.text}
          />
        </Pressable>
      </View>

      {addedToast && (
        <View style={styles.toastBanner}>
          <Ionicons name="checkmark-circle" size={16} color="#0F0E0E" />
          <Text style={styles.toastText}>{addedToast}</Text>
        </View>
      )}

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.centeredShell}>
          {/* Brasão Hero da Marca */}
          <View style={styles.heroBox}>
            <View style={[styles.monogramLarge, { borderColor: brand.accent }]}>
              <Text style={[styles.monogramTextLarge, { color: brand.accent }]}>
                {brand.monogram}
              </Text>
            </View>
            <Text style={styles.brandTitle}>{brand.name}</Text>
            <Text style={styles.tagline}>{brand.tagline}</Text>

            <View style={styles.pillsRow}>
              <Badge label={`Fundada em ${brand.founded}`} variant="gold" />
              <Badge
                label={`${origin.flag} ${origin.label}`}
                variant="muted"
                style={{ marginLeft: 6 }}
              />
              <Badge
                label={`Fortaleza: ${strengthInfo.label}`}
                variant="tobacco"
                style={{ marginLeft: 6 }}
              />
            </View>
          </View>

          <GoldDivider />

          {/* História & Mestres Tabaqueiros */}
          <Text style={styles.sectionHeader}>HISTÓRIA & HERANÇA</Text>
          {brand.history.map((paragraph, idx) => (
            <Text key={idx} style={styles.historyParagraph}>
              {paragraph}
            </Text>
          ))}

          <Card style={styles.foundersCard}>
            <View style={styles.founderRow}>
              <Ionicons
                name="person-outline"
                size={18}
                color={colors.gold}
                style={{ marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.founderLabel}>Fundador:</Text>
                <Text style={styles.founderVal}>{brand.founder}</Text>
              </View>
            </View>
            <View style={[styles.founderRow, { marginTop: spacing.sm }]}>
              <Ionicons
                name="sparkles-outline"
                size={18}
                color={colors.gold}
                style={{ marginRight: 8 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.founderLabel}>Master Blenders Históricos:</Text>
                <Text style={styles.founderVal}>{brand.masterBlenders.join(', ')}</Text>
              </View>
            </View>
          </Card>

          {/* Perfil Aromático & Terroir */}
          <Text style={styles.sectionHeader}>PERFIL AROMÁTICO & CAPA</Text>
          <Card style={{ marginBottom: spacing.md }}>
            <Text style={styles.wrapperLabel}>Capa Utilizada:</Text>
            <Text style={styles.wrapperVal}>{brand.wrapper}</Text>

            <Text style={[styles.wrapperLabel, { marginTop: spacing.md }]}>
              Notas Sensoriais Predominantes:
            </Text>
            <View style={styles.flavorRow}>
              {brand.flavorProfile.map((flavor) => (
                <Badge
                  key={flavor}
                  label={flavor}
                  variant="gold"
                  size="md"
                  style={{ marginRight: 6, marginTop: 6 }}
                />
              ))}
            </View>
          </Card>

          {/* Vitolas Famosas da Marca + Adicionar ao Umidor com 1 toque */}
          <Text style={styles.sectionHeader}>
            VITOLAS EMBLEMÁTICAS — SALVAR NO SEU UMIDOR
          </Text>
          <View style={styles.vitolasList}>
            {brand.famousVitolas.map((vitola) => (
              <Card key={vitola.name} style={styles.vitolaItem}>
                <View style={styles.vitolaItemHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.vitolaItemName}>{vitola.name}</Text>
                    <Text style={styles.vitolaItemDimensions}>
                      Cepo {vitola.ringGauge} · {vitola.lengthMm} mm
                    </Text>
                  </View>

                  <View style={styles.vitolaQuickBtns}>
                    <Pressable
                      onPress={() =>
                        handleQuickAddHumidor(
                          vitola.name,
                          vitola.ringGauge,
                          vitola.lengthMm,
                          'desejo',
                        )
                      }
                      style={styles.wishQuickBtn}
                    >
                      <Ionicons name="bookmark-outline" size={13} color={colors.gold} />
                      <Text style={styles.wishQuickText}>Desejo</Text>
                    </Pressable>

                    <Pressable
                      onPress={() =>
                        handleQuickAddHumidor(
                          vitola.name,
                          vitola.ringGauge,
                          vitola.lengthMm,
                          'provado',
                        )
                      }
                      style={styles.tastedQuickBtn}
                    >
                      <Ionicons name="checkmark-circle-outline" size={13} color="#0F0E0E" />
                      <Text style={styles.tastedQuickText}>Degustei</Text>
                    </Pressable>
                  </View>
                </View>
                {vitola.notes && (
                  <Text style={styles.vitolaItemNotes}>{vitola.notes}</Text>
                )}
              </Card>
            ))}
          </View>

          {/* Onde Encontrar esta Marca (Lounges & Tabacarias Parceiras) */}
          {partnerVenues.length > 0 && (
            <>
              <Text style={styles.sectionHeader}>
                ONDE ENCONTRAR {brand.name.toUpperCase()}
              </Text>
              <View style={styles.partnerVenuesList}>
                {partnerVenues.map((v) => (
                  <Card
                    key={v.id}
                    onPress={() =>
                      router.push({
                        pathname: '/venue/[id]',
                        params: { id: v.id },
                      })
                    }
                    style={styles.partnerVenueCard}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.partnerVenueName}>{v.name}</Text>
                      <Text style={styles.partnerVenueCity}>
                        {v.neighborhood} · {v.city}, {v.state}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color={colors.gold} />
                  </Card>
                ))}
              </View>
            </>
          )}

          {/* Curiosidade Histórica */}
          <View style={styles.curiosityCard}>
            <Ionicons
              name="information-circle-outline"
              size={20}
              color={colors.gold}
              style={{ marginRight: 8 }}
            />
            <View style={{ flex: 1 }}>
              <Text style={styles.curiosityCardTitle}>Você Sabia?</Text>
              <Text style={styles.curiosityCardBody}>{brand.curiosity}</Text>
            </View>
          </View>

          <View style={{ height: 60 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  centeredShell: {
    width: '100%',
    maxWidth: 780,
    alignSelf: 'center',
  },
  notFound: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  topBarTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.text,
  },
  toastBanner: {
    alignSelf: 'center',
    marginTop: spacing.sm,
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
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  heroBox: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  monogramLarge: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    marginBottom: spacing.md,
  },
  monogramTextLarge: {
    fontFamily: fonts.serifBold,
    fontSize: 32,
  },
  brandTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 28,
    color: colors.text,
    textAlign: 'center',
  },
  tagline: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    color: colors.goldSoft,
    textAlign: 'center',
    marginTop: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  sectionHeader: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.5,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  historyParagraph: {
    fontFamily: fonts.sans,
    fontSize: 14,
    lineHeight: 22,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  foundersCard: {
    marginVertical: spacing.sm,
    backgroundColor: colors.surfaceAlt,
  },
  founderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  founderLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.goldSoft,
  },
  founderVal: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.text,
    marginTop: 1,
  },
  wrapperLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.goldSoft,
  },
  wrapperVal: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.text,
    marginTop: 2,
  },
  flavorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  vitolasList: {
    gap: spacing.sm,
  },
  vitolaItem: {
    backgroundColor: colors.surface,
  },
  vitolaItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  vitolaItemName: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    color: colors.text,
  },
  vitolaItemDimensions: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 2,
  },
  vitolaQuickBtns: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  wishQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceAlt,
  },
  wishQuickText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
  },
  tastedQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 9,
    borderRadius: radius.pill,
    backgroundColor: colors.gold,
  },
  tastedQuickText: {
    fontFamily: fonts.sansBold,
    fontSize: 11,
    color: '#0F0E0E',
  },
  vitolaItemNotes: {
    fontFamily: fonts.serifItalic,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 6,
  },
  partnerVenuesList: {
    gap: spacing.sm,
  },
  partnerVenueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  partnerVenueName: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    color: colors.text,
  },
  partnerVenueCity: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 2,
  },
  curiosityCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderLeftWidth: 3,
    borderLeftColor: colors.gold,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xl,
  },
  curiosityCardTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 14,
    color: colors.gold,
    marginBottom: 2,
  },
  curiosityCardBody: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
});

/**
 * Aba 2: ENCICLOPÉDIA ("Arte & Terroir")
 * Diretório de Marcas por Origem, Anatomia do Charuto, Vitolas, Rituais e Curiosidades.
 */
import React, { useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, GoldDivider } from '../../src/components/ui';
import { BRANDS, ORIGINS } from '../../src/data/brands';
import { ANATOMY, CURIOSITIES, CUTS, LIGHTING, LIGHTING_STEPS, VITOLAS } from '../../src/data/culture';
import { colors, fonts, radius, shadows, spacing, type } from '../../src/theme';
import { OriginId } from '../../src/types';

type EncyclopediaSection = 'marcas' | 'anatomia' | 'vitolas' | 'rituais' | 'curiosidades';

export default function EncyclopediaScreen() {
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<EncyclopediaSection>('marcas');
  const [selectedOrigin, setSelectedOrigin] = useState<OriginId | 'all'>('all');

  const filteredBrands =
    selectedOrigin === 'all'
      ? BRANDS
      : BRANDS.filter((b) => b.origin === selectedOrigin);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <Text style={type.overline}>CULTURA & TRADIÇÃO</Text>
        <Text style={styles.title}>Enciclopédia</Text>
      </View>

      {/* Seletor Horizontal de Seções */}
      <View style={styles.sectionsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sectionsContent}>
          {[
            { id: 'marcas', label: 'Marcas & Origens' },
            { id: 'anatomia', label: 'Anatomia' },
            { id: 'vitolas', label: 'Vitolas & Tamanhos' },
            { id: 'rituais', label: 'Cortes & Acendimento' },
            { id: 'curiosidades', label: 'Curiosidades' },
          ].map((sec) => {
            const active = activeSection === sec.id;
            return (
              <Pressable
                key={sec.id}
                onPress={() => setActiveSection(sec.id as any)}
                style={[styles.sectionTab, active && styles.sectionTabActive]}
              >
                <Text style={[styles.sectionTabText, active && styles.sectionTabTextActive]}>
                  {sec.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Conteúdo Dinâmico Conforme Seção */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ========================================================================= */}
        {/* SEÇÃO 1: MARCAS & ORIGENS */}
        {/* ========================================================================= */}
        {activeSection === 'marcas' && (
          <View style={styles.tabContent}>
            {/* Seletor de Terroirs / Origens */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.originRow}>
              <Pressable
                onPress={() => setSelectedOrigin('all')}
                style={[styles.originChip, selectedOrigin === 'all' && styles.originChipActive]}
              >
                <Text style={[styles.originChipText, selectedOrigin === 'all' && styles.originChipTextActive]}>
                  Todas as Origens
                </Text>
              </Pressable>
              {ORIGINS.map((o) => {
                const active = selectedOrigin === o.id;
                return (
                  <Pressable
                    key={o.id}
                    onPress={() => setSelectedOrigin(o.id)}
                    style={[styles.originChip, active && styles.originChipActive]}
                  >
                    <Text style={styles.originFlag}>{o.flag}</Text>
                    <Text style={[styles.originChipText, active && styles.originChipTextActive]}>
                      {o.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Lista de Marcas */}
            <View style={styles.brandsGrid}>
              {filteredBrands.map((brand) => (
                <Card
                  key={brand.id}
                  onPress={() =>
                    router.push({
                      pathname: '/brand/[id]',
                      params: { id: brand.id },
                    })
                  }
                  style={styles.brandCard}
                >
                  <View style={styles.brandTopRow}>
                    <View style={[styles.brandMonogram, { borderColor: brand.accent }]}>
                      <Text style={[styles.brandMonogramText, { color: brand.accent }]}>
                        {brand.monogram}
                      </Text>
                    </View>
                    <Badge label={`Desde ${brand.founded}`} variant="gold" />
                  </View>

                  <Text style={styles.brandName}>{brand.name}</Text>
                  <Text style={styles.brandRegion}>{brand.region}</Text>
                  <Text style={styles.brandTagline} numberOfLines={2}>
                    {brand.tagline}
                  </Text>

                  {/* Notas de Sabor Rápidas */}
                  <View style={styles.flavorTagsRow}>
                    {brand.flavorProfile.slice(0, 3).map((f) => (
                      <Badge key={f} label={f} variant="muted" style={{ marginRight: 4, marginTop: 4 }} />
                    ))}
                  </View>
                </Card>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* SEÇÃO 2: ANATOMIA DO CHARUTO */}
        {/* ========================================================================= */}
        {activeSection === 'anatomia' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Estrutura e Construção</Text>
            <Text style={styles.sectionSubtitle}>
              O charuto premium é composto 100% de folhas de tabaco inteiras enroladas artesanalmente
              (Long Filler / Totalmente a Mano).
            </Text>

            {ANATOMY.map((part) => (
              <Card key={part.id} style={{ marginBottom: spacing.md }}>
                <View style={styles.anatomyHeaderRow}>
                  <Text style={styles.anatomyName}>{part.name}</Text>
                  <Text style={styles.anatomySubtitle}>{part.subtitle}</Text>
                </View>
                <Text style={styles.anatomyDescription}>{part.description}</Text>

                {part.details && (
                  <View style={styles.anatomyDetailsList}>
                    {part.details.map((d) => (
                      <View key={d.name} style={styles.anatomyDetailItem}>
                        <Text style={styles.anatomyDetailName}>{d.name}:</Text>
                        <Text style={styles.anatomyDetailText}>{d.text}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* ========================================================================= */}
        {/* SEÇÃO 3: VITOLAS & TAMANHOS */}
        {/* ========================================================================= */}
        {activeSection === 'vitolas' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Vitolas de Galera</Text>
            <Text style={styles.sectionSubtitle}>
              O calibre (ring gauge / cepo) é medido em 64 avos de polegada. O formato influencia
              diretamente a temperatura da fumaça e o tempo de degustação.
            </Text>

            {VITOLAS.map((vitola) => (
              <Card key={vitola.id} style={{ marginBottom: spacing.md }}>
                <View style={styles.vitolaTopRow}>
                  <View>
                    <Text style={styles.vitolaName}>{vitola.name}</Text>
                    <Text style={styles.vitolaSpecs}>
                      Cepo {vitola.ringGauge} · {vitola.lengthMm} mm ({vitola.lengthIn})
                    </Text>
                  </View>
                  <Badge
                    label={`${vitola.smokeTimeMin[0]}–${vitola.smokeTimeMin[1]} min`}
                    variant="gold"
                    icon="time-outline"
                  />
                </View>

                <Text style={styles.vitolaDescription}>{vitola.description}</Text>

                <View style={styles.vitolaOccasionBox}>
                  <Ionicons name="sparkles-outline" size={14} color={colors.gold} />
                  <Text style={styles.vitolaOccasionText}>
                    Momento ideal: {vitola.occasion}
                  </Text>
                </View>
              </Card>
            ))}
          </View>
        )}

        {/* ========================================================================= */}
        {/* SEÇÃO 4: RITUAIS & ACENDIMENTO */}
        {/* ========================================================================= */}
        {activeSection === 'rituais' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>A Arte do Corte</Text>
            <Text style={styles.sectionSubtitle}>
              O corte correto garante tiragem perfeita sem desfiar a capa.
            </Text>

            {CUTS.map((c) => (
              <Card key={c.id} style={{ marginBottom: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name={c.icon as any} size={20} color={colors.gold} style={{ marginRight: 8 }} />
                  <Text style={styles.anatomyName}>{c.name}</Text>
                </View>
                <Text style={styles.anatomyDescription}>{c.description}</Text>
                <Text style={styles.bestForText}>Recomendado para: {c.bestFor}</Text>
              </Card>
            ))}

            <GoldDivider />

            <Text style={styles.sectionTitle}>Passo a Passo do Acendimento</Text>
            {LIGHTING_STEPS.map((step, idx) => (
              <View key={step.title} style={styles.stepRow}>
                <View style={styles.stepNumberBadge}>
                  <Text style={styles.stepNumberText}>{idx + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.stepTitle}>{step.title}</Text>
                  <Text style={styles.stepText}>{step.text}</Text>
                </View>
              </View>
            ))}

            <View style={{ height: 20 }} />
          </View>
        )}

        {/* ========================================================================= */}
        {/* SEÇÃO 5: CURIOSIDADES */}
        {/* ========================================================================= */}
        {activeSection === 'curiosidades' && (
          <View style={styles.tabContent}>
            <Text style={styles.sectionTitle}>Fatos & História</Text>
            <Text style={styles.sectionSubtitle}>
              Crônicas e tradições preservadas através dos séculos nos maiores polos de charutaria.
            </Text>

            {CURIOSITIES.map((cur) => (
              <Card key={cur.id} style={{ marginBottom: spacing.md }}>
                <Badge label={cur.category.toUpperCase()} variant="gold" style={{ alignSelf: 'flex-start', marginBottom: 6 }} />
                <Text style={styles.curiosityTitle}>{cur.title}</Text>
                <Text style={styles.curiositySummary}>{cur.summary}</Text>
                <Text style={styles.curiosityBody}>{cur.body}</Text>
              </Card>
            ))}
          </View>
        )}

        <View style={{ height: 60 }} />
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
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 26,
    color: colors.text,
    marginTop: 2,
  },
  sectionsBar: {
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  sectionsContent: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  sectionTab: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: 'transparent',
  },
  sectionTabActive: {
    backgroundColor: colors.gold,
  },
  sectionTabText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  sectionTabTextActive: {
    color: '#0F0E0E',
    fontFamily: fonts.sansBold,
  },
  container: {
    flex: 1,
  },
  tabContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  originRow: {
    marginBottom: spacing.lg,
  },
  originChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: spacing.sm,
  },
  originChipActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  originFlag: {
    fontSize: 14,
    marginRight: 6,
  },
  originChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  originChipTextActive: {
    color: colors.gold,
    fontFamily: fonts.sansBold,
  },
  brandsGrid: {
    gap: spacing.md,
  },
  brandCard: {
    marginBottom: spacing.sm,
  },
  brandTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  brandMonogram: {
    width: 38,
    height: 38,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  brandMonogramText: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
  },
  brandName: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: colors.text,
  },
  brandRegion: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 2,
  },
  brandTagline: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 18,
  },
  flavorTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  anatomyHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  anatomyName: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.gold,
  },
  anatomySubtitle: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textMuted,
  },
  anatomyDescription: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
  anatomyDetailsList: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  anatomyDetailItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  anatomyDetailName: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.goldSoft,
    width: 70,
  },
  anatomyDetailText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  vitolaTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  vitolaName: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.text,
  },
  vitolaSpecs: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 2,
  },
  vitolaDescription: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
  },
  vitolaOccasionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.md,
  },
  vitolaOccasionText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.gold,
    marginLeft: 6,
  },
  bestForText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 6,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  stepNumberBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  stepNumberText: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#0F0E0E',
  },
  stepTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 15,
    color: colors.text,
  },
  stepText: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  curiosityTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    color: colors.text,
    marginTop: 2,
  },
  curiositySummary: {
    fontFamily: fonts.serifItalic,
    fontSize: 13,
    color: colors.goldSoft,
    marginTop: 2,
    marginBottom: 6,
  },
  curiosityBody: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 19,
  },
});

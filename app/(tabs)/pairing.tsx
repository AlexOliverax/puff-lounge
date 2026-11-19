/**
 * Aba 3: HARMONIZAÇÃO (Pairing Guide & Sommelier Interativo)
 * Whiskies, Rums & Cachaças, Cognacs, Cafés Especiais e Vinhos combinados com a fortaleza do charuto,
 * incluindo busca por rótulo/nota e recomendação direta de Marcas e Vitolas compatíveis.
 */
import React, { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card } from '../../src/components/ui';
import { BRANDS, ORIGIN_MAP, STRENGTH_META } from '../../src/data/brands';
import { VITOLAS } from '../../src/data/culture';
import { PAIRING_CATEGORIES, PAIRINGS } from '../../src/data/pairings';
import { normalize } from '../../src/lib/search';
import { colors, fonts, radius, spacing, type } from '../../src/theme';
import { PairingCategory, Strength } from '../../src/types';

export default function PairingScreen() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<PairingCategory | 'all'>('all');
  const [selectedStrength, setSelectedStrength] = useState<Strength | 'all'>('all');
  const [query, setQuery] = useState('');

  const q = normalize(query.trim());

  const filteredPairings = useMemo(() => {
    return PAIRINGS.filter((p) => {
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (selectedStrength !== 'all' && !p.strengthMatch.includes(selectedStrength)) {
        return false;
      }
      if (!q) return true;
      const hay = normalize(`${p.name} ${p.notes} ${p.why} ${p.examples.join(' ')}`);
      return hay.includes(q);
    });
  }, [selectedCategory, selectedStrength, q]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topShell}>
        <View style={styles.header}>
          <Text style={type.overline}>ARTE DO PALADAR</Text>
          <Text style={styles.title}>Harmonização</Text>
        </View>

        {/* Busca de Bebidas, Rótulos ou Notas Sensoriais */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={17} color={colors.gold} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar bebida, rótulo (ex: Macallan, Zacapa) ou aroma..."
              placeholderTextColor={colors.textMuted}
              value={query}
              onChangeText={setQuery}
            />
            {query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.centeredContent}>
          {/* Banner Informativo */}
          <View style={styles.bannerCard}>
            <Text style={styles.bannerQuote}>
              {'\u201CO casamento perfeito não mascara o charuto nem anula a bebida; revela dimensões ocultas em ambos.\u201D'}
            </Text>
          </View>

          {/* Filtro por Categoria de Bebida */}
          <Text style={styles.sectionLabel}>TIPO DE BEBIDA</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
            <Pressable
              onPress={() => setSelectedCategory('all')}
              style={[
                styles.categoryChip,
                selectedCategory === 'all' && styles.categoryChipActive,
              ]}
            >
              <Text
                style={[
                  styles.categoryChipText,
                  selectedCategory === 'all' && styles.categoryChipTextActive,
                ]}
              >
                Todas
              </Text>
            </Pressable>
            {PAIRING_CATEGORIES.map((c) => {
              const active = selectedCategory === c.id;
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setSelectedCategory(c.id)}
                  style={[styles.categoryChip, active && styles.categoryChipActive]}
                >
                  <Ionicons
                    name={c.icon as any}
                    size={14}
                    color={active ? '#0F0E0E' : colors.gold}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[styles.categoryChipText, active && styles.categoryChipTextActive]}
                  >
                    {c.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Filtro por Força / Fortaleza do Charuto */}
          <Text style={styles.sectionLabel}>FORTALEZA DO CHARUTO</Text>
          <View style={styles.strengthRow}>
            {[
              { id: 'all', label: 'Todas as Forças' },
              { id: 'suave', label: 'Suave' },
              { id: 'medio', label: 'Médio' },
              { id: 'forte', label: 'Forte / Intenso' },
            ].map((st) => {
              const active = selectedStrength === st.id;
              return (
                <Pressable
                  key={st.id}
                  onPress={() => setSelectedStrength(st.id as any)}
                  style={[styles.strengthChip, active && styles.strengthChipActive]}
                >
                  <Text
                    style={[styles.strengthChipText, active && styles.strengthChipTextActive]}
                  >
                    {st.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Lista de Recomendações de Harmonização */}
          <View style={styles.pairingsList}>
            {filteredPairings.map((pair) => {
              const matchingVitolas = VITOLAS.filter((v) =>
                v.pairingIds.includes(pair.id),
              );
              const matchingBrands = BRANDS.filter((b) =>
                pair.strengthMatch.includes(b.strength),
              ).slice(0, 4);

              return (
                <Card key={pair.id} style={styles.pairingCard}>
                  <View style={styles.pairHeaderRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.pairName}>{pair.name}</Text>
                      <Text style={styles.pairNotes}>{pair.notes}</Text>
                    </View>
                    <View style={styles.strengthBadges}>
                      {pair.strengthMatch.map((s) => (
                        <Badge
                          key={s}
                          label={STRENGTH_META[s].label.toUpperCase()}
                          variant="gold"
                          style={{ marginBottom: 4 }}
                        />
                      ))}
                    </View>
                  </View>

                  <View style={styles.whyBox}>
                    <Ionicons
                      name="sparkles"
                      size={14}
                      color={colors.gold}
                      style={{ marginRight: 6, marginTop: 2 }}
                    />
                    <Text style={styles.whyText}>{pair.why}</Text>
                  </View>

                  <View style={styles.examplesRow}>
                    <Text style={styles.examplesTitle}>Rótulos Recomendados:</Text>
                    {pair.examples.map((ex) => (
                      <Text key={ex} style={styles.exampleItem}>
                        • {ex}
                      </Text>
                    ))}
                  </View>

                  {/* Vitolas Ideais */}
                  {matchingVitolas.length > 0 && (
                    <View style={styles.sommelierSection}>
                      <Text style={styles.sommelierLabel}>FORMATOS IDEAIS:</Text>
                      <View style={styles.pillsWrap}>
                        {matchingVitolas.map((v) => (
                          <Badge
                            key={v.id}
                            label={`${v.name} (${v.ringGauge}×${v.lengthMm}mm)`}
                            variant="outline"
                          />
                        ))}
                      </View>
                    </View>
                  )}

                  {/* Marcas Sugeridas pelo Sommelier (Clicáveis) */}
                  {matchingBrands.length > 0 && (
                    <View style={styles.sommelierSection}>
                      <Text style={styles.sommelierLabel}>
                        SUGESTÃO DE MARCAS PARA HARMONIZAR:
                      </Text>
                      <View style={styles.pillsWrap}>
                        {matchingBrands.map((b) => (
                          <Pressable
                            key={b.id}
                            onPress={() =>
                              router.push({
                                pathname: '/brand/[id]',
                                params: { id: b.id },
                              })
                            }
                            style={styles.brandLinkChip}
                          >
                            <Text style={styles.brandLinkFlag}>
                              {ORIGIN_MAP[b.origin].flag}
                            </Text>
                            <Text style={styles.brandLinkName}>{b.name}</Text>
                            <Ionicons name="chevron-forward" size={12} color={colors.gold} />
                          </Pressable>
                        ))}
                      </View>
                    </View>
                  )}
                </Card>
              );
            })}
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
  topShell: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  centeredContent: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 26,
    color: colors.text,
    marginTop: 2,
  },
  searchWrap: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    height: 40,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.text,
  },
  container: {
    flex: 1,
  },
  bannerCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginVertical: spacing.md,
  },
  bannerQuote: {
    fontFamily: fonts.serifItalic,
    fontSize: 14,
    lineHeight: 20,
    color: colors.goldSoft,
    textAlign: 'center',
  },
  sectionLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.5,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: spacing.sm,
  },
  categoryChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  categoryChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  categoryChipTextActive: {
    color: '#0F0E0E',
    fontFamily: fonts.sansBold,
  },
  strengthRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  strengthChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  strengthChipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)',
    borderColor: colors.gold,
  },
  strengthChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  strengthChipTextActive: {
    color: colors.gold,
    fontFamily: fonts.sansBold,
  },
  pairingsList: {
    gap: spacing.md,
  },
  pairingCard: {
    marginBottom: spacing.sm,
  },
  pairHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  pairName: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.text,
  },
  pairNotes: {
    fontFamily: fonts.serifItalic,
    fontSize: 13,
    color: colors.goldSoft,
    marginTop: 2,
  },
  strengthBadges: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  whyBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surfaceAlt,
    padding: spacing.md,
    borderRadius: radius.md,
    marginVertical: spacing.md,
    borderLeftWidth: 2,
    borderLeftColor: colors.gold,
  },
  whyText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.text,
  },
  examplesRow: {
    marginTop: spacing.xs,
  },
  examplesTitle: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.gold,
    marginBottom: 4,
  },
  exampleItem: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  sommelierSection: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  sommelierLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1.2,
    color: colors.goldSoft,
    marginBottom: 6,
  },
  pillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  brandLinkChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  brandLinkFlag: {
    fontSize: 12,
  },
  brandLinkName: {
    fontFamily: fonts.serifBold,
    fontSize: 12,
    color: colors.text,
  },
});

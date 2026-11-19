/**
 * Aba 2: ENCICLOPÉDIA ("Arte & Terroir")
 * Busca Global, Diretório de Marcas por Origem & Terroir, Anatomia do Charuto,
 * Vitolas com Escala Visual Proporcional, Cortes (Prós/Contras), Métodos de Acendimento e Curiosidades.
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
import { Badge, Card, GoldDivider } from '../../src/components/ui';
import { BRANDS, ORIGIN_MAP, ORIGINS, STRENGTH_META } from '../../src/data/brands';
import {
  ANATOMY,
  CURIOSITIES,
  CUTS,
  LIGHTING,
  LIGHTING_STEPS,
  VITOLAS,
} from '../../src/data/culture';
import { PAIRINGS } from '../../src/data/pairings';
import { normalize } from '../../src/lib/search';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, fonts, radius, spacing, type } from '../../src/theme';
import { Curiosity, OriginId } from '../../src/types';

type EncyclopediaSection = 'marcas' | 'anatomia' | 'vitolas' | 'rituais' | 'curiosidades';

export default function EncyclopediaScreen() {
  const router = useRouter();
  const { favoriteBrandIds, toggleFavoriteBrand } = useUserStore();
  const [activeSection, setActiveSection] = useState<EncyclopediaSection>('marcas');
  const [selectedOrigin, setSelectedOrigin] = useState<OriginId | 'all'>('all');
  const [curiosityCat, setCuriosityCat] = useState<Curiosity['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const q = normalize(searchQuery.trim());

  const filteredBrands = useMemo(() => {
    return BRANDS.filter((b) => {
      if (selectedOrigin !== 'all' && b.origin !== selectedOrigin) return false;
      if (!q) return true;
      const hay = normalize(
        `${b.name} ${b.region} ${b.tagline} ${b.flavorProfile.join(' ')} ${b.famousVitolas
          .map((v) => v.name)
          .join(' ')}`,
      );
      return hay.includes(q);
    });
  }, [selectedOrigin, q]);

  const filteredVitolas = useMemo(() => {
    if (!q) return VITOLAS;
    return VITOLAS.filter((v) =>
      normalize(`${v.name} ${v.description} ${v.occasion}`).includes(q),
    );
  }, [q]);

  const filteredCuriosities = useMemo(() => {
    return CURIOSITIES.filter((c) => {
      if (curiosityCat !== 'all' && c.category !== curiosityCat) return false;
      if (!q) return true;
      return normalize(`${c.title} ${c.summary} ${c.body}`).includes(q);
    });
  }, [curiosityCat, q]);

  const activeOriginInfo = selectedOrigin !== 'all' ? ORIGIN_MAP[selectedOrigin] : null;

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topShell}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={type.overline}>CULTURA & TRADIÇÃO</Text>
          <Text style={styles.title}>Enciclopédia</Text>
        </View>

        {/* Barra de Pesquisa da Enciclopédia */}
        <View style={styles.searchWrap}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={17} color={colors.gold} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar marcas, vitolas, sabores ou termos..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery ? (
              <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>
        </View>

        {/* Seletor Horizontal de Seções */}
        <View style={styles.sectionsBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.sectionsContent}
          >
            {[
              { id: 'marcas', label: 'Marcas & Origens', icon: 'ribbon-outline' },
              { id: 'vitolas', label: 'Vitolas & Tamanhos', icon: 'resize-outline' },
              { id: 'anatomia', label: 'Anatomia', icon: 'layers-outline' },
              { id: 'rituais', label: 'Cortes & Acendimento', icon: 'flame-outline' },
              { id: 'curiosidades', label: 'Curiosidades', icon: 'book-outline' },
            ].map((sec) => {
              const active = activeSection === sec.id;
              return (
                <Pressable
                  key={sec.id}
                  onPress={() => setActiveSection(sec.id as EncyclopediaSection)}
                  style={[styles.sectionTab, active && styles.sectionTabActive]}
                >
                  <Ionicons
                    name={sec.icon as any}
                    size={14}
                    color={active ? '#0F0E0E' : colors.gold}
                    style={{ marginRight: 6 }}
                  />
                  <Text style={[styles.sectionTabText, active && styles.sectionTabTextActive]}>
                    {sec.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>

      {/* Conteúdo Dinâmico Conforme Seção */}
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.centeredContent}>
          {/* ========================================================================= */}
          {/* SEÇÃO 1: MARCAS & ORIGENS */}
          {/* ========================================================================= */}
          {activeSection === 'marcas' && (
            <View style={styles.tabContent}>
              {/* Seletor de Terroirs / Origens */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.originRow}
              >
                <Pressable
                  onPress={() => setSelectedOrigin('all')}
                  style={[
                    styles.originChip,
                    selectedOrigin === 'all' && styles.originChipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.originChipText,
                      selectedOrigin === 'all' && styles.originChipTextActive,
                    ]}
                  >
                    Todas ({BRANDS.length})
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
                      <Text
                        style={[
                          styles.originChipText,
                          active && styles.originChipTextActive,
                        ]}
                      >
                        {o.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {/* Card explicativo do Terroir quando uma origem é selecionada */}
              {activeOriginInfo && (
                <View style={styles.terroirCard}>
                  <View style={styles.terroirHeader}>
                    <Text style={styles.terroirFlag}>{activeOriginInfo.flag}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.terroirTitle}>{activeOriginInfo.label}</Text>
                      <Text style={styles.terroirRegion}>
                        Região principal: {activeOriginInfo.region}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.terroirBody}>{activeOriginInfo.terroir}</Text>
                </View>
              )}

              {/* Lista de Marcas */}
              <View style={styles.brandsGrid}>
                {filteredBrands.map((brand) => {
                  const origin = ORIGIN_MAP[brand.origin];
                  const strength = STRENGTH_META[brand.strength];
                  const isFav = favoriteBrandIds.includes(brand.id);

                  return (
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
                        <View style={styles.brandTopLeft}>
                          <View style={[styles.brandMonogram, { borderColor: brand.accent }]}>
                            <Text style={[styles.brandMonogramText, { color: brand.accent }]}>
                              {brand.monogram}
                            </Text>
                          </View>
                          <View style={{ marginLeft: 10 }}>
                            <Text style={styles.brandName}>{brand.name}</Text>
                            <Text style={styles.brandRegion}>
                              {origin.flag} {brand.region}
                            </Text>
                          </View>
                        </View>

                        <View style={styles.brandTopRight}>
                          <Badge label={`Desde ${brand.founded}`} variant="gold" />
                          <Pressable
                            onPress={(e) => {
                              e.stopPropagation();
                              toggleFavoriteBrand(brand.id);
                            }}
                            hitSlop={8}
                            style={styles.favBrandBtn}
                          >
                            <Ionicons
                              name={isFav ? 'heart' : 'heart-outline'}
                              size={18}
                              color={isFav ? colors.gold : colors.textSecondary}
                            />
                          </Pressable>
                        </View>
                      </View>

                      <Text style={styles.brandTagline} numberOfLines={2}>
                        {brand.tagline}
                      </Text>

                      {/* Fortaleza + Notas de Sabor Rápidas */}
                      <View style={styles.flavorTagsRow}>
                        <Badge
                          label={`Fortaleza: ${strength.label}`}
                          variant="tobacco"
                          style={{ marginRight: 6, marginTop: 4 }}
                        />
                        {brand.flavorProfile.slice(0, 4).map((f) => (
                          <Badge
                            key={f}
                            label={f}
                            variant="muted"
                            style={{ marginRight: 4, marginTop: 4 }}
                          />
                        ))}
                      </View>
                    </Card>
                  );
                })}
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
                O charuto premium é composto 100% de folhas de tabaco inteiras enroladas
                artesanalmente (Long Filler / Totalmente a Mano).
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
          {/* SEÇÃO 3: VITOLAS & TAMANHOS (COM ESCALA VISUAL PROPORCIONAL) */}
          {/* ========================================================================= */}
          {activeSection === 'vitolas' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Vitolas de Galera</Text>
              <Text style={styles.sectionSubtitle}>
                O calibre (ring gauge / cepo) é medido em 64 avos de polegada. O formato
                influencia diretamente a temperatura da fumaça e o tempo de degustação.
              </Text>

              {filteredVitolas.map((vitola) => {
                // Escala visual proporcional (máx 194 mm = 100% largura, cepo 38..60 = 12..24px altura)
                const widthPct = Math.min(100, Math.max(45, Math.round((vitola.lengthMm / 195) * 100)));
                const barHeight = Math.round(10 + ((vitola.ringGauge - 36) / 24) * 14);
                const recommendedDrinks = vitola.pairingIds
                  .map((pid) => PAIRINGS.find((p) => p.id === pid)?.name)
                  .filter(Boolean);

                return (
                  <Card key={vitola.id} style={{ marginBottom: spacing.md }}>
                    <View style={styles.vitolaTopRow}>
                      <View>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                          <Text style={styles.vitolaName}>{vitola.name}</Text>
                          <Badge
                            label={vitola.shape === 'figurado' ? 'Figurado' : 'Parejo'}
                            variant="outline"
                          />
                        </View>
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

                    {/* Silhueta Visual Proporcional do Charuto */}
                    <View style={styles.cigarSilhouetteTrack}>
                      <View
                        style={[
                          styles.cigarSilhouetteBody,
                          {
                            width: `${widthPct}%`,
                            height: barHeight,
                            borderTopLeftRadius: vitola.shape === 'figurado' ? barHeight : 6,
                            borderBottomLeftRadius: vitola.shape === 'figurado' ? barHeight : 6,
                          },
                        ]}
                      >
                        <View style={styles.cigarBandGold} />
                      </View>
                    </View>

                    <Text style={styles.vitolaDescription}>{vitola.description}</Text>

                    <View style={styles.vitolaOccasionBox}>
                      <Ionicons name="sparkles-outline" size={14} color={colors.gold} />
                      <Text style={styles.vitolaOccasionText}>
                        Momento ideal: {vitola.occasion}
                      </Text>
                    </View>

                    {recommendedDrinks.length > 0 && (
                      <View style={styles.vitolaPairingsRow}>
                        <Ionicons name="wine-outline" size={13} color={colors.goldSoft} />
                        <Text style={styles.vitolaPairingsText}>
                          Harmoniza com: {recommendedDrinks.join(' · ')}
                        </Text>
                      </View>
                    )}
                  </Card>
                );
              })}
            </View>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 4: RITUAIS, CORTES (PRÓS/CONTRAS) & MÉTODOS DE ACENDIMENTO */}
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
                    <Ionicons
                      name={c.icon as any}
                      size={20}
                      color={colors.gold}
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.anatomyName}>{c.name}</Text>
                  </View>
                  <Text style={styles.anatomyDescription}>{c.description}</Text>

                  <View style={styles.prosConsBox}>
                    {c.pros.map((pro) => (
                      <View key={pro} style={styles.proConItem}>
                        <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
                        <Text style={styles.proConText}>{pro}</Text>
                      </View>
                    ))}
                    {c.cons.map((con) => (
                      <View key={con} style={styles.proConItem}>
                        <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
                        <Text style={styles.proConText}>{con}</Text>
                      </View>
                    ))}
                  </View>

                  <Text style={styles.bestForText}>Recomendado para: {c.bestFor}</Text>
                </Card>
              ))}

              <GoldDivider />

              <Text style={styles.sectionTitle}>Passo a Passo do Acendimento</Text>
              <Text style={styles.sectionSubtitle}>
                Jamais encoste a chama diretamente no tabaco; toste o pé com paciência.
              </Text>
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

              <GoldDivider />

              <Text style={styles.sectionTitle}>Instrumentos de Acendimento</Text>
              <Text style={styles.sectionSubtitle}>
                A fonte de calor preserva ou arruína os óleos essenciais da capa e da tripa.
              </Text>

              {LIGHTING.map((item) => {
                const verdictColor =
                  item.verdict === 'recomendado'
                    ? colors.success
                    : item.verdict === 'aceitavel'
                      ? colors.gold
                      : colors.danger;
                const verdictLabel =
                  item.verdict === 'recomendado'
                    ? 'RECOMENDADO'
                    : item.verdict === 'aceitavel'
                      ? 'ACEITÁVEL'
                      : 'EVITAR';

                return (
                  <Card key={item.id} style={{ marginBottom: spacing.md }}>
                    <View style={styles.lightingHeader}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <Ionicons
                          name={item.icon as any}
                          size={18}
                          color={verdictColor}
                          style={{ marginRight: 8 }}
                        />
                        <Text style={styles.lightingName}>{item.name}</Text>
                      </View>
                      <View style={[styles.verdictPill, { borderColor: verdictColor }]}>
                        <Text style={[styles.verdictText, { color: verdictColor }]}>
                          {verdictLabel}
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.anatomyDescription}>{item.description}</Text>
                  </Card>
                );
              })}

              <View style={{ height: 20 }} />
            </View>
          )}

          {/* ========================================================================= */}
          {/* SEÇÃO 5: CURIOSIDADES */}
          {/* ========================================================================= */}
          {activeSection === 'curiosidades' && (
            <View style={styles.tabContent}>
              <Text style={styles.sectionTitle}>Fatos, Etiqueta & História</Text>
              <Text style={styles.sectionSubtitle}>
                Crônicas e tradições preservadas através dos séculos nos maiores polos de
                charutaria.
              </Text>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.originRow}
              >
                {[
                  { id: 'all', label: 'Todas' },
                  { id: 'historia', label: 'História' },
                  { id: 'cultivo', label: 'Cultivo & Cura' },
                  { id: 'ritual', label: 'Conservação' },
                  { id: 'etiqueta', label: 'Etiqueta no Lounge' },
                ].map((cat) => {
                  const active = curiosityCat === cat.id;
                  return (
                    <Pressable
                      key={cat.id}
                      onPress={() => setCuriosityCat(cat.id as any)}
                      style={[styles.originChip, active && styles.originChipActive]}
                    >
                      <Text
                        style={[
                          styles.originChipText,
                          active && styles.originChipTextActive,
                        ]}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>

              {filteredCuriosities.map((cur) => (
                <Card key={cur.id} style={{ marginBottom: spacing.md }}>
                  <Badge
                    label={cur.category.toUpperCase()}
                    variant="gold"
                    style={{ alignSelf: 'flex-start', marginBottom: 6 }}
                  />
                  <Text style={styles.curiosityTitle}>{cur.title}</Text>
                  <Text style={styles.curiositySummary}>{cur.summary}</Text>
                  <Text style={styles.curiosityBody}>{cur.body}</Text>
                </Card>
              ))}
            </View>
          )}

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
    paddingVertical: spacing.sm,
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
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: spacing.md,
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
  terroirCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.35)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  terroirHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  terroirFlag: {
    fontSize: 26,
    marginRight: 10,
  },
  terroirTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    color: colors.text,
  },
  terroirRegion: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.gold,
  },
  terroirBody: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 19,
    color: colors.textSecondary,
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
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  brandTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  brandTopRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  favBrandBtn: {
    padding: 4,
  },
  brandMonogram: {
    width: 42,
    height: 42,
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
    marginTop: 1,
  },
  brandTagline: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
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
    width: 75,
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
  cigarSilhouetteTrack: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: radius.sm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 8,
    justifyContent: 'center',
  },
  cigarSilhouetteBody: {
    backgroundColor: colors.tobacco,
    borderWidth: 1,
    borderColor: colors.tobaccoLight,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    justifyContent: 'center',
    position: 'relative',
  },
  cigarBandGold: {
    position: 'absolute',
    left: '22%',
    top: -1,
    bottom: -1,
    width: 10,
    backgroundColor: colors.gold,
    borderRadius: 1,
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
    flex: 1,
  },
  vitolaPairingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  vitolaPairingsText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.goldSoft,
    flex: 1,
  },
  prosConsBox: {
    marginTop: spacing.sm,
    gap: 4,
  },
  proConItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  proConText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.text,
  },
  bestForText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 8,
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
  lightingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  lightingName: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    color: colors.text,
  },
  verdictPill: {
    borderWidth: 1,
    borderRadius: radius.pill,
    paddingVertical: 2,
    paddingHorizontal: 8,
  },
  verdictText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    letterSpacing: 0.8,
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

/**
 * Aba 3: HARMONIZAÇÃO (Pairing Guide)
 * Whiskies, Rums & Cachaças, Cognacs, Cafés Especiais e Vinhos combinados com a intensidade do charuto.
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
import { Ionicons } from '@expo/vector-icons';
import { Badge, Card, GoldDivider } from '../../src/components/ui';
import { PAIRING_CATEGORIES, PAIRINGS } from '../../src/data/pairings';
import { colors, fonts, radius, spacing, type } from '../../src/theme';
import { PairingCategory, Strength } from '../../src/types';

export default function PairingScreen() {
  const [selectedCategory, setSelectedCategory] = useState<PairingCategory | 'all'>('all');
  const [selectedStrength, setSelectedStrength] = useState<Strength | 'all'>('all');

  const filteredPairings = PAIRINGS.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (selectedStrength !== 'all' && !p.strengthMatch.includes(selectedStrength)) return false;
    return true;
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={type.overline}>ARTE DO PALADAR</Text>
        <Text style={styles.title}>Harmonização</Text>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Banner Informativo */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerQuote}>
            "O casamento perfeito não mascara o charuto nem anula a bebida; revela dimensões ocultas
            em ambos."
          </Text>
        </View>

        {/* Filtro por Categoria de Bebida */}
        <Text style={styles.sectionLabel}>TIPO DE BEBIDA</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipRow}>
          <Pressable
            onPress={() => setSelectedCategory('all')}
            style={[styles.categoryChip, selectedCategory === 'all' && styles.categoryChipActive]}
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
                <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
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
          {filteredPairings.map((pair) => (
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
                      label={s.toUpperCase()}
                      variant="gold"
                      style={{ marginBottom: 4 }}
                    />
                  ))}
                </View>
              </View>

              <View style={styles.whyBox}>
                <Ionicons name="sparkles" size={14} color={colors.gold} style={{ marginRight: 6 }} />
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
            </Card>
          ))}
        </View>

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
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
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
});

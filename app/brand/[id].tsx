/**
 * Tela de Perfil e História da Marca (Brand Detail Page)
 * Origem, história dos mestres tabaqueiros, perfil aromático e vitolas famosas.
 */
import React from 'react';
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
import { colors, fonts, radius, spacing, type } from '../../src/theme';

export default function BrandDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

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

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </Pressable>
        <Text style={styles.topBarTitle}>{brand.name}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
            <Badge label={`${origin.flag} ${origin.label}`} variant="muted" style={{ marginLeft: 6 }} />
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
            <Ionicons name="person-outline" size={18} color={colors.gold} style={{ marginRight: 8 }} />
            <View>
              <Text style={styles.founderLabel}>Fundador:</Text>
              <Text style={styles.founderVal}>{brand.founder}</Text>
            </View>
          </View>
          <View style={[styles.founderRow, { marginTop: spacing.sm }]}>
            <Ionicons name="sparkles-outline" size={18} color={colors.gold} style={{ marginRight: 8 }} />
            <View>
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

          <Text style={[styles.wrapperLabel, { marginTop: spacing.md }]}>Notas Sensoriais Predominantes:</Text>
          <View style={styles.flavorRow}>
            {brand.flavorProfile.map((flavor) => (
              <Badge key={flavor} label={flavor} variant="gold" size="md" style={{ marginRight: 6, marginTop: 6 }} />
            ))}
          </View>
        </Card>

        {/* Vitolas Famosas da Marca */}
        <Text style={styles.sectionHeader}>VITOLAS EMBLEMÁTICAS</Text>
        <View style={styles.vitolasList}>
          {brand.famousVitolas.map((vitola) => (
            <Card key={vitola.name} style={styles.vitolaItem}>
              <View style={styles.vitolaItemHeader}>
                <Text style={styles.vitolaItemName}>{vitola.name}</Text>
                <Text style={styles.vitolaItemDimensions}>
                  Cepo {vitola.ringGauge} · {vitola.lengthMm} mm
                </Text>
              </View>
              {vitola.notes && <Text style={styles.vitolaItemNotes}>{vitola.notes}</Text>}
            </Card>
          ))}
        </View>

        {/* Curiosidade Histórica */}
        <View style={styles.curiosityCard}>
          <Ionicons name="information-circle-outline" size={20} color={colors.gold} style={{ marginRight: 8 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.curiosityCardTitle}>Você Sabia?</Text>
            <Text style={styles.curiosityCardBody}>{brand.curiosity}</Text>
          </View>
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
    alignItems: 'baseline',
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
  },
  vitolaItemNotes: {
    fontFamily: fonts.serifItalic,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
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

/**
 * Modal / Painel de Filtros Granulares para a Descoberta de Lounges.
 */
import React from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from './ui';
import { AMENITIES, CATEGORY_META } from '../data/amenities';
import { useExploreStore } from '../store/useExploreStore';
import { colors, fonts, radius, spacing, type } from '../theme';
import { AmenityId, VenueCategory, VenueUsage } from '../types';

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
}

export const FilterModal: React.FC<FilterModalProps> = ({ visible, onClose }) => {
  const {
    filters,
    toggleCategory,
    setUsage,
    toggleAmenity,
    setMaxDistance,
    setOpenNow,
    resetFilters,
  } = useExploreStore();

  const categories: VenueCategory[] = ['lounge', 'shop', 'club'];
  const distances: { label: string; value: number | null }[] = [
    { label: 'Todos', value: null },
    { label: 'Até 5 km', value: 5 },
    { label: 'Até 15 km', value: 15 },
    { label: 'Até 50 km', value: 50 },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Cabeçalho do Modal */}
          <View style={styles.header}>
            <Text style={styles.title}>Filtros Exclusivos</Text>
            <Pressable onPress={onClose} hitSlop={8}>
              <Ionicons name="close" size={24} color={colors.text} />
            </Pressable>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Categoria */}
            <Text style={styles.sectionLabel}>TIPO DE ESPAÇO</Text>
            <View style={styles.chipRow}>
              {categories.map((c) => {
                const active = filters.categories.includes(c);
                return (
                  <Pressable
                    key={c}
                    onPress={() => toggleCategory(c)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {CATEGORY_META[c].label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Finalidade */}
            <Text style={styles.sectionLabel}>EXPERIÊNCIA NO LOCAL</Text>
            <View style={styles.chipRow}>
              {[
                { id: 'all', label: 'Todos' },
                { id: 'smoke', label: 'Fumar no Local' },
                { id: 'purchase', label: 'Somente Compra' },
              ].map((u) => {
                const active = filters.usage === u.id;
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => setUsage(u.id as any)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {u.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Distância */}
            <Text style={styles.sectionLabel}>RAIO DE DISTÂNCIA</Text>
            <View style={styles.chipRow}>
              {distances.map((d) => {
                const active = filters.maxDistanceKm === d.value;
                return (
                  <Pressable
                    key={String(d.value)}
                    onPress={() => setMaxDistance(d.value)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>
                      {d.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Comodidades (Amenities) */}
            <Text style={styles.sectionLabel}>COMODIDADES & INFRAESTRUTURA</Text>
            <View style={styles.amenitiesGrid}>
              {AMENITIES.map((a) => {
                const active = filters.amenities.includes(a.id);
                return (
                  <Pressable
                    key={a.id}
                    onPress={() => toggleAmenity(a.id)}
                    style={[styles.amenityCard, active && styles.amenityCardActive]}
                  >
                    <Ionicons
                      name={a.icon as any}
                      size={20}
                      color={active ? '#0F0E0E' : colors.gold}
                    />
                    <Text
                      style={[styles.amenityLabel, active && styles.amenityLabelActive]}
                      numberOfLines={1}
                    >
                      {a.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          {/* Rodapé de Ações */}
          <View style={styles.footer}>
            <Pressable onPress={resetFilters} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>Limpar Tudo</Text>
            </Pressable>
            <Button
              label="Aplicar Filtros"
              variant="gold"
              onPress={onClose}
              style={{ flex: 1, marginLeft: spacing.md }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '85%',
    paddingTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: colors.text,
  },
  body: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
  },
  sectionLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  chipActive: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
    borderColor: colors.gold,
  },
  chipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.gold,
    fontFamily: fonts.sansBold,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  amenityCard: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  amenityCardActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  amenityLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  amenityLabelActive: {
    color: '#0F0E0E',
    fontFamily: fonts.sansBold,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
    backgroundColor: colors.surface,
  },
  clearBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  clearBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.textSecondary,
  },
});

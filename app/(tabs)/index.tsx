/**
 * Aba 1: EXPLORAR ("Where to Smoke")
 * Alternância Lista / Mapa, Busca Fuzzy e Filtros Granulares.
 */
import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterModal } from '../../src/components/FilterModal';
import { InteractiveMap } from '../../src/components/InteractiveMap';
import { VenueCard } from '../../src/components/VenueCard';
import { VENUES } from '../../src/data/venues';
import { distanceKm, isOpenNow } from '../../src/lib/geo';
import { searchVenues } from '../../src/lib/search';
import { countActiveFilters, useExploreStore } from '../../src/store/useExploreStore';
import { colors, fonts, radius, spacing, type } from '../../src/theme';

export default function ExploreScreen() {
  const { filters, setQuery, viewMode, setViewMode, userLocation } = useExploreStore();
  const [filterModalOpen, setFilterModalOpen] = useState(false);

  const activeFiltersCount = countActiveFilters(filters);

  // Filtragem combinada: busca textual + filtros granulares
  const filteredVenues = useMemo(() => {
    let result = searchVenues(filters.query);

    // Filtro por categorias
    if (filters.categories.length > 0) {
      result = result.filter((v) => filters.categories.includes(v.category));
    }

    // Filtro por finalidade (fumar vs comprar)
    if (filters.usage !== 'all') {
      result = result.filter((v) => v.usage.includes(filters.usage as any));
    }

    // Filtro por comodidades (deve ter todas as comodidades selecionadas)
    if (filters.amenities.length > 0) {
      result = result.filter((v) =>
        filters.amenities.every((a) => v.amenities.includes(a)),
      );
    }

    // Filtro por distância máxima
    if (filters.maxDistanceKm !== null) {
      result = result.filter(
        (v) => distanceKm(userLocation, v.coords) <= filters.maxDistanceKm!,
      );
    }

    // Filtro por aberto agora
    if (filters.openNow) {
      result = result.filter((v) => isOpenNow(v.hours));
    }

    return result;
  }, [filters, userLocation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Bar Editorial */}
      <View style={styles.header}>
        <View>
          <Text style={type.overline}>GUIA DE EXCLUSIVIDADE</Text>
          <Text style={styles.title}>Onde Fumar</Text>
        </View>

        {/* Toggle Lista / Mapa */}
        <View style={styles.toggleGroup}>
          <Pressable
            onPress={() => setViewMode('list')}
            style={[styles.toggleBtn, viewMode === 'list' && styles.toggleBtnActive]}
          >
            <Ionicons
              name="list"
              size={18}
              color={viewMode === 'list' ? '#0F0E0E' : colors.textSecondary}
            />
          </Pressable>
          <Pressable
            onPress={() => setViewMode('map')}
            style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
          >
            <Ionicons
              name="map"
              size={18}
              color={viewMode === 'map' ? '#0F0E0E' : colors.textSecondary}
            />
          </Pressable>
        </View>
      </View>

      {/* Barra de Pesquisa e Filtros */}
      <View style={styles.searchBarRow}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={18} color={colors.gold} style={{ marginRight: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar lounges, bairros ou cidades..."
            placeholderTextColor={colors.textMuted}
            value={filters.query}
            onChangeText={setQuery}
          />
          {filters.query ? (
            <Pressable onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={colors.textSecondary} />
            </Pressable>
          ) : null}
        </View>

        {/* Botão de Filtro com Contador */}
        <Pressable
          onPress={() => setFilterModalOpen(true)}
          style={[styles.filterBtn, activeFiltersCount > 0 && styles.filterBtnActive]}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFiltersCount > 0 ? '#0F0E0E' : colors.gold}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Conteúdo Principal: Lista ou Mapa */}
      {viewMode === 'list' ? (
        <FlatList
          data={filteredVenues}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <VenueCard venue={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={colors.border} />
              <Text style={styles.emptyTitle}>Nenhum espaço encontrado</Text>
              <Text style={styles.emptySubtitle}>
                Tente ajustar os filtros ou buscar por outro termo.
              </Text>
            </View>
          }
        />
      ) : (
        <InteractiveMap venues={filteredVenues} />
      )}

      {/* Modal de Filtros */}
      <FilterModal
        visible={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
      />
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  toggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.gold,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.text,
  },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBtnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: colors.tobacco,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.background,
  },
  filterBadgeText: {
    fontFamily: fonts.sansBold,
    fontSize: 10,
    color: '#FFF',
  },
  listContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});

/**
 * Aba 1: EXPLORAR ("Where to Smoke")
 * GPS real por cidade, controle dinâmico de Raio (km), Filtros Rápidos, Ordenação,
 * Atalhos de Cidades (São Paulo, Jundiaí, Campinas, Rio, Curitiba, BH, Brasília, POA) e Mapa Real.
 */
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FilterModal } from '../../src/components/FilterModal';
import { InteractiveMap } from '../../src/components/InteractiveMap';
import { VenueCard } from '../../src/components/VenueCard';
import { distanceKm, isOpenNow } from '../../src/lib/geo';
import { searchVenues } from '../../src/lib/search';
import { geocodeCityQuery, GeocodedCityOption } from '../../src/services/nearbyVenues';
import {
  countActiveFilters,
  RADIUS_OPTIONS,
  useExploreStore,
} from '../../src/store/useExploreStore';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, fonts, radius, spacing, type } from '../../src/theme';
import { VenueCategory } from '../../src/types';

const QUICK_CITIES: GeocodedCityOption[] = [
  { city: 'São Paulo', state: 'SP', label: 'São Paulo, SP', latitude: -23.5614, longitude: -46.6559 },
  { city: 'Jundiaí', state: 'SP', label: 'Jundiaí, SP', latitude: -23.1857, longitude: -46.8978 },
  { city: 'Campinas', state: 'SP', label: 'Campinas, SP', latitude: -22.9056, longitude: -47.0608 },
  { city: 'Rio de Janeiro', state: 'RJ', label: 'Rio de Janeiro, RJ', latitude: -22.9834, longitude: -43.2253 },
  { city: 'Curitiba', state: 'PR', label: 'Curitiba, PR', latitude: -25.4429, longitude: -49.2867 },
  { city: 'Belo Horizonte', state: 'MG', label: 'Belo Horizonte, MG', latitude: -19.9300, longitude: -43.9450 },
  { city: 'Brasília', state: 'DF', label: 'Brasília, DF', latitude: -15.8398, longitude: -47.8783 },
  { city: 'Porto Alegre', state: 'RS', label: 'Porto Alegre, RS', latitude: -30.0258, longitude: -51.2018 },
  { city: 'São Félix', state: 'BA', label: 'São Félix, BA', latitude: -12.6064, longitude: -38.9719 },
];

export default function ExploreScreen() {
  const { ageVerified, hydrated } = useUserStore();
  const {
    filters,
    sort,
    setSort,
    setQuery,
    toggleCategory,
    setOpenNow,
    setUsage,
    setMaxDistance,
    stepRadius,
    resetFilters,
    viewMode,
    setViewMode,
    userLocation,
    cityInfo,
    locationStatus,
    isManualCity,
    nearbyVenues,
    nearbyLoading,
    requestLocation,
    setManualCity,
  } = useExploreStore();

  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [cityModalOpen, setCityModalOpen] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  const [cityResults, setCityResults] = useState<GeocodedCityOption[]>([]);
  const [citySearching, setCitySearching] = useState(false);

  // Solicita o GPS automaticamente assim que o usuário confirma 18+
  useEffect(() => {
    if (hydrated && ageVerified && locationStatus === 'idle') {
      requestLocation();
    }
  }, [hydrated, ageVerified, locationStatus, requestLocation]);

  // Busca de cidades quando o modal de trocar cidade está aberto
  useEffect(() => {
    if (!cityModalOpen) return;
    const q = citySearchText.trim();
    if (q.length < 2) {
      setCityResults([]);
      return;
    }
    let cancelled = false;
    setCitySearching(true);
    const timer = setTimeout(async () => {
      const res = await geocodeCityQuery(q);
      if (!cancelled) {
        setCityResults(res);
        setCitySearching(false);
      }
    }, 350);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [citySearchText, cityModalOpen]);

  const activeFiltersCount = countActiveFilters(filters);

  // Filtragem combinada (curadoria + locais reais da cidade) e ordenação
  const filteredVenues = useMemo(() => {
    let result = searchVenues(filters.query, nearbyVenues);

    if (filters.categories.length > 0) {
      result = result.filter((v) => filters.categories.includes(v.category));
    }

    if (filters.usage !== 'all') {
      result = result.filter((v) => v.usage.includes(filters.usage as any));
    }

    if (filters.amenities.length > 0) {
      result = result.filter((v) =>
        filters.amenities.every((a) => v.amenities.includes(a)),
      );
    }

    if (filters.maxDistanceKm !== null) {
      result = result.filter(
        (v) => distanceKm(userLocation, v.coords) <= filters.maxDistanceKm!,
      );
    }

    if (filters.openNow) {
      result = result.filter((v) => isOpenNow(v.hours));
    }

    // Ordenação (se não houver busca textual por relevância)
    if (!filters.query.trim()) {
      result = [...result].sort((a, b) => {
        if (sort === 'rating') {
          if (b.rating !== a.rating) return b.rating - a.rating;
          return b.reviewsCount - a.reviewsCount;
        }
        if (sort === 'name') {
          return a.name.localeCompare(b.name, 'pt-BR');
        }
        return distanceKm(userLocation, a.coords) - distanceKm(userLocation, b.coords);
      });
    }

    return result;
  }, [filters, sort, userLocation, nearbyVenues]);

  const handleSelectCity = async (opt: GeocodedCityOption) => {
    setCityModalOpen(false);
    setCitySearchText('');
    await setManualCity(opt);
  };

  const handleUseMyGps = async () => {
    setCityModalOpen(false);
    setCitySearchText('');
    await requestLocation(true);
  };

  const cycleSortMode = () => {
    if (sort === 'distance') setSort('rating');
    else if (sort === 'rating') setSort('name');
    else setSort('distance');
  };

  const sortLabel =
    sort === 'distance' ? 'Mais próximos' : sort === 'rating' ? 'Melhor nota' : 'A–Z';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topWrapper}>
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
                size={17}
                color={viewMode === 'list' ? '#0F0E0E' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  viewMode === 'list' && styles.toggleLabelActive,
                ]}
              >
                Lista
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setViewMode('map')}
              style={[styles.toggleBtn, viewMode === 'map' && styles.toggleBtnActive]}
            >
              <Ionicons
                name="map"
                size={17}
                color={viewMode === 'map' ? '#0F0E0E' : colors.textSecondary}
              />
              <Text
                style={[
                  styles.toggleLabel,
                  viewMode === 'map' && styles.toggleLabelActive,
                ]}
              >
                Mapa
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Barra de Pesquisa e Filtros */}
        <View style={styles.searchBarRow}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={18} color={colors.gold} style={{ marginRight: 8 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Buscar lounges, tabacarias, bairros ou cidades..."
              placeholderTextColor={colors.textMuted}
              value={filters.query}
              onChangeText={setQuery}
            />
            {filters.query ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8}>
                <Ionicons name="close-circle" size={17} color={colors.textSecondary} />
              </Pressable>
            ) : null}
          </View>

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

        {/* Faixa de Cidade Atual (GPS / Trocar Cidade) + Controle Rápido de Raio */}
        <View style={styles.geoSection}>
          <View style={styles.locationRow}>
            <Pressable
              onPress={() => setCityModalOpen(true)}
              style={styles.citySelectorBtn}
            >
              <Ionicons
                name={isManualCity ? 'location' : 'navigate'}
                size={14}
                color={colors.gold}
              />
              <Text style={styles.cityLabelText} numberOfLines={1}>
                {locationStatus === 'loading' ? 'Obtendo GPS...' : cityInfo.label}
              </Text>
              <Ionicons name="chevron-down" size={13} color={colors.textSecondary} />
            </Pressable>

            <View style={styles.statusRight}>
              {nearbyLoading ? (
                <View style={styles.loadingInline}>
                  <ActivityIndicator size="small" color={colors.gold} />
                  <Text style={styles.loadingInlineText}>Mapeando...</Text>
                </View>
              ) : (
                <Text style={styles.countSummaryText}>
                  {filteredVenues.length}{' '}
                  {filteredVenues.length === 1 ? 'local' : 'locais'}
                </Text>
              )}

              <Pressable
                onPress={cycleSortMode}
                style={styles.sortMiniBtn}
                hitSlop={6}
              >
                <Ionicons name="swap-vertical" size={13} color={colors.gold} />
                <Text style={styles.sortMiniText}>{sortLabel}</Text>
              </Pressable>

              <Pressable
                onPress={() => requestLocation(true)}
                hitSlop={8}
                style={styles.gpsMiniBtn}
              >
                <Ionicons name="locate" size={15} color={colors.gold} />
              </Pressable>
            </View>
          </View>

          {/* Controle de Raio (- / chips / +) */}
          <View style={styles.radiusControlRow}>
            <Pressable
              onPress={() => stepRadius('down')}
              style={styles.stepBtn}
              hitSlop={6}
            >
              <Ionicons name="remove" size={16} color={colors.gold} />
            </Pressable>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.radiusChipsScroll}
            >
              {RADIUS_OPTIONS.map((opt) => {
                const active = filters.maxDistanceKm === opt.value;
                return (
                  <Pressable
                    key={String(opt.value)}
                    onPress={() => setMaxDistance(opt.value)}
                    style={[styles.radiusChip, active && styles.radiusChipActive]}
                  >
                    <Text
                      style={[
                        styles.radiusChipText,
                        active && styles.radiusChipTextActive,
                      ]}
                    >
                      {opt.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            <Pressable
              onPress={() => stepRadius('up')}
              style={styles.stepBtn}
              hitSlop={6}
            >
              <Ionicons name="add" size={16} color={colors.gold} />
            </Pressable>
          </View>

          {/* Filtros Rápidos Diretos (Aberto Agora, Lounges, Tabacarias, Confrarias, Fumar no Local) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickFilterScroll}
          >
            <Pressable
              onPress={() => setOpenNow(!filters.openNow)}
              style={[styles.quickChip, filters.openNow && styles.quickChipActive]}
            >
              <View
                style={[
                  styles.quickDot,
                  { backgroundColor: filters.openNow ? '#0F0E0E' : colors.success },
                ]}
              />
              <Text
                style={[
                  styles.quickChipText,
                  filters.openNow && styles.quickChipTextActive,
                ]}
              >
                Aberto agora
              </Text>
            </Pressable>

            {(
              [
                { id: 'lounge', label: 'Lounges', icon: 'wine-outline' },
                { id: 'shop', label: 'Tabacarias', icon: 'storefront-outline' },
                { id: 'club', label: 'Confrarias', icon: 'key-outline' },
              ] as { id: VenueCategory; label: string; icon: string }[]
            ).map((cat) => {
              const active = filters.categories.includes(cat.id);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => toggleCategory(cat.id)}
                  style={[styles.quickChip, active && styles.quickChipActive]}
                >
                  <Ionicons
                    name={cat.icon as any}
                    size={13}
                    color={active ? '#0F0E0E' : colors.gold}
                  />
                  <Text
                    style={[styles.quickChipText, active && styles.quickChipTextActive]}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => setUsage(filters.usage === 'smoke' ? 'all' : 'smoke')}
              style={[
                styles.quickChip,
                filters.usage === 'smoke' && styles.quickChipActive,
              ]}
            >
              <Ionicons
                name="flame-outline"
                size={13}
                color={filters.usage === 'smoke' ? '#0F0E0E' : colors.gold}
              />
              <Text
                style={[
                  styles.quickChipText,
                  filters.usage === 'smoke' && styles.quickChipTextActive,
                ]}
              >
                Fumar no local
              </Text>
            </Pressable>

            {activeFiltersCount > 0 && (
              <Pressable onPress={resetFilters} style={styles.clearQuickChip}>
                <Ionicons name="refresh-outline" size={13} color={colors.goldSoft} />
                <Text style={styles.clearQuickText}>Limpar filtros</Text>
              </Pressable>
            )}
          </ScrollView>
        </View>
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
              <Ionicons name="compass-outline" size={48} color={colors.borderStrong} />
              <Text style={styles.emptyTitle}>
                {nearbyLoading
                  ? 'Buscando tabacarias e lounges...'
                  : 'Nenhum espaço encontrado'}
              </Text>
              <Text style={styles.emptySubtitle}>
                {filters.maxDistanceKm !== null
                  ? `Não encontramos locais com esses filtros em até ${filters.maxDistanceKm} km de ${cityInfo.city}. Amplie o raio ou ajuste os filtros.`
                  : 'Tente ajustar os filtros ou buscar por outro termo.'}
              </Text>
              <View style={styles.emptyActionsRow}>
                {filters.maxDistanceKm !== null && !nearbyLoading && (
                  <Pressable
                    onPress={() => stepRadius('up')}
                    style={styles.expandRadiusBtn}
                  >
                    <Ionicons name="add-circle-outline" size={18} color="#0F0E0E" />
                    <Text style={styles.expandRadiusBtnText}>Aumentar Raio</Text>
                  </Pressable>
                )}
                {activeFiltersCount > 0 && (
                  <Pressable onPress={resetFilters} style={styles.resetEmptyBtn}>
                    <Text style={styles.resetEmptyBtnText}>Limpar Filtros</Text>
                  </Pressable>
                )}
              </View>
            </View>
          }
        />
      ) : (
        <InteractiveMap venues={filteredVenues} />
      )}

      {/* Modal de Filtros Granulares */}
      <FilterModal
        visible={filterModalOpen}
        onClose={() => setFilterModalOpen(false)}
      />

      {/* Modal para Usar GPS ou Explorar Outra Cidade (ex.: Jundiaí, Campinas, SP) */}
      <Modal visible={cityModalOpen} animationType="fade" transparent>
        <View style={styles.cityModalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setCityModalOpen(false)}
          />
          <View style={styles.cityModalSheet}>
            <View style={styles.cityModalHeader}>
              <Text style={styles.cityModalTitle}>Localização & Cidade</Text>
              <Pressable onPress={() => setCityModalOpen(false)} hitSlop={10}>
                <Ionicons name="close" size={22} color={colors.textSecondary} />
              </Pressable>
            </View>

            <Pressable onPress={handleUseMyGps} style={styles.useGpsBtn}>
              <Ionicons name="locate" size={18} color="#0F0E0E" />
              <Text style={styles.useGpsBtnText}>Usar meu GPS atual</Text>
            </Pressable>

            <Text style={styles.citySectionLabel}>ACESSO RÁPIDO — CIDADES & POLOS</Text>
            <View style={styles.quickCitiesGrid}>
              {QUICK_CITIES.map((qc) => {
                const isCurrent = cityInfo.city.toLowerCase() === qc.city.toLowerCase();
                return (
                  <Pressable
                    key={qc.label}
                    onPress={() => handleSelectCity(qc)}
                    style={[
                      styles.quickCityChip,
                      isCurrent && styles.quickCityChipActive,
                    ]}
                  >
                    <Ionicons
                      name="location-outline"
                      size={13}
                      color={isCurrent ? '#0F0E0E' : colors.gold}
                    />
                    <Text
                      style={[
                        styles.quickCityChipText,
                        isCurrent && styles.quickCityChipTextActive,
                      ]}
                    >
                      {qc.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={styles.citySectionLabel}>PESQUISAR QUALQUER CIDADE DO BRASIL</Text>
            <View style={styles.cityInputWrap}>
              <Ionicons name="search" size={16} color={colors.gold} />
              <TextInput
                style={styles.cityInput}
                placeholder="Digite a cidade (ex: Jundiaí, Santos, Ribeirão...)"
                placeholderTextColor={colors.textMuted}
                value={citySearchText}
                onChangeText={setCitySearchText}
              />
            </View>

            {citySearching && (
              <ActivityIndicator
                size="small"
                color={colors.gold}
                style={{ marginVertical: spacing.md }}
              />
            )}

            {cityResults.map((opt) => (
              <Pressable
                key={`${opt.label}-${opt.latitude}`}
                onPress={() => handleSelectCity(opt)}
                style={styles.cityResultItem}
              >
                <Ionicons name="location-outline" size={18} color={colors.gold} />
                <Text style={styles.cityResultText}>{opt.label}</Text>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </Pressable>
            ))}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  topWrapper: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
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
  toggleGroup: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radius.sm,
  },
  toggleBtnActive: {
    backgroundColor: colors.gold,
  },
  toggleLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.textSecondary,
  },
  toggleLabelActive: {
    color: '#0F0E0E',
    fontFamily: fonts.sansBold,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    gap: spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 42,
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
    width: 42,
    height: 42,
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
  geoSection: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 8,
  },
  citySelectorBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 11,
    maxWidth: '50%',
  },
  cityLabelText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 12,
    color: colors.text,
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadingInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadingInlineText: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.goldSoft,
  },
  countSummaryText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  sortMiniBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  sortMiniText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.goldSoft,
  },
  gpsMiniBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radiusChipsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 2,
  },
  radiusChip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  radiusChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  radiusChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  radiusChipTextActive: {
    fontFamily: fonts.sansBold,
    color: '#0F0E0E',
  },
  quickFilterScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  quickChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  quickDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  quickChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.textSecondary,
  },
  quickChipTextActive: {
    fontFamily: fonts.sansBold,
    color: '#0F0E0E',
  },
  clearQuickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  clearQuickText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.goldSoft,
    textDecorationLine: 'underline',
  },
  listContent: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    lineHeight: 19,
  },
  emptyActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  expandRadiusBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: radius.pill,
  },
  expandRadiusBtnText: {
    fontFamily: fonts.sansBold,
    fontSize: 13,
    color: '#0F0E0E',
  },
  resetEmptyBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  resetEmptyBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 13,
    color: colors.gold,
  },
  cityModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.78)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  cityModalSheet: {
    width: '100%',
    maxWidth: 460,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
  },
  cityModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  cityModalTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: colors.text,
  },
  useGpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: 12,
    marginBottom: spacing.md,
  },
  useGpsBtnText: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: '#0F0E0E',
  },
  citySectionLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    letterSpacing: 1.4,
    color: colors.gold,
    marginTop: spacing.xs,
    marginBottom: spacing.xs,
  },
  quickCitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: spacing.md,
  },
  quickCityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  quickCityChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  quickCityChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.text,
  },
  quickCityChipTextActive: {
    fontFamily: fonts.sansBold,
    color: '#0F0E0E',
  },
  cityInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 44,
    marginBottom: spacing.sm,
  },
  cityInput: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 14,
    color: colors.text,
  },
  cityResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  cityResultText: {
    flex: 1,
    fontFamily: fonts.sansMedium,
    fontSize: 14,
    color: colors.text,
  },
});

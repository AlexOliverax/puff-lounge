/**
 * Estado da aba "Explorar": filtros, raio dinâmico, mapa, GPS real e locais descobertos na cidade.
 */
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { create } from 'zustand';
import {
  CityInfo,
  fetchNearbyOsmVenues,
  GeocodedCityOption,
  hydrateDiscoveredCache,
  reverseGeocodeCity,
} from '../services/nearbyVenues';
import { AmenityId, Venue, VenueCategory, VenueUsage } from '../types';

export type ViewMode = 'list' | 'map';
export type SortMode = 'distance' | 'rating' | 'name';

/** Fallback inicial antes do GPS responder: Av. Paulista, São Paulo */
export const DEFAULT_LOCATION = { latitude: -23.5614, longitude: -46.6559 };

/** Escala de raios rápidos (em km; null = sem limite / Brasil todo) */
export const RADIUS_OPTIONS: { label: string; value: number | null }[] = [
  { label: '2 km', value: 2 },
  { label: '5 km', value: 5 },
  { label: '15 km', value: 15 },
  { label: '30 km', value: 30 },
  { label: '60 km', value: 60 },
  { label: '100 km', value: 100 },
  { label: 'Todos', value: null },
];

export interface ExploreFilters {
  query: string;
  categories: VenueCategory[];
  usage: VenueUsage | 'all';
  amenities: AmenityId[];
  maxDistanceKm: number | null; // null = sem limite
  openNow: boolean;
}

export const EMPTY_FILTERS: ExploreFilters = {
  query: '',
  categories: [],
  usage: 'all',
  amenities: [],
  maxDistanceKm: 15,
  openNow: false,
};

type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied';

interface ExploreState {
  filters: ExploreFilters;
  viewMode: ViewMode;
  sort: SortMode;
  userLocation: { latitude: number; longitude: number };
  cityInfo: CityInfo;
  locationStatus: LocationStatus;
  isManualCity: boolean;
  selectedVenueId: string | null;
  nearbyVenues: Venue[];
  nearbyLoading: boolean;

  setQuery: (q: string) => void;
  toggleCategory: (c: VenueCategory) => void;
  setUsage: (u: VenueUsage | 'all') => void;
  toggleAmenity: (a: AmenityId) => void;
  setMaxDistance: (km: number | null) => void;
  stepRadius: (dir: 'down' | 'up') => void;
  setOpenNow: (v: boolean) => void;
  resetFilters: () => void;
  setViewMode: (m: ViewMode) => void;
  setSort: (s: SortMode) => void;
  selectVenue: (id: string | null) => void;
  requestLocation: (force?: boolean) => Promise<void>;
  setManualCity: (city: GeocodedCityOption) => Promise<void>;
  refreshNearby: () => Promise<void>;
}

const toggleIn = <T,>(list: T[], v: T) =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v];

function getWebPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation indisponível'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  });
}

export const useExploreStore = create<ExploreState>((set, get) => ({
  filters: EMPTY_FILTERS,
  viewMode: 'list',
  sort: 'distance',
  userLocation: DEFAULT_LOCATION,
  cityInfo: { city: 'São Paulo', state: 'SP', label: 'São Paulo, SP' },
  locationStatus: 'idle',
  isManualCity: false,
  selectedVenueId: null,
  nearbyVenues: [],
  nearbyLoading: false,

  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),
  toggleCategory: (c) =>
    set((s) => ({
      filters: { ...s.filters, categories: toggleIn(s.filters.categories, c) },
    })),
  setUsage: (usage) => set((s) => ({ filters: { ...s.filters, usage } })),
  toggleAmenity: (a) =>
    set((s) => ({
      filters: { ...s.filters, amenities: toggleIn(s.filters.amenities, a) },
    })),

  setMaxDistance: (maxDistanceKm) => {
    set((s) => ({ filters: { ...s.filters, maxDistanceKm } }));
    get().refreshNearby();
  },

  stepRadius: (dir) => {
    const current = get().filters.maxDistanceKm;
    const idx = RADIUS_OPTIONS.findIndex((r) => r.value === current);
    const curIdx = idx === -1 ? 2 : idx;
    const nextIdx =
      dir === 'down'
        ? Math.max(0, curIdx - 1)
        : Math.min(RADIUS_OPTIONS.length - 1, curIdx + 1);
    const nextVal = RADIUS_OPTIONS[nextIdx].value;
    get().setMaxDistance(nextVal);
  },

  setOpenNow: (openNow) => set((s) => ({ filters: { ...s.filters, openNow } })),
  resetFilters: () =>
    set((s) => ({ filters: { ...EMPTY_FILTERS, query: s.filters.query } })),
  setViewMode: (viewMode) => set({ viewMode }),
  setSort: (sort) => set({ sort }),
  selectVenue: (selectedVenueId) => set({ selectedVenueId }),

  refreshNearby: async () => {
    const { userLocation, filters, cityInfo } = get();
    set({ nearbyLoading: true });
    try {
      await hydrateDiscoveredCache();
      const searchKm = filters.maxDistanceKm ?? 50;
      const found = await fetchNearbyOsmVenues(userLocation, searchKm, cityInfo);
      set({ nearbyVenues: found, nearbyLoading: false });
    } catch {
      set({ nearbyLoading: false });
    }
  },

  setManualCity: async (option) => {
    const coords = { latitude: option.latitude, longitude: option.longitude };
    const cityInfo: CityInfo = {
      city: option.city,
      state: option.state,
      label: option.label,
    };
    set({
      userLocation: coords,
      cityInfo,
      isManualCity: true,
      locationStatus: 'granted',
      selectedVenueId: null,
    });
    await get().refreshNearby();
  },

  requestLocation: async (force = false) => {
    const state = get();
    if (state.locationStatus === 'loading') return;
    if (!force && state.locationStatus === 'granted' && !state.isManualCity) return;

    set({ locationStatus: 'loading', isManualCity: false });
    await hydrateDiscoveredCache();

    try {
      let coords: { latitude: number; longitude: number };

      if (Platform.OS === 'web') {
        coords = await getWebPosition();
      } else {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          set({ locationStatus: 'denied' });
          await get().refreshNearby();
          return;
        }
        const pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        coords = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
      }

      const cityInfo = await reverseGeocodeCity(coords);
      set({
        userLocation: coords,
        cityInfo,
        locationStatus: 'granted',
        selectedVenueId: null,
      });
      await get().refreshNearby();
    } catch {
      set({ locationStatus: 'denied' });
      await get().refreshNearby();
    }
  },
}));

/** Quantidade de filtros extras ativos no modal (além da barra de raio visível) */
export const countActiveFilters = (f: ExploreFilters) =>
  f.categories.length +
  f.amenities.length +
  (f.usage !== 'all' ? 1 : 0) +
  (f.openNow ? 1 : 0);

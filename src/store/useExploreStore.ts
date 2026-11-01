/**
 * Estado efêmero da aba "Explorar": filtros, modo de visualização e geolocalização.
 */
import * as Location from 'expo-location';
import { create } from 'zustand';
import { AmenityId, VenueCategory, VenueUsage } from '../types';

export type ViewMode = 'list' | 'map';
export type SortMode = 'distance' | 'rating' | 'name';

/** Fallback quando o usuário nega a localização: Av. Paulista, São Paulo */
export const DEFAULT_LOCATION = { latitude: -23.5614, longitude: -46.6559 };

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
  maxDistanceKm: null,
  openNow: false,
};

type LocationStatus = 'idle' | 'loading' | 'granted' | 'denied';

interface ExploreState {
  filters: ExploreFilters;
  viewMode: ViewMode;
  sort: SortMode;
  userLocation: { latitude: number; longitude: number };
  locationStatus: LocationStatus;
  selectedVenueId: string | null;

  setQuery: (q: string) => void;
  toggleCategory: (c: VenueCategory) => void;
  setUsage: (u: VenueUsage | 'all') => void;
  toggleAmenity: (a: AmenityId) => void;
  setMaxDistance: (km: number | null) => void;
  setOpenNow: (v: boolean) => void;
  resetFilters: () => void;
  setViewMode: (m: ViewMode) => void;
  setSort: (s: SortMode) => void;
  selectVenue: (id: string | null) => void;
  requestLocation: () => Promise<void>;
}

const toggleIn = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export const useExploreStore = create<ExploreState>((set, get) => ({
  filters: EMPTY_FILTERS,
  viewMode: 'list',
  sort: 'distance',
  userLocation: DEFAULT_LOCATION,
  locationStatus: 'idle',
  selectedVenueId: null,

  setQuery: (query) => set((s) => ({ filters: { ...s.filters, query } })),
  toggleCategory: (c) => set((s) => ({ filters: { ...s.filters, categories: toggleIn(s.filters.categories, c) } })),
  setUsage: (usage) => set((s) => ({ filters: { ...s.filters, usage } })),
  toggleAmenity: (a) => set((s) => ({ filters: { ...s.filters, amenities: toggleIn(s.filters.amenities, a) } })),
  setMaxDistance: (maxDistanceKm) => set((s) => ({ filters: { ...s.filters, maxDistanceKm } })),
  setOpenNow: (openNow) => set((s) => ({ filters: { ...s.filters, openNow } })),
  resetFilters: () => set((s) => ({ filters: { ...EMPTY_FILTERS, query: s.filters.query } })),
  setViewMode: (viewMode) => set({ viewMode }),
  setSort: (sort) => set({ sort }),
  selectVenue: (selectedVenueId) => set({ selectedVenueId }),

  requestLocation: async () => {
    if (get().locationStatus === 'loading') return;
    set({ locationStatus: 'loading' });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ locationStatus: 'denied' });
        return;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      set({
        userLocation: { latitude: pos.coords.latitude, longitude: pos.coords.longitude },
        locationStatus: 'granted',
      });
    } catch {
      set({ locationStatus: 'denied' });
    }
  },
}));

/** Quantidade de filtros ativos (para badge no botão de filtros) */
export const countActiveFilters = (f: ExploreFilters) =>
  f.categories.length + f.amenities.length + (f.usage !== 'all' ? 1 : 0) + (f.maxDistanceKm ? 1 : 0) + (f.openNow ? 1 : 0);

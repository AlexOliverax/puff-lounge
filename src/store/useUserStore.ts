/**
 * Store persistente do usuário (Zustand + AsyncStorage).
 * Guarda: verificação de idade, favoritos e o "Umidor Virtual".
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { HumidorEntry } from '../types';

interface UserState {
  /** true após a hidratação do AsyncStorage (evita "piscar" o age gate) */
  hydrated: boolean;
  ageVerified: boolean;
  favoriteVenueIds: string[];
  favoriteBrandIds: string[];
  humidor: HumidorEntry[];

  setHydrated: () => void;
  verifyAge: () => void;
  resetAge: () => void;
  toggleFavoriteVenue: (id: string) => void;
  toggleFavoriteBrand: (id: string) => void;
  addHumidorEntry: (entry: Omit<HumidorEntry, 'id' | 'createdAt'>) => void;
  updateHumidorEntry: (id: string, patch: Partial<HumidorEntry>) => void;
  removeHumidorEntry: (id: string) => void;
}

const toggle = (list: string[], id: string) =>
  list.includes(id) ? list.filter((x) => x !== id) : [id, ...list];

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      hydrated: false,
      ageVerified: false,
      favoriteVenueIds: [],
      favoriteBrandIds: [],
      humidor: [
        // Entrada de exemplo para o primeiro acesso
        {
          id: 'seed-1',
          cigarName: 'Serie D No. 4',
          brandId: 'partagas',
          vitola: 'Robusto',
          status: 'desejo',
          notes: 'Recomendação do sommelier do Caruso — harmonizar com Lagavulin 16.',
          createdAt: Date.now(),
        },
      ],

      setHydrated: () => set({ hydrated: true }),
      verifyAge: () => set({ ageVerified: true }),
      resetAge: () => set({ ageVerified: false }),
      toggleFavoriteVenue: (id) => set((s) => ({ favoriteVenueIds: toggle(s.favoriteVenueIds, id) })),
      toggleFavoriteBrand: (id) => set((s) => ({ favoriteBrandIds: toggle(s.favoriteBrandIds, id) })),
      addHumidorEntry: (entry) =>
        set((s) => ({
          humidor: [
            { ...entry, id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, createdAt: Date.now() },
            ...s.humidor,
          ],
        })),
      updateHumidorEntry: (id, patch) =>
        set((s) => ({ humidor: s.humidor.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      removeHumidorEntry: (id) => set((s) => ({ humidor: s.humidor.filter((e) => e.id !== id) })),
    }),
    {
      name: 'puff-lounge-user',
      storage: createJSONStorage(() => AsyncStorage),
      // Persiste apenas dados (nunca o flag de hidratação nem as funções)
      partialize: (s) => ({
        ageVerified: s.ageVerified,
        favoriteVenueIds: s.favoriteVenueIds,
        favoriteBrandIds: s.favoriteBrandIds,
        humidor: s.humidor,
      }),
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);

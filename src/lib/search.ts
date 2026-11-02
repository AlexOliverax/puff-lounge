/**
 * Motor de busca fuzzy client-side (Fuse.js).
 * Índices são criados uma única vez (dados estáticos) e reutilizados.
 * Tolerante a erros de digitação e acentos: "partagas", "monte cristo", "charutaria curitba".
 */
import Fuse, { IFuseOptions } from 'fuse.js';
import { BRANDS, ORIGIN_MAP } from '../data/brands';
import { VITOLAS } from '../data/culture';
import { VENUES } from '../data/venues';
import { CATEGORY_META } from '../data/amenities';
import { Brand, Venue, Vitola } from '../types';

/** Remove acentos para comparação insensível a diacríticos */
export const normalize = (s: string) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const baseOptions = {
  includeScore: true,
  threshold: 0.38,
  ignoreLocation: true,
  minMatchCharLength: 2,
  // Normaliza todos os campos indexados (ignora acentos)
  getFn: (obj: any, path: string | string[]) => {
    const value = Fuse.config.getFn(obj, path);
    if (Array.isArray(value)) return value.map((v) => normalize(String(v)));
    return typeof value === 'string' ? normalize(value) : (value as any);
  },
} satisfies Partial<IFuseOptions<unknown>>;

// Documentos de venue enriquecidos com rótulos de categoria (para buscar "tabacaria", "confraria"...)
const venueDocs = VENUES.map((v) => ({ ...v, categoryLabel: CATEGORY_META[v.category].label }));

const venueIndex = new Fuse(venueDocs, {
  ...baseOptions,
  keys: [
    { name: 'name', weight: 3 },
    { name: 'neighborhood', weight: 1.5 },
    { name: 'city', weight: 1.5 },
    { name: 'categoryLabel', weight: 1 },
    { name: 'tagline', weight: 0.6 },
    { name: 'highlights', weight: 0.5 },
  ],
});

const brandDocs = BRANDS.map((b) => ({
  ...b,
  originLabel: ORIGIN_MAP[b.origin].label,
  vitolaNames: b.famousVitolas.map((v) => v.name),
}));

const brandIndex = new Fuse(brandDocs, {
  ...baseOptions,
  keys: [
    { name: 'name', weight: 3 },
    { name: 'originLabel', weight: 1.2 },
    { name: 'region', weight: 1 },
    { name: 'vitolaNames', weight: 1.2 },
    { name: 'flavorProfile', weight: 0.8 },
    { name: 'masterBlenders', weight: 0.6 },
  ],
});

const vitolaIndex = new Fuse(VITOLAS, {
  ...baseOptions,
  keys: [
    { name: 'name', weight: 3 },
    { name: 'description', weight: 0.5 },
  ],
});

export function searchVenues(query: string, extraVenues: Venue[] = []): Venue[] {
  const curated = VENUES.map((v) => ({ ...v, isCurated: true }));
  const all = extraVenues.length > 0 ? [...curated, ...extraVenues] : curated;
  const q = normalize(query.trim());
  if (!q) return all;

  if (extraVenues.length === 0) {
    return venueIndex.search(q).map((r) => r.item);
  }

  const dynamicDocs = all.map((v) => ({ ...v, categoryLabel: CATEGORY_META[v.category].label }));
  const dynamicIndex = new Fuse(dynamicDocs, {
    ...baseOptions,
    keys: [
      { name: 'name', weight: 3 },
      { name: 'neighborhood', weight: 1.5 },
      { name: 'city', weight: 1.5 },
      { name: 'categoryLabel', weight: 1 },
      { name: 'tagline', weight: 0.6 },
      { name: 'highlights', weight: 0.5 },
    ],
  });
  return dynamicIndex.search(q).map((r) => r.item);
}

export function searchBrands(query: string): Brand[] {
  const q = normalize(query.trim());
  if (!q) return BRANDS;
  return brandIndex.search(q).map((r) => r.item);
}

export function searchVitolas(query: string): Vitola[] {
  const q = normalize(query.trim());
  if (!q) return VITOLAS;
  return vitolaIndex.search(q).map((r) => r.item);
}

/** Busca global (usada na Enciclopédia) */
export function searchAll(query: string) {
  return {
    venues: searchVenues(query).slice(0, 5),
    brands: searchBrands(query).slice(0, 8),
    vitolas: searchVitolas(query).slice(0, 5),
  };
}

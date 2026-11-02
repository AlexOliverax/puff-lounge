/**
 * Modelos de domínio do PUFF & LOUNGE.
 * Mantidos independentes de UI para facilitar a troca futura por uma API real.
 */

// ───────────────────────── Locais ─────────────────────────

export type VenueCategory = 'lounge' | 'shop' | 'club';

/** "Fumar no local" vs. "Somente compra" */
export type VenueUsage = 'smoke' | 'purchase';

export type AmenityId =
  | 'exaustao'
  | 'valet'
  | 'bar'
  | 'cafe'
  | 'terraco'
  | 'reserva'
  | 'umidor'
  | 'wifi';

export interface Amenity {
  id: AmenityId;
  label: string;
  icon: string; // nome do ícone Ionicons
}

export interface OpeningHours {
  /** 0 = domingo … 6 = sábado */
  day: number;
  open?: string; // "HH:mm"
  close?: string; // "HH:mm" (pode passar da meia-noite, ex.: "01:00")
  closed?: boolean;
}

export interface Venue {
  id: string;
  name: string;
  category: VenueCategory;
  usage: VenueUsage[];
  tagline: string;
  description: string;
  neighborhood: string;
  city: string;
  state: string;
  address: string;
  coords: { latitude: number; longitude: number };
  phone: string;
  website?: string;
  instagram?: string;
  rating: number; // 0–5
  reviewsCount: number;
  priceLevel: 1 | 2 | 3 | 4;
  amenities: AmenityId[];
  dressCode: string;
  houseBrands: string[]; // ids de Brand ou nomes livres
  hours: OpeningHours[];
  images: number[]; // require() locais
  highlights: string[];
  /** true para curadoria editorial fixa; false para locais descobertos no mapa da região */
  isCurated?: boolean;
}

// ───────────────────────── Marcas ─────────────────────────

export type OriginId = 'cuba' | 'dominicana' | 'nicaragua' | 'brasil' | 'honduras';

export interface Origin {
  id: OriginId;
  label: string;
  flag: string;
  region: string;
  terroir: string;
}

export type Strength = 'suave' | 'medio' | 'forte';

export interface BrandVitola {
  name: string;
  vitolaId: string; // referência a Vitola.id
  ringGauge: number;
  lengthMm: number;
  notes?: string;
}

export interface Brand {
  id: string;
  name: string;
  origin: OriginId;
  region: string;
  founded: number;
  founder: string;
  masterBlenders: string[];
  strength: Strength;
  tagline: string;
  history: string[];
  flavorProfile: string[];
  wrapper: string;
  famousVitolas: BrandVitola[];
  curiosity: string;
  monogram: string; // iniciais para o selo
  accent: string; // cor de destaque do selo
}

// ───────────────────────── Cultura ─────────────────────────

export interface Vitola {
  id: string;
  name: string;
  shape: 'parejo' | 'figurado';
  ringGauge: number; // cepo (1/64 de polegada)
  lengthMm: number;
  lengthIn: string;
  smokeTimeMin: [number, number];
  description: string;
  occasion: string;
  pairingIds: string[];
}

export interface CutType {
  id: string;
  name: string;
  icon: string;
  description: string;
  pros: string[];
  cons: string[];
  bestFor: string;
}

export interface LightingMethod {
  id: string;
  name: string;
  icon: string;
  verdict: 'recomendado' | 'aceitavel' | 'evitar';
  description: string;
}

export type PairingCategory = 'whisky' | 'rum' | 'cognac' | 'cafe' | 'vinho' | 'sem-alcool';

export interface Pairing {
  id: string;
  category: PairingCategory;
  name: string;
  examples: string[];
  strengthMatch: Strength[];
  notes: string;
  why: string;
  icon: string;
}

export interface Curiosity {
  id: string;
  title: string;
  category: 'historia' | 'cultivo' | 'ritual' | 'etiqueta';
  summary: string;
  body: string;
}

export interface AnatomyPart {
  id: 'capa' | 'capote' | 'tripa' | 'cabeca' | 'pe' | 'anilha';
  name: string;
  subtitle: string;
  description: string;
  details?: { name: string; text: string }[];
}

// ───────────────────────── Usuário ─────────────────────────

export interface HumidorEntry {
  id: string;
  cigarName: string;
  brandId?: string;
  vitola?: string;
  status: 'provado' | 'desejo';
  rating?: number; // 1–5
  notes: string;
  createdAt: number;
}

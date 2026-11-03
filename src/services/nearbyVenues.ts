/**
 * Serviço de geolocalização reversa (cidade/UF) e descoberta automática
 * de tabacarias, charutarias e cigar lounges reais na região do usuário
 * via OpenStreetMap (Nominatim + Overpass API — 100% gratuito e sem chave).
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VENUES } from '../data/venues';
import { distanceKm } from '../lib/geo';
import { AmenityId, OpeningHours, Venue, VenueCategory, VenueUsage } from '../types';

const STORAGE_CACHE_KEY = 'pl_discovered_venues_v1';

const IMG = {
  lounge: require('../../assets/images/lounge.jpg'),
  humidor: require('../../assets/images/humidor.jpg'),
  club: require('../../assets/images/club.jpg'),
};

const UF_BY_STATE: Record<string, string> = {
  acre: 'AC',
  alagoas: 'AL',
  amapa: 'AP',
  amazonas: 'AM',
  bahia: 'BA',
  ceara: 'CE',
  'distrito federal': 'DF',
  'espirito santo': 'ES',
  goias: 'GO',
  maranhao: 'MA',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'minas gerais': 'MG',
  para: 'PA',
  paraiba: 'PB',
  parana: 'PR',
  pernambuco: 'PE',
  piaui: 'PI',
  'rio de janeiro': 'RJ',
  'rio grande do norte': 'RN',
  'rio grande do sul': 'RS',
  rondonia: 'RO',
  roraima: 'RR',
  'santa catarina': 'SC',
  'sao paulo': 'SP',
  sergipe: 'SE',
  tocantins: 'TO',
};

const norm = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

function toUF(stateRaw?: string, isoCode?: string): string {
  if (isoCode && isoCode.includes('-')) {
    return isoCode.split('-')[1].toUpperCase();
  }
  if (!stateRaw) return 'BR';
  if (stateRaw.length === 2) return stateRaw.toUpperCase();
  return UF_BY_STATE[norm(stateRaw)] || stateRaw.slice(0, 2).toUpperCase();
}

/** Memória + cache persistente de locais descobertos para abrir detalhes e favoritos */
const discoveredById = new Map<string, Venue>();
let cacheHydrated = false;

export async function hydrateDiscoveredCache(): Promise<Venue[]> {
  if (cacheHydrated) return Array.from(discoveredById.values());
  cacheHydrated = true;
  try {
    const raw = await AsyncStorage.getItem(STORAGE_CACHE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Array<Omit<Venue, 'images'>>;
      for (const item of parsed) {
        const images =
          item.category === 'lounge'
            ? [IMG.lounge, IMG.humidor]
            : item.category === 'club'
              ? [IMG.club, IMG.lounge]
              : [IMG.humidor, IMG.lounge];
        discoveredById.set(item.id, { ...item, images });
      }
    }
  } catch {
    // ignora falha de leitura local
  }
  return Array.from(discoveredById.values());
}

async function persistDiscoveredVenues(venues: Venue[]) {
  for (const v of venues) {
    discoveredById.set(v.id, v);
  }
  try {
    // Mantém até 200 locais recentes sem serializar `require()` de imagens
    const all = Array.from(discoveredById.values())
      .slice(-200)
      .map(({ images: _img, ...rest }) => rest);
    await AsyncStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(all));
  } catch {
    // ignora erro de quota
  }
}

/** Busca qualquer local (curadoria fixa OU descoberto dinamicamente no mapa) */
export function resolveVenueById(id?: string): Venue | undefined {
  if (!id) return undefined;
  return VENUES.find((v) => v.id === id) || discoveredById.get(id);
}

export function getAllKnownVenues(): Venue[] {
  const curated = VENUES.map((v) => ({ ...v, isCurated: true }));
  const extras = Array.from(discoveredById.values());
  return [...curated, ...extras];
}

export interface CityInfo {
  city: string;
  state: string;
  label: string;
}

/** Descobre o nome da cidade/UF a partir do GPS do celular */
export async function reverseGeocodeCity(coords: {
  latitude: number;
  longitude: number;
}): Promise<CityInfo> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${coords.latitude}&lon=${coords.longitude}&zoom=12&accept-language=pt-BR`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) throw new Error('reverse failed');
    const data = await res.json();
    const addr = data?.address || {};
    const city =
      addr.city ||
      addr.town ||
      addr.municipality ||
      addr.village ||
      addr.county ||
      'Sua Região';
    const state = toUF(addr.state, addr['ISO3166-2-lvl4']);
    return {
      city,
      state,
      label: `${city}, ${state}`,
    };
  } catch {
    return {
      city: 'Sua Localização',
      state: 'BR',
      label: 'GPS Ativo',
    };
  }
}

export interface GeocodedCityOption extends CityInfo {
  latitude: number;
  longitude: number;
}

/** Busca cidades pelo nome (ex.: "Jundiaí", "Campinas", "São Paulo") */
export async function geocodeCityQuery(query: string): Promise<GeocodedCityOption[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(
      q,
    )}&countrycodes=br&addressdetails=1&featureType=settlement&limit=6&accept-language=pt-BR`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return [];
    const list = (await res.json()) as any[];
    const seen = new Set<string>();
    const out: GeocodedCityOption[] = [];

    for (const item of list) {
      const addr = item?.address || {};
      const city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.village ||
        item.name ||
        q;
      const state = toUF(addr.state, addr['ISO3166-2-lvl4']);
      const label = `${city}, ${state}`;
      const key = norm(label);
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({
        city,
        state,
        label,
        latitude: Number(item.lat),
        longitude: Number(item.lon),
      });
    }
    return out;
  } catch {
    return [];
  }
}

function defaultHours(category: VenueCategory): OpeningHours[] {
  const open = category === 'lounge' ? '14:00' : '09:00';
  const close = category === 'lounge' ? '23:00' : '20:00';
  return [0, 1, 2, 3, 4, 5, 6].map((day) =>
    day === 0 ? { day, closed: true } : { day, open, close },
  );
}

function parseSimpleHours(osmHours: string | undefined, category: VenueCategory): OpeningHours[] {
  if (!osmHours) return defaultHours(category);
  const match = osmHours.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return defaultHours(category);
  const open = match[1].padStart(5, '0');
  const close = match[2].padStart(5, '0');
  const openSunday = /su|dom|24\/7/i.test(osmHours);
  return [0, 1, 2, 3, 4, 5, 6].map((day) =>
    day === 0 && !openSunday ? { day, closed: true } : { day, open, close },
  );
}

function classifyOsmElement(name: string, tags: Record<string, string>): {
  category: VenueCategory;
  usage: VenueUsage[];
  amenities: AmenityId[];
} {
  const text = `${name} ${tags.amenity || ''} ${tags.club || ''} ${tags.description || ''}`;
  if (/confraria|clube?\b|priv[eé]/i.test(text) || tags.club === 'cigar') {
    return {
      category: 'club',
      usage: ['smoke'],
      amenities: ['umidor', 'bar', 'reserva'],
    };
  }
  if (/lounge|bar\b|bistr[oô]|caf[eé]|pub|deck/i.test(text) || tags.amenity === 'bar' || tags.amenity === 'cafe') {
    return {
      category: 'lounge',
      usage: ['smoke', 'purchase'],
      amenities: ['umidor', 'bar', 'cafe'],
    };
  }
  const amenities: AmenityId[] = ['umidor'];
  if (tags.internet_access && tags.internet_access !== 'no') amenities.push('wifi');
  if (tags.outdoor_seating === 'yes') amenities.push('terraco');
  return {
    category: 'shop',
    usage: ['purchase', 'smoke'],
    amenities,
  };
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

async function queryOverpass(overpassQl: string): Promise<any[]> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 18000);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset:UTF-8' },
        body: `data=${encodeURIComponent(overpassQl)}`,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!res.ok) continue;
      const json = await res.json();
      if (Array.isArray(json?.elements)) return json.elements;
    } catch {
      clearTimeout(timer);
    }
  }
  return [];
}

// Cache por região para não repetir chamadas idênticas ao trocar de aba
const regionFetchCache = new Map<string, { at: number; venues: Venue[] }>();

/**
 * Busca tabacarias, charutarias e lounges reais ao redor de `coords` dentro de `radiusKm`.
 */
export async function fetchNearbyOsmVenues(
  coords: { latitude: number; longitude: number },
  radiusKm: number,
  cityFallback: CityInfo,
): Promise<Venue[]> {
  const effectiveKm = Math.min(Math.max(radiusKm, 2), 100);
  const cacheKey = `${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}:${effectiveKm}`;
  const cached = regionFetchCache.get(cacheKey);
  if (cached && Date.now() - cached.at < 5 * 60 * 1000) {
    return cached.venues;
  }

  const rMeters = Math.round(effectiveKm * 1000);
  // Busca por nome com regex limitada a até 30 km para resposta rápida em capitais
  const rNameMeters = Math.min(rMeters, 30000);
  const lat = coords.latitude.toFixed(5);
  const lon = coords.longitude.toFixed(5);

  const query = `[out:json][timeout:20];
(
  nwr["shop"="tobacco"](around:${rMeters},${lat},${lon});
  nwr["shop"="cigar"](around:${rMeters},${lat},${lon});
  nwr["club"="cigar"](around:${rMeters},${lat},${lon});
  nwr["shop"]["name"~"tabacaria|charutaria|charuto|charutos|cigar|habano|habanos|humidor",i](around:${rNameMeters},${lat},${lon});
  nwr["amenity"~"^(bar|cafe|pub|nightclub|restaurant)$"]["name"~"tabacaria|charutaria|charuto|charutos|cigar|habano|habanos|humidor",i](around:${rNameMeters},${lat},${lon});
);
out center tags 120;`;

  const elements = await queryOverpass(query);
  const results: Venue[] = [];
  const seenNamesCoords = new Set<string>();

  for (const el of elements) {
    const tags: Record<string, string> = el.tags || {};
    const rawName = (tags.name || tags['brand'] || '').trim();
    if (!rawName) continue;

    // Ignora bancas de jornal comuns que não mencionam tabacaria/charuto
    if (tags.shop === 'newsagent' && !/tabacaria|charut|cigar|habano/i.test(rawName)) {
      continue;
    }

    const vLat = typeof el.lat === 'number' ? el.lat : el.center?.lat;
    const vLon = typeof el.lon === 'number' ? el.lon : el.center?.lon;
    if (typeof vLat !== 'number' || typeof vLon !== 'number') continue;

    const vCoords = { latitude: vLat, longitude: vLon };

    // Evita duplicar itens que já estão na curadoria oficial (mesmo local < 200 m)
    const duplicatesCurated = VENUES.some(
      (cv) =>
        distanceKm(cv.coords, vCoords) < 0.2 ||
        (norm(cv.name) === norm(rawName) && distanceKm(cv.coords, vCoords) < 3),
    );
    if (duplicatesCurated) continue;

    const dedupKey = `${norm(rawName)}:${vLat.toFixed(3)},${vLon.toFixed(3)}`;
    if (seenNamesCoords.has(dedupKey)) continue;
    seenNamesCoords.add(dedupKey);

    const { category, usage, amenities } = classifyOsmElement(rawName, tags);

    const street = tags['addr:street'] || '';
    const number = tags['addr:housenumber'] || '';
    const neighborhood =
      tags['addr:suburb'] ||
      tags['addr:neighbourhood'] ||
      tags['addr:quarter'] ||
      tags['addr:district'] ||
      'Região Central';
    const city = tags['addr:city'] || tags['addr:town'] || cityFallback.city;
    const state = tags['addr:state'] ? toUF(tags['addr:state']) : cityFallback.state;

    const streetLine = street ? `${street}${number ? `, ${number}` : ''}` : rawName;
    const address = `${streetLine} — ${neighborhood}, ${city}/${state}`;

    const phone = tags.phone || tags['contact:phone'] || tags['contact:whatsapp'] || '';
    const website = tags.website || tags['contact:website'] || undefined;
    const instagram = tags['contact:instagram'] || tags.instagram || undefined;

    const venue: Venue = {
      id: `osm-${el.type || 'node'}-${el.id}`,
      name: rawName,
      category,
      usage,
      tagline:
        category === 'lounge'
          ? `Lounge & tabacaria mapeado em ${city}.`
          : `Tabacaria e artigos para apreciadores em ${neighborhood}, ${city}.`,
      description:
        tags.description ||
        `${rawName} está localizado em ${neighborhood} (${city}/${state}). Espaço mapeado na rede geolocalizada da sua região — utilize o botão "Abrir Rota" para navegar diretamente até o endereço.`,
      neighborhood,
      city,
      state,
      address,
      coords: vCoords,
      phone,
      website,
      instagram,
      rating: 4.5,
      reviewsCount: 18,
      priceLevel: category === 'lounge' ? 3 : 2,
      amenities,
      dressCode: 'Casual livre. Consulte o estabelecimento para regras de degustação no local.',
      houseBrands: [],
      hours: parseSimpleHours(tags.opening_hours, category),
      images:
        category === 'lounge'
          ? [IMG.lounge, IMG.humidor]
          : category === 'club'
            ? [IMG.club, IMG.lounge]
            : [IMG.humidor, IMG.lounge],
      highlights: [
        `Localizado em ${city}/${state}`,
        phone ? `Contato: ${phone}` : 'Rota GPS direta disponível',
        tags.opening_hours ? `Horário: ${tags.opening_hours}` : 'Confirme o horário antes de visitar',
      ],
      isCurated: false,
    };

    results.push(venue);
  }

  regionFetchCache.set(cacheKey, { at: Date.now(), venues: results });
  await persistDiscoveredVenues(results);
  return results;
}

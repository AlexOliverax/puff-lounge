/**
 * Catálogo de comodidades (amenities) usado nos filtros e nas páginas de detalhe.
 */
import { Amenity, AmenityId, VenueCategory } from '../types';

export const AMENITIES: Amenity[] = [
  { id: 'exaustao', label: 'Exaustão de ar', icon: 'leaf-outline' },
  { id: 'valet', label: 'Valet / Estacionamento', icon: 'car-sport-outline' },
  { id: 'bar', label: 'Whisky & Coquetéis', icon: 'wine-outline' },
  { id: 'cafe', label: 'Café especial', icon: 'cafe-outline' },
  { id: 'terraco', label: 'Terraço ao ar livre', icon: 'sunny-outline' },
  { id: 'reserva', label: 'Reserva obrigatória', icon: 'calendar-outline' },
  { id: 'umidor', label: 'Umidor walk-in', icon: 'cube-outline' },
  { id: 'wifi', label: 'Wi-Fi', icon: 'wifi-outline' },
];

export const AMENITY_MAP: Record<AmenityId, Amenity> = AMENITIES.reduce(
  (acc, a) => ({ ...acc, [a.id]: a }),
  {} as Record<AmenityId, Amenity>,
);

export const CATEGORY_META: Record<
  VenueCategory,
  { label: string; short: string; icon: string; description: string }
> = {
  lounge: {
    label: 'Lounge / Cigar Bar',
    short: 'Lounge',
    icon: 'wine',
    description: 'Fumar no local, com assentos e ventilação adequada.',
  },
  shop: {
    label: 'Tabacaria / Charutaria',
    short: 'Tabacaria',
    icon: 'storefront',
    description: 'Varejo autorizado e umidores para compra.',
  },
  club: {
    label: 'Clube Privado / Confraria',
    short: 'Confraria',
    icon: 'key',
    description: 'Locais exclusivos mediante associação ou convite.',
  },
};

export const WEEKDAYS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

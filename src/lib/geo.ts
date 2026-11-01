/**
 * Utilitários de geolocalização e horário de funcionamento.
 */
import { OpeningHours, Venue } from '../types';

type LatLng = { latitude: number; longitude: number };

/** Distância em km pela fórmula de Haversine */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Formata distância de modo amigável: "850 m", "4,2 km", "432 km" */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 100) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km).toLocaleString('pt-BR')} km`;
}

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};

/**
 * Verifica se o local está aberto agora.
 * Suporta horários que atravessam a meia-noite (ex.: 16:00–02:00),
 * considerando também o "transbordo" do dia anterior.
 */
export function isOpenNow(hours: OpeningHours[], now: Date = new Date()): boolean {
  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const check = (h: OpeningHours | undefined, offsetDay: boolean) => {
    if (!h || h.closed || !h.open || !h.close) return false;
    const open = toMinutes(h.open);
    let close = toMinutes(h.close);
    const crossesMidnight = close <= open;
    if (crossesMidnight) close += 24 * 60;
    const t = offsetDay ? minutes + 24 * 60 : minutes;
    return t >= open && t < close;
  };

  const today = hours.find((h) => h.day === day);
  const yesterday = hours.find((h) => h.day === (day + 6) % 7);
  return check(today, false) || check(yesterday, true);
}

/** Texto curto do horário de hoje, ex.: "Hoje · 16:00 – 00:00" */
export function todayHoursLabel(venue: Venue, now: Date = new Date()): string {
  const h = venue.hours.find((x) => x.day === now.getDay());
  if (!h || h.closed) return 'Fechado hoje';
  return `Hoje · ${h.open} – ${h.close}`;
}

export const priceLabel = (level: number) => '$'.repeat(level);

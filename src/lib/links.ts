/**
 * Ações externas: rotas (Google Maps / Apple Maps / Waze), ligação, Instagram, site e compartilhamento.
 */
import { Alert, Linking, Platform } from 'react-native';
import { Venue } from '../types';

export type NavApp = 'google' | 'apple' | 'waze';

export function routeUrl(app: NavApp, venue: Venue): string {
  const { latitude, longitude } = venue.coords;
  const label = encodeURIComponent(venue.name);
  switch (app) {
    case 'apple':
      return `https://maps.apple.com/?daddr=${latitude},${longitude}&q=${label}`;
    case 'waze':
      return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    case 'google':
    default:
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
}

/** Apps de navegação disponíveis por plataforma */
export const availableNavApps = (): NavApp[] =>
  Platform.OS === 'ios' ? ['apple', 'google', 'waze'] : ['google', 'waze', 'apple'];

export const NAV_APP_LABEL: Record<NavApp, string> = {
  google: 'Google Maps',
  waze: 'Waze',
  apple: 'Apple Maps',
};

async function safeOpen(url: string) {
  try {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    await Linking.openURL(url);
  } catch {
    Alert.alert('Não foi possível abrir', 'Verifique se o aplicativo está instalado.');
  }
}

export const openRoute = (app: NavApp, venue: Venue) => safeOpen(routeUrl(app, venue));

export const callVenue = (venue: Venue) => {
  const digits = venue.phone.replace(/[^\d+]/g, '');
  if (!digits) return;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.location.href = `tel:${digits}`;
    return;
  }
  safeOpen(`tel:${digits}`);
};

export const openWebsite = (venue: Venue) => {
  if (venue.website) {
    safeOpen(venue.website);
    return;
  }
  if (venue.instagram) {
    openInstagram(venue);
  }
};

export const openInstagram = (venue: Venue) => {
  if (!venue.instagram) return;
  const handle = venue.instagram.replace(/^@/, '').trim();
  if (!handle) return;
  safeOpen(`https://www.instagram.com/${handle}/`);
};

export async function shareVenue(venue: Venue): Promise<'shared' | 'copied' | 'failed'> {
  const shareUrl =
    typeof window !== 'undefined' && window.location
      ? `${window.location.origin}/venue/${venue.id}`
      : `https://pufflounge.app.br/venue/${venue.id}`;
  const text = `${venue.name} (${venue.neighborhood} · ${venue.city}/${venue.state}) — ${venue.tagline}`;

  if (typeof navigator !== 'undefined' && typeof (navigator as any).share === 'function') {
    try {
      await (navigator as any).share({
        title: `${venue.name} · Puff & Lounge`,
        text,
        url: shareUrl,
      });
      return 'shared';
    } catch {
      // cancelado ou fallback para clipboard
    }
  }

  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(`${text}\n${shareUrl}`);
      return 'copied';
    } catch {
      return 'failed';
    }
  }
  return 'failed';
}

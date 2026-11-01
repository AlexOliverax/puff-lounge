/**
 * Ações externas: rotas (Google Maps / Apple Maps / Waze), ligação e site.
 */
import { Alert, Linking, Platform } from 'react-native';
import { Venue } from '../types';

export type NavApp = 'google' | 'apple' | 'waze';

export function routeUrl(app: NavApp, venue: Venue): string {
  const { latitude, longitude } = venue.coords;
  const label = encodeURIComponent(venue.name);
  switch (app) {
    case 'apple':
      return `http://maps.apple.com/?daddr=${latitude},${longitude}&q=${label}`;
    case 'waze':
      return `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    case 'google':
    default:
      return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${label}`;
  }
}

/** Apps de navegação disponíveis por plataforma */
export const availableNavApps = (): NavApp[] =>
  Platform.OS === 'ios' ? ['apple', 'google', 'waze'] : ['google', 'waze'];

export const NAV_APP_LABEL: Record<NavApp, string> = {
  google: 'Google Maps',
  apple: 'Apple Maps',
  waze: 'Waze',
};

async function safeOpen(url: string) {
  try {
    await Linking.openURL(url);
  } catch {
    Alert.alert('Não foi possível abrir', 'Verifique se o aplicativo está instalado.');
  }
}

export const openRoute = (app: NavApp, venue: Venue) => safeOpen(routeUrl(app, venue));

export const callVenue = (venue: Venue) => safeOpen(`tel:${venue.phone.replace(/[^\d+]/g, '')}`);

export const openWebsite = (venue: Venue) => venue.website && safeOpen(venue.website);

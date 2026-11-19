/**
 * Mapa Interativo Real para Web / PWA (iOS Safari, Android Chrome e Desktop).
 * Utiliza Leaflet + OpenStreetMap oficial (100% gratuito e sem API key) com filtro escuro de luxo,
 * desenhando em tempo real o pino do GPS do usuário, o círculo do raio em km, legenda e navegação rápida entre locais.
 */
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { CATEGORY_META } from '../data/amenities';
import { distanceKm, formatDistance, isOpenNow } from '../lib/geo';
import { openRoute } from '../lib/links';
import { useExploreStore } from '../store/useExploreStore';
import { useUserStore } from '../store/useUserStore';
import { colors, fonts, radius, spacing } from '../theme';
import { Venue } from '../types';

interface InteractiveMapProps {
  venues: Venue[];
}

function ensureLuxuryMapStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById('pl-leaflet-luxury-css')) return;

  if (!document.querySelector('link[href*="leaflet.css"]')) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
  }

  const style = document.createElement('style');
  style.id = 'pl-leaflet-luxury-css';
  style.textContent = `
    .leaflet-container {
      background: #0A0A0A !important;
      font-family: Inter_500Medium, sans-serif;
    }
    /* Tema escuro de luxo sobre os blocos oficiais gratuitos do OpenStreetMap */
    .leaflet-tile-pane {
      filter: invert(100%) hue-rotate(180deg) brightness(92%) contrast(92%) saturate(60%);
    }
    .leaflet-control-zoom {
      border: 1px solid rgba(212, 175, 55, 0.35) !important;
      border-radius: 10px !important;
      overflow: hidden;
      box-shadow: 0 6px 18px rgba(0,0,0,0.6) !important;
    }
    .leaflet-control-zoom a {
      background: rgba(26, 24, 23, 0.92) !important;
      color: #D4AF37 !important;
      border-bottom: 1px solid rgba(212, 175, 55, 0.2) !important;
    }
    .leaflet-control-attribution {
      background: rgba(15, 14, 14, 0.7) !important;
      color: #6E685F !important;
      font-size: 9px !important;
    }
    .leaflet-control-attribution a {
      color: #9E988E !important;
    }
    .leaflet-tooltip.pl-pin-tooltip {
      background: rgba(15, 14, 14, 0.94) !important;
      border: 1px solid rgba(212, 175, 55, 0.5) !important;
      color: #F5F2EB !important;
      border-radius: 8px !important;
      padding: 4px 8px !important;
      font-size: 11px !important;
      font-weight: 600 !important;
      box-shadow: 0 4px 12px rgba(0,0,0,0.7) !important;
    }
    .leaflet-tooltip-top.pl-pin-tooltip:before {
      border-top-color: rgba(212, 175, 55, 0.5) !important;
    }
    @keyframes plPulse {
      0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.65); }
      70% { transform: scale(1); box-shadow: 0 0 0 14px rgba(212, 175, 55, 0); }
      100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
    }
    .pl-user-dot {
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #D4AF37;
      border: 3px solid #0F0E0E;
      animation: plPulse 2.2s infinite;
    }
    .pl-venue-pin {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #1A1817;
      border: 2px solid #D4AF37;
      color: #D4AF37;
      font-size: 14px;
      font-weight: 700;
      box-shadow: 0 4px 12px rgba(0,0,0,0.65);
      transition: transform 0.15s ease;
    }
    .pl-venue-pin--selected {
      width: 42px;
      height: 42px;
      background: #D4AF37;
      border: 2.5px solid #F5F2EB;
      color: #0F0E0E;
      font-size: 17px;
      box-shadow: 0 0 22px rgba(212, 175, 55, 0.75);
    }
  `;
  document.head.appendChild(style);
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ venues }) => {
  const router = useRouter();
  const {
    userLocation,
    filters,
    selectedVenueId,
    selectVenue,
    requestLocation,
    locationStatus,
    stepRadius,
  } = useExploreStore();
  const { favoriteVenueIds, toggleFavoriteVenue } = useUserStore();

  const hostRef = useRef<any>(null);
  const mapRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const radiusCircleRef = useRef<any>(null);
  const markersLayerRef = useRef<any>(null);
  const lastFitKeyRef = useRef<string>('');
  const [mapReady, setMapReady] = useState(false);

  const selectedIndex = Math.max(
    0,
    venues.findIndex((v) => v.id === selectedVenueId),
  );
  const selectedVenue = venues[selectedIndex] || venues[0];

  // Inicializa o mapa Leaflet uma única vez
  useEffect(() => {
    if (typeof window === 'undefined') return;
    ensureLuxuryMapStyles();

    let cancelled = false;

    (async () => {
      const leafletMod: any = await import('leaflet');
      const L = leafletMod.default || leafletMod;
      if (cancelled) return;
      leafletRef.current = L;

      const parentEl: HTMLElement | null =
        hostRef.current && typeof hostRef.current.appendChild === 'function'
          ? hostRef.current
          : null;

      if (!parentEl || mapRef.current) return;

      const mapDiv = document.createElement('div');
      mapDiv.style.width = '100%';
      mapDiv.style.height = '100%';
      parentEl.innerHTML = '';
      parentEl.appendChild(mapDiv);

      const map = L.map(mapDiv, {
        center: [userLocation.latitude, userLocation.longitude],
        zoom: 12,
        zoomControl: true,
      });

      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 19,
      }).addTo(map);

      const userIcon = L.divIcon({
        className: '',
        html: '<div class="pl-user-dot" title="Sua posição"></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      userMarkerRef.current = L.marker(
        [userLocation.latitude, userLocation.longitude],
        { icon: userIcon, zIndexOffset: 1000 },
      )
        .addTo(map)
        .bindTooltip('Centro da sua busca', {
          direction: 'top',
          offset: [0, -10],
          className: 'pl-pin-tooltip',
        });

      markersLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
      setMapReady(true);

      setTimeout(() => map.invalidateSize(), 150);
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Atualiza posição do usuário e círculo dourado do raio selecionado
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    if (!mapReady || !map || !L) return;

    const latLng: [number, number] = [userLocation.latitude, userLocation.longitude];

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng(latLng);
    }

    if (radiusCircleRef.current) {
      radiusCircleRef.current.remove();
      radiusCircleRef.current = null;
    }

    const radiusKm = filters.maxDistanceKm;
    if (radiusKm !== null) {
      radiusCircleRef.current = L.circle(latLng, {
        radius: radiusKm * 1000,
        color: '#D4AF37',
        weight: 1.5,
        opacity: 0.75,
        fillColor: '#D4AF37',
        fillOpacity: 0.08,
        dashArray: '6 6',
      }).addTo(map);
    }

    const fitKey = `${latLng[0].toFixed(4)},${latLng[1].toFixed(4)}:${String(radiusKm)}`;
    if (lastFitKeyRef.current !== fitKey) {
      lastFitKeyRef.current = fitKey;
      if (radiusCircleRef.current) {
        map.fitBounds(radiusCircleRef.current.getBounds(), {
          padding: [28, 28],
          maxZoom: 15,
          animate: true,
        });
      } else if (venues.length > 0) {
        const bounds = L.latLngBounds(
          venues.map((v) => [v.coords.latitude, v.coords.longitude] as [number, number]),
        );
        bounds.extend(latLng);
        map.fitBounds(bounds, { padding: [36, 36], maxZoom: 13, animate: true });
      } else {
        map.setView(latLng, 12);
      }
    }
  }, [mapReady, userLocation, filters.maxDistanceKm, venues.length]);

  // Atualiza marcadores dos locais filtrados
  useEffect(() => {
    const map = mapRef.current;
    const L = leafletRef.current;
    const layer = markersLayerRef.current;
    if (!mapReady || !map || !L || !layer) return;

    layer.clearLayers();

    venues.forEach((v) => {
      const isSelected = v.id === selectedVenue?.id;
      const symbol = v.category === 'lounge' ? '★' : v.category === 'club' ? '♛' : '◆';
      const size = isSelected ? 42 : 32;

      const icon = L.divIcon({
        className: '',
        html: `<div class="pl-venue-pin ${isSelected ? 'pl-venue-pin--selected' : ''}">${symbol}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
      });

      const marker = L.marker([v.coords.latitude, v.coords.longitude], {
        icon,
        zIndexOffset: isSelected ? 900 : 200,
      });

      marker.bindTooltip(`${v.name} · ★ ${v.rating.toFixed(1)}`, {
        direction: 'top',
        offset: [0, -16],
        className: 'pl-pin-tooltip',
      });

      marker.on('click', () => {
        selectVenue(v.id);
        map.panTo([v.coords.latitude, v.coords.longitude], { animate: true });
      });

      marker.addTo(layer);
    });
  }, [mapReady, venues, selectedVenue?.id, selectVenue]);

  const handleRecenterGps = () => {
    requestLocation(true);
    if (mapRef.current) {
      mapRef.current.setView([userLocation.latitude, userLocation.longitude], 13, {
        animate: true,
      });
    }
  };

  const handleCycleVenue = (dir: -1 | 1) => {
    if (venues.length === 0) return;
    const nextIdx = (selectedIndex + dir + venues.length) % venues.length;
    const nextVenue = venues[nextIdx];
    selectVenue(nextVenue.id);
    if (mapRef.current) {
      mapRef.current.panTo([nextVenue.coords.latitude, nextVenue.coords.longitude], {
        animate: true,
      });
    }
  };

  const isSelectedOpen = selectedVenue ? isOpenNow(selectedVenue.hours) : false;
  const isSelectedFav = selectedVenue ? favoriteVenueIds.includes(selectedVenue.id) : false;

  return (
    <View style={styles.container}>
      <View
        ref={(node: any) => {
          hostRef.current = node;
        }}
        style={styles.mapCanvas}
      />

      {/* Botão flutuante para centralizar no GPS atual */}
      <Pressable onPress={handleRecenterGps} style={styles.gpsFloatingBtn}>
        <Ionicons
          name={locationStatus === 'loading' ? 'sync' : 'locate'}
          size={20}
          color={colors.gold}
        />
      </Pressable>

      {/* Contador de resultados + Legenda dos Pinos */}
      <View style={styles.topBadgesWrap}>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>
            {venues.length}{' '}
            {venues.length === 1 ? 'local neste raio' : 'locais neste raio'}
          </Text>
        </View>
        <View style={styles.legendPill}>
          <Text style={styles.legendText}>★ Lounge · ◆ Tabacaria · ♛ Confraria</Text>
        </View>
      </View>

      {/* Card Flutuante Centralizado do Local Selecionado */}
      <View style={styles.bottomCardWrapper} pointerEvents="box-none">
        {selectedVenue ? (
          <View style={styles.floatingPreview}>
            {/* Cabeçalho com contador e botões Anterior / Próximo */}
            <View style={styles.previewTopBar}>
              <View style={styles.previewMetaRow}>
                <Text style={styles.previewCategory}>
                  {CATEGORY_META[selectedVenue.category].short.toUpperCase()}
                </Text>
                <Text style={styles.previewDist}>
                  · {formatDistance(distanceKm(userLocation, selectedVenue.coords))}
                </Text>
                <View style={styles.openBadgeInline}>
                  <View
                    style={[
                      styles.openDot,
                      { backgroundColor: isSelectedOpen ? colors.success : colors.danger },
                    ]}
                  />
                  <Text style={styles.openBadgeText}>
                    {isSelectedOpen ? 'Aberto' : 'Fechado'}
                  </Text>
                </View>
              </View>

              {venues.length > 1 && (
                <View style={styles.cycleControls}>
                  <Pressable
                    onPress={() => handleCycleVenue(-1)}
                    style={styles.cycleBtn}
                    hitSlop={6}
                  >
                    <Ionicons name="chevron-back" size={14} color={colors.gold} />
                  </Pressable>
                  <Text style={styles.cycleIndexText}>
                    {selectedIndex + 1}/{venues.length}
                  </Text>
                  <Pressable
                    onPress={() => handleCycleVenue(1)}
                    style={styles.cycleBtn}
                    hitSlop={6}
                  >
                    <Ionicons name="chevron-forward" size={14} color={colors.gold} />
                  </Pressable>
                </View>
              )}
            </View>

            <View style={styles.previewContent}>
              <View style={{ flex: 1 }}>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {selectedVenue.name}
                </Text>
                <Text style={styles.previewAddress} numberOfLines={1}>
                  {selectedVenue.neighborhood} · {selectedVenue.city}, {selectedVenue.state}
                </Text>
              </View>

              <View style={styles.previewActions}>
                <Pressable
                  onPress={() => toggleFavoriteVenue(selectedVenue.id)}
                  style={styles.routeIconBtn}
                >
                  <Ionicons
                    name={isSelectedFav ? 'bookmark' : 'bookmark-outline'}
                    size={16}
                    color={isSelectedFav ? colors.gold : colors.textSecondary}
                  />
                </Pressable>

                <Pressable
                  onPress={() => openRoute('waze', selectedVenue)}
                  style={styles.routeIconBtn}
                >
                  <Ionicons name="car-sport-outline" size={16} color={colors.gold} />
                </Pressable>

                <Pressable
                  onPress={() => openRoute('google', selectedVenue)}
                  style={styles.routeIconBtn}
                >
                  <Ionicons name="navigate" size={16} color={colors.gold} />
                </Pressable>

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/venue/[id]',
                      params: { id: selectedVenue.id },
                    })
                  }
                  style={styles.previewBtn}
                >
                  <Text style={styles.previewBtnText}>Detalhes</Text>
                  <Ionicons name="chevron-forward" size={15} color="#0F0E0E" />
                </Pressable>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.floatingPreview}>
            <Text style={styles.emptyMapText}>
              Nenhum local neste raio. Amplie o alcance em km para explorar mais opções.
            </Text>
            {filters.maxDistanceKm !== null && (
              <Pressable onPress={() => stepRadius('up')} style={styles.expandInlineBtn}>
                <Ionicons name="add-circle-outline" size={16} color="#0F0E0E" />
                <Text style={styles.expandInlineBtnText}>Ampliar Raio</Text>
              </Pressable>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    position: 'relative',
    overflow: 'hidden',
  },
  mapCanvas: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gpsFloatingBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(26, 24, 23, 0.92)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  topBadgesWrap: {
    position: 'absolute',
    top: spacing.md,
    left: 56,
    right: 64,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
    zIndex: 1000,
  },
  countPill: {
    backgroundColor: 'rgba(15, 14, 14, 0.88)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  countPillText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
  },
  legendPill: {
    backgroundColor: 'rgba(15, 14, 14, 0.82)',
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  legendText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.textSecondary,
  },
  bottomCardWrapper: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    right: spacing.md,
    alignItems: 'center',
    zIndex: 1000,
  },
  floatingPreview: {
    width: '100%',
    maxWidth: 640,
    backgroundColor: 'rgba(26, 24, 23, 0.96)',
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.md,
  },
  previewTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  previewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
  },
  previewCategory: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 1.4,
  },
  previewDist: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.goldSoft,
  },
  openBadgeInline: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: radius.pill,
    marginLeft: 2,
  },
  openDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    marginRight: 4,
  },
  openBadgeText: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.textSecondary,
  },
  cycleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cycleBtn: {
    width: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cycleIndexText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.goldSoft,
    marginHorizontal: 2,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    color: colors.text,
  },
  previewAddress: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.sm,
    gap: 6,
  },
  routeIconBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewBtnText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: '#0F0E0E',
    marginRight: 3,
  },
  emptyMapText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  expandInlineBtn: {
    marginTop: spacing.sm,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold,
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
  },
  expandInlineBtnText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: '#0F0E0E',
  },
});

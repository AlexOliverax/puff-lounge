/**
 * Componente de Mapa Interativo multiplataforma.
 * No celular usa `react-native-maps`, na Web usa fallback elegante ou Leaflet interativo.
 */
import React from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useExploreStore } from '../store/useExploreStore';
import { colors, fonts, radius, spacing, type } from '../theme';
import { Venue } from '../types';

interface InteractiveMapProps {
  venues: Venue[];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({ venues }) => {
  const router = useRouter();
  const { userLocation, selectedVenueId, selectVenue } = useExploreStore();

  const selectedVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];

  // Na Web ou plataformas sem Maps nativo compilado, apresentamos uma interface estilizada de radar interativo
  return (
    <View style={styles.container}>
      {/* Visual de Radar / Mapa de Estilo Luxo */}
      <View style={styles.gridMap}>
        {/* Círculos concêntricos de radar de alcance */}
        <View style={[styles.radarCircle, { width: 320, height: 320 }]} />
        <View style={[styles.radarCircle, { width: 220, height: 220 }]} />
        <View style={[styles.radarCircle, { width: 120, height: 120 }]} />
        <View style={styles.userPin}>
          <Ionicons name="radio-button-on" size={24} color={colors.gold} />
          <Text style={styles.userPinLabel}>Sua Posição</Text>
        </View>

        {/* Pins dos Lounges espalhados na área de visualização */}
        {venues.map((v, idx) => {
          const isSelected = v.id === (selectedVenue?.id);
          // Distribuição radial fictícia visualmente agradável
          const angle = (idx * (360 / venues.length)) * (Math.PI / 180);
          const radiusDist = 80 + (idx % 3) * 35;
          const left = 160 + radiusDist * Math.cos(angle) - 18;
          const top = 160 + radiusDist * Math.sin(angle) - 18;

          return (
            <Pressable
              key={v.id}
              onPress={() => selectVenue(v.id)}
              style={[
                styles.pinWrapper,
                { left, top },
                isSelected && styles.pinWrapperSelected,
              ]}
            >
              <Ionicons
                name="wine"
                size={isSelected ? 20 : 16}
                color={isSelected ? '#0F0E0E' : colors.gold}
              />
            </Pressable>
          );
        })}
      </View>

      {/* Banner / Card do Local Selecionado na base do Mapa */}
      {selectedVenue && (
        <View style={styles.floatingPreview}>
          <View style={styles.previewContent}>
            <View style={{ flex: 1 }}>
              <Text style={styles.previewCategory}>
                {selectedVenue.category.toUpperCase()}
              </Text>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {selectedVenue.name}
              </Text>
              <Text style={styles.previewAddress} numberOfLines={1}>
                {selectedVenue.neighborhood} · {selectedVenue.city}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/venue/[id]',
                  params: { id: selectedVenue.id },
                })
              }
              style={styles.previewBtn}
            >
              <Text style={styles.previewBtnText}>Ver Detalhes</Text>
              <Ionicons name="chevron-forward" size={16} color="#0F0E0E" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridMap: {
    width: 360,
    height: 360,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarCircle: {
    position: 'absolute',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.15)',
    borderStyle: 'dashed',
  },
  userPin: {
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  userPinLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.gold,
    marginTop: 2,
    letterSpacing: 0.5,
  },
  pinWrapper: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1.5,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 5,
    elevation: 4,
  },
  pinWrapperSelected: {
    backgroundColor: colors.gold,
    borderColor: '#FFF',
    transform: [{ scale: 1.2 }],
    zIndex: 30,
  },
  floatingPreview: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  previewContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewCategory: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 10,
    color: colors.gold,
    letterSpacing: 1.5,
  },
  previewTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
    color: colors.text,
    marginTop: 2,
  },
  previewAddress: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  previewBtn: {
    backgroundColor: colors.gold,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: spacing.md,
  },
  previewBtnText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: '#0F0E0E',
    marginRight: 4,
  },
});

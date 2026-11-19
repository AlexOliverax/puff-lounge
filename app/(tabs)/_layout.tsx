/**
 * Configuração das 4 Abas Principais de Navegação com design de alta classe:
 * 1. Explorar (Mapa / Lista de Lounges)
 * 2. Enciclopédia (Marcas, Vitolas & História)
 * 3. Harmonização (Pairings Exclusivos)
 * 4. Umidor (Favoritos & Notas Pessoais)
 */
import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, fonts } from '../../src/theme';

export default function TabLayout() {
  const humidorCount = useUserStore((s) => s.humidor.length);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.gold,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: '#141312',
          borderTopColor: 'rgba(212, 175, 55, 0.25)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 68,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
          paddingTop: 8,
          shadowColor: '#000',
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 12,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.sansMedium,
          fontSize: 11,
          letterSpacing: 0.3,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'compass' : 'compass-outline'}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="encyclopedia"
        options={{
          title: 'Enciclopédia',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'book' : 'book-outline'}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="pairing"
        options={{
          title: 'Harmonização',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'wine' : 'wine-outline'}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="humidor"
        options={{
          title: 'Meu Umidor',
          tabBarBadge: humidorCount > 0 ? humidorCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: colors.gold,
            color: '#0F0E0E',
            fontFamily: fonts.sansBold,
            fontSize: 10,
          },
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'shield' : 'shield-outline'}
              size={22}
              color={color as string}
            />
          ),
        }}
      />
    </Tabs>
  );
}

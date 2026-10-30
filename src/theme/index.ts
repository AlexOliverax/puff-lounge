/**
 * PUFF & LOUNGE — Design System de Luxo
 * --------------------------------------
 * Tokens centralizados de cor, tipografia, espaçamento, raios e sombras.
 * Todos os componentes devem consumir estes tokens (nada de valores "soltos").
 */
import { Platform, TextStyle, ViewStyle } from 'react-native';

export const colors = {
  // Fundos
  background: '#0F0E0E', // Obsidiana profunda
  surface: '#1A1817', // Carvão quente
  surfaceAlt: '#24201E', // Couro envelhecido
  surfaceRaised: '#2C2724',

  // Acentos
  gold: '#D4AF37', // Ouro metálico / champagne
  goldSoft: '#E8CF7A',
  goldDeep: '#A8862A',
  tobacco: '#8C5A3C', // Tabaco Havana / âmbar
  tobaccoLight: '#B07A55',

  // Texto
  text: '#F5F2EB', // Creme
  textSecondary: '#9E988E', // Cinza quente
  textMuted: '#6E685F',

  // Bordas / overlays
  border: 'rgba(212, 175, 55, 0.2)',
  borderStrong: 'rgba(212, 175, 55, 0.45)',
  borderSubtle: 'rgba(245, 242, 235, 0.06)',
  overlay: 'rgba(15, 14, 14, 0.72)',
  goldGlow: 'rgba(212, 175, 55, 0.12)',

  // Estados
  success: '#7FA36B',
  danger: '#C0614B',

  // Categorias de local
  lounge: '#D4AF37',
  shop: '#B07A55',
  club: '#C9B79C',
} as const;

/** Gradientes reutilizáveis (para expo-linear-gradient) */
export const gradients = {
  gold: ['#F1D98A', '#D4AF37', '#9C7A22'] as const,
  goldSubtle: ['rgba(212,175,55,0.18)', 'rgba(212,175,55,0)'] as const,
  leather: ['#2A2421', '#1A1817'] as const,
  fadeBottom: ['rgba(15,14,14,0)', 'rgba(15,14,14,0.65)', '#0F0E0E'] as const,
  tobacco: ['#B07A55', '#8C5A3C', '#5E3B26'] as const,
};

/** Famílias tipográficas (carregadas em app/_layout.tsx via @expo-google-fonts) */
export const fonts = {
  serif: 'PlayfairDisplay_600SemiBold',
  serifBold: 'PlayfairDisplay_700Bold',
  serifItalic: 'PlayfairDisplay_400Regular_Italic',
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemiBold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
} as const;

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  xl: 24,
  pill: 999,
} as const;

/** Escala tipográfica editorial */
export const type: Record<string, TextStyle> = {
  display: { fontFamily: fonts.serifBold, fontSize: 34, lineHeight: 40, color: colors.text, letterSpacing: -0.3 },
  h1: { fontFamily: fonts.serifBold, fontSize: 28, lineHeight: 34, color: colors.text },
  h2: { fontFamily: fonts.serif, fontSize: 22, lineHeight: 28, color: colors.text },
  h3: { fontFamily: fonts.serif, fontSize: 18, lineHeight: 24, color: colors.text },
  quote: { fontFamily: fonts.serifItalic, fontSize: 16, lineHeight: 24, color: colors.goldSoft },
  body: { fontFamily: fonts.sans, fontSize: 15, lineHeight: 23, color: colors.text },
  bodySecondary: { fontFamily: fonts.sans, fontSize: 14, lineHeight: 21, color: colors.textSecondary },
  label: { fontFamily: fonts.sansSemiBold, fontSize: 13, color: colors.text },
  caption: { fontFamily: fonts.sansMedium, fontSize: 12, color: colors.textSecondary },
  overline: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    letterSpacing: 2.2,
    textTransform: 'uppercase',
    color: colors.gold,
  },
};

/** Sombras suaves multiplataforma */
export const shadows: Record<'card' | 'glow' | 'float', ViewStyle> = {
  card: Platform.select<ViewStyle>({
    web: { boxShadow: '0 10px 30px rgba(0,0,0,0.45)' } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.45,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 10 },
      elevation: 8,
    },
  })!,
  glow: Platform.select<ViewStyle>({
    web: { boxShadow: '0 0 24px rgba(212,175,55,0.25)' } as ViewStyle,
    default: {
      shadowColor: colors.gold,
      shadowOpacity: 0.3,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 0 },
      elevation: 6,
    },
  })!,
  float: Platform.select<ViewStyle>({
    web: { boxShadow: '0 18px 50px rgba(0,0,0,0.6)' } as ViewStyle,
    default: {
      shadowColor: '#000',
      shadowOpacity: 0.6,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 14 },
      elevation: 14,
    },
  })!,
};

/** Borda dourada sutil padrão */
export const goldBorder: ViewStyle = {
  borderWidth: 1,
  borderColor: colors.border,
};

/** Largura máxima de conteúdo na Web (layout responsivo tipo "app" centralizado) */
export const MAX_CONTENT_WIDTH = 760;

export const theme = { colors, gradients, fonts, spacing, radius, type, shadows, goldBorder };
export default theme;

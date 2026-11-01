/**
 * Convite de instalação do PWA (somente Web / pufflounge.app.br).
 * - Não aparece se o app já estiver instalado (aberto em modo standalone).
 * - Android/Chrome: usa o prompt nativo de instalação (beforeinstallprompt).
 * - iPhone/iPad: mostra o passo a passo "Compartilhar → Adicionar à Tela de Início".
 * - Respeita o "Agora não" por alguns dias para não incomodar.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Image, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/useUserStore';
import { colors, fonts, radius, spacing } from '../theme';

const DISMISS_KEY = 'pl_install_dismissed_at';
const DISMISS_DAYS = 3;
const SHOW_DELAY_MS = 1500;

type Mode = 'android-native' | 'android-manual' | 'ios-safari' | 'ios-other' | 'ios-inapp';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

declare global {
  interface Window {
    __plInstallPrompt?: BeforeInstallPromptEvent | null;
  }
}

function isStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  const mq = window.matchMedia?.('(display-mode: standalone)').matches;
  const iosStandalone = (window.navigator as any).standalone === true;
  const fromPwaUrl = window.location?.search?.includes('source=pwa');
  return Boolean(mq || iosStandalone || fromPwaUrl);
}

function recentlyDismissed(): boolean {
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    return Date.now() - Number(raw) < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function detectMode(hasNativePrompt: boolean): Mode | null {
  const ua = window.navigator.userAgent || '';
  const isIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    // iPadOS 13+ se identifica como Mac
    (/Macintosh/i.test(ua) && (window.navigator as any).maxTouchPoints > 1);
  const isAndroid = /Android/i.test(ua);

  if (isIOS) {
    if (/Instagram|FBAN|FBAV|Line\/|WhatsApp|TikTok/i.test(ua)) return 'ios-inapp';
    if (/CriOS|FxiOS|EdgiOS|OPiOS/i.test(ua)) return 'ios-other';
    return 'ios-safari';
  }
  if (isAndroid) return hasNativePrompt ? 'android-native' : 'android-manual';
  return null; // Desktop: não exibe
}

export const InstallPrompt: React.FC = () => {
  const { ageVerified, hydrated } = useUserStore();
  const [mode, setMode] = useState<Mode | null>(null);
  const [visible, setVisible] = useState(false);

  // Detecta plataforma e disponibilidade do prompt nativo
  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') return;
    if (isStandalone()) return;

    const refresh = () => setMode(detectMode(Boolean(window.__plInstallPrompt)));
    refresh();

    const onInstalled = () => {
      window.__plInstallPrompt = null;
      setVisible(false);
      setMode(null);
    };
    window.addEventListener('pl-install-available', refresh);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('pl-install-available', refresh);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Só mostra depois da verificação de 18+
  useEffect(() => {
    if (!mode || !hydrated || !ageVerified || recentlyDismissed()) return;
    const t = setTimeout(() => setVisible(true), SHOW_DELAY_MS);
    return () => clearTimeout(t);
  }, [mode, hydrated, ageVerified]);

  const dismiss = useCallback(() => {
    try {
      window.localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {}
    setVisible(false);
  }, []);

  const installNative = useCallback(async () => {
    const evt = window.__plInstallPrompt;
    if (!evt) return;
    await evt.prompt();
    const { outcome } = await evt.userChoice;
    window.__plInstallPrompt = null;
    if (outcome === 'accepted') setVisible(false);
    else dismiss();
  }, [dismiss]);

  if (Platform.OS !== 'web' || !visible || !mode) return null;

  return (
    <View style={styles.overlay}>
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss} />
      <View style={styles.sheet}>
        <Pressable style={styles.close} onPress={dismiss} hitSlop={12}>
          <Ionicons name="close" size={22} color={colors.textSecondary} />
        </Pressable>

        <View style={styles.header}>
          <Image source={require('../../assets/icon.png')} style={styles.icon} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>Instale o Puff & Lounge</Text>
            <Text style={styles.subtitle}>
              Acesso rápido pela tela inicial, em tela cheia, como um app.
            </Text>
          </View>
        </View>

        {mode === 'android-native' && (
          <Pressable style={styles.primaryBtn} onPress={installNative}>
            <Ionicons name="download-outline" size={20} color="#0F0E0E" />
            <Text style={styles.primaryText}>Instalar na tela inicial</Text>
          </Pressable>
        )}

        {mode === 'android-manual' && (
          <View style={styles.steps}>
            <Step n={1} icon="ellipsis-vertical" text="Toque no menu ⋮ do navegador" />
            <Step n={2} icon="add-circle-outline" text={'Escolha "Instalar app" ou "Adicionar à tela inicial"'} />
          </View>
        )}

        {mode === 'ios-safari' && (
          <View style={styles.steps}>
            <Step n={1} icon="share-outline" text="Toque em Compartilhar na barra do Safari" />
            <Step n={2} icon="add-circle-outline" text={'Role e toque em "Adicionar à Tela de Início"'} />
            <Step n={3} icon="checkmark-circle-outline" text={'Confirme em "Adicionar"'} />
          </View>
        )}

        {mode === 'ios-other' && (
          <View style={styles.steps}>
            <Step n={1} icon="share-outline" text="Toque em Compartilhar (ícone na barra de endereço)" />
            <Step n={2} icon="add-circle-outline" text={'Toque em "Adicionar à Tela de Início"'} />
            <Text style={styles.hint}>Se não aparecer a opção, abra pufflounge.app.br no Safari.</Text>
          </View>
        )}

        {mode === 'ios-inapp' && (
          <View style={styles.steps}>
            <Step n={1} icon="ellipsis-horizontal" text="Toque no menu ••• deste app" />
            <Step n={2} icon="compass-outline" text={'Escolha "Abrir no navegador" (Safari)'} />
            <Step n={3} icon="share-outline" text={'Depois: Compartilhar → "Adicionar à Tela de Início"'} />
          </View>
        )}

        <Pressable style={styles.secondaryBtn} onPress={dismiss}>
          <Text style={styles.secondaryText}>Agora não</Text>
        </Pressable>
      </View>
    </View>
  );
};

const Step: React.FC<{ n: number; icon: keyof typeof Ionicons.glyphMap; text: string }> = ({
  n,
  icon,
  text,
}) => (
  <View style={styles.step}>
    <View style={styles.stepNum}>
      <Text style={styles.stepNumText}>{n}</Text>
    </View>
    <Ionicons name={icon} size={20} color={colors.gold} style={{ marginRight: spacing.sm }} />
    <Text style={styles.stepText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99998,
    backgroundColor: 'rgba(15, 14, 14, 0.72)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  close: { position: 'absolute', top: spacing.md, right: spacing.md, zIndex: 2 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  icon: {
    width: 60,
    height: 60,
    borderRadius: 14,
    marginRight: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { fontFamily: fonts.serifBold, fontSize: 20, color: colors.text },
  subtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
    marginTop: 2,
    paddingRight: spacing.lg,
  },
  steps: { marginBottom: spacing.md },
  step: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  stepNumText: { fontFamily: fonts.sansBold, fontSize: 12, color: '#0F0E0E' },
  stepText: { flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.text },
  hint: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textMuted,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.gold,
    borderRadius: radius.pill,
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  primaryText: { fontFamily: fonts.sansBold, fontSize: 16, color: '#0F0E0E' },
  secondaryBtn: { alignItems: 'center', paddingVertical: spacing.md },
  secondaryText: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.textSecondary },
});

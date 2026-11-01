/**
 * Tela de verificação de idade (18+) e Termos de Uso (Legal Compliance).
 * Exibida como modal bloqueante antes do primeiro acesso ao catálogo.
 */
import React from 'react';
import {
  Dimensions,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Button, GoldDivider } from './ui';
import { useUserStore } from '../store/useUserStore';
import { colors, fonts, radius, spacing, type } from '../theme';

const { width } = Dimensions.get('window');

export const AgeGateModal: React.FC = () => {
  const { ageVerified, verifyAge, hydrated } = useUserStore();

  if (!hydrated || ageVerified) {
    return null;
  }

  return (
    <View style={styles.overlay}>
      <ImageBackground
        source={require('../../assets/images/lounge.jpg')}
        style={styles.bgImage}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(15, 14, 14, 0.85)', 'rgba(15, 14, 14, 0.98)', '#0F0E0E']}
          style={styles.gradient}
        >
          <View style={styles.container}>
            {/* Brasão / Ícone */}
            <View style={styles.badgeWrapper}>
              <View style={styles.badgeInner}>
                <Ionicons name="shield-checkmark" size={36} color={colors.gold} />
              </View>
            </View>

            <Text style={type.overline}>CONFRARIA EXCLUSIVA</Text>
            <Text style={styles.title}>PUFF & LOUNGE</Text>
            <Text style={styles.subtitle}>Onde a Tradição Encontra o Requinte</Text>

            <GoldDivider style={{ marginVertical: spacing.lg, width: '60%' }} />

            <View style={styles.disclaimerBox}>
              <View style={styles.tag18}>
                <Text style={styles.tag18Text}>18+</Text>
              </View>
              <Text style={styles.disclaimerText}>
                Este aplicativo é um guia cultural e diretório informativo restrito a maiores de 18
                anos. Não comercializamos tabaco nem incentivamos o consumo por menores de idade.
              </Text>
            </View>

            <Text style={styles.questionText}>
              Você confirma ter 18 anos ou mais e concorda com os termos da confraria?
            </Text>

            <View style={styles.actions}>
              <Button
                label="Sim, sou maior de 18 anos"
                variant="gold"
                size="lg"
                onPress={verifyAge}
                style={{ width: '100%', marginBottom: spacing.md }}
              />
              <Text style={styles.legalNotice}>
                Acesso estritamente educacional e informativo em conformidade com as diretrizes
                vigentes.
              </Text>
            </View>
          </View>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 99999,
    backgroundColor: '#0F0E0E',
  },
  bgImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  container: {
    width: '100%',
    maxWidth: 480,
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  badgeWrapper: {
    width: 80,
    height: 80,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    backgroundColor: 'rgba(212, 175, 55, 0.05)',
  },
  badgeInner: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 32,
    color: colors.text,
    letterSpacing: 3,
    textAlign: 'center',
    marginTop: 6,
  },
  subtitle: {
    fontFamily: fonts.serifItalic,
    fontSize: 16,
    color: colors.goldSoft,
    textAlign: 'center',
    marginTop: 4,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 24, 23, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  tag18: {
    backgroundColor: colors.gold,
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  tag18Text: {
    fontFamily: fonts.sansBold,
    fontSize: 18,
    color: '#0F0E0E',
  },
  disclaimerText: {
    flex: 1,
    fontFamily: fonts.sans,
    fontSize: 13,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  questionText: {
    fontFamily: fonts.serif,
    fontSize: 16,
    lineHeight: 22,
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  actions: {
    width: '100%',
    alignItems: 'center',
  },
  legalNotice: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 15,
  },
});

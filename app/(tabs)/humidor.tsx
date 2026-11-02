/**
 * Aba 4: MEU UMIDOR VIRTUAL (Perfil & Coleção Pessoal)
 * Locais favoritos salvos, charutos provados/desejados e notas de degustação.
 */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Badge, Button, Card } from '../../src/components/ui';
import { VenueCard } from '../../src/components/VenueCard';
import { BRANDS } from '../../src/data/brands';
import { getAllKnownVenues, hydrateDiscoveredCache } from '../../src/services/nearbyVenues';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, fonts, radius, spacing, type } from '../../src/theme';

export default function HumidorScreen() {
  const router = useRouter();
  const {
    favoriteVenueIds,
    humidor,
    addHumidorEntry,
    removeHumidorEntry,
    resetAge,
  } = useUserStore();

  const [activeTab, setActiveTab] = useState<'charutos' | 'locais'>('charutos');
  const [modalOpen, setModalOpen] = useState(false);

  // Form states para novo charuto
  const [cigarName, setCigarName] = useState('');
  const [brandId, setBrandId] = useState('cohiba');
  const [vitola, setVitola] = useState('Robusto');
  const [status, setStatus] = useState<'provado' | 'desejo'>('provado');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);

  const [, setHydratedExtra] = useState(false);
  useEffect(() => {
    hydrateDiscoveredCache().then(() => setHydratedExtra(true));
  }, []);

  const favoriteVenues = getAllKnownVenues().filter((v) =>
    favoriteVenueIds.includes(v.id),
  );

  const handleSaveCigar = () => {
    if (!cigarName.trim()) return;
    addHumidorEntry({
      cigarName: cigarName.trim(),
      brandId,
      vitola,
      status,
      notes: notes.trim(),
      rating,
    });
    setCigarName('');
    setNotes('');
    setModalOpen(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View>
          <Text style={type.overline}>COLEÇÃO PESSOAL</Text>
          <Text style={styles.title}>Meu Umidor</Text>
        </View>

        {activeTab === 'charutos' && (
          <Button
            label="Adicionar"
            icon="add"
            variant="gold"
            size="sm"
            onPress={() => setModalOpen(true)}
          />
        )}
      </View>

      {/* Seletor entre Charutos e Locais Salvos */}
      <View style={styles.tabToggleRow}>
        <Pressable
          onPress={() => setActiveTab('charutos')}
          style={[styles.tabToggleBtn, activeTab === 'charutos' && styles.tabToggleBtnActive]}
        >
          <Ionicons
            name="cube-outline"
            size={16}
            color={activeTab === 'charutos' ? '#0F0E0E' : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.tabToggleText, activeTab === 'charutos' && styles.tabToggleTextActive]}
          >
            Charutos ({humidor.length})
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setActiveTab('locais')}
          style={[styles.tabToggleBtn, activeTab === 'locais' && styles.tabToggleBtnActive]}
        >
          <Ionicons
            name="bookmark-outline"
            size={16}
            color={activeTab === 'locais' ? '#0F0E0E' : colors.textSecondary}
            style={{ marginRight: 6 }}
          />
          <Text
            style={[styles.tabToggleText, activeTab === 'locais' && styles.tabToggleTextActive]}
          >
            Locais Salvos ({favoriteVenues.length})
          </Text>
        </Pressable>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* ========================================================================= */}
        {/* ABA: CHARUTOS DO UMIDOR */}
        {/* ========================================================================= */}
        {activeTab === 'charutos' && (
          <View style={styles.content}>
            {humidor.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>Seu umidor está vazio</Text>
                <Text style={styles.emptySubtitle}>
                  Registre os charutos que você degustou ou que estão na sua lista de desejos.
                </Text>
                <Button
                  label="Adicionar Primeiro Charuto"
                  variant="gold"
                  onPress={() => setModalOpen(true)}
                  style={{ marginTop: spacing.lg }}
                />
              </View>
            ) : (
              humidor.map((item) => (
                <Card key={item.id} style={styles.cigarCard}>
                  <View style={styles.cigarCardHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cigarName}>{item.cigarName}</Text>
                      <Text style={styles.cigarMeta}>
                        {item.brandId ? item.brandId.toUpperCase() : ''} · {item.vitola || 'Vitola livre'}
                      </Text>
                    </View>
                    <Badge
                      label={item.status === 'provado' ? 'DEGUSTADO' : 'DESEJO'}
                      variant={item.status === 'provado' ? 'gold' : 'tobacco'}
                    />
                  </View>

                  {item.status === 'provado' && item.rating && (
                    <View style={styles.cigarRatingRow}>
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Ionicons
                          key={s}
                          name={s <= item.rating! ? 'star' : 'star-outline'}
                          size={14}
                          color={colors.gold}
                          style={{ marginRight: 2 }}
                        />
                      ))}
                    </View>
                  )}

                  {item.notes ? <Text style={styles.cigarNotes}>{item.notes}</Text> : null}

                  <View style={styles.cigarFooter}>
                    <Text style={styles.cigarDate}>
                      {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                    </Text>
                    <Pressable
                      onPress={() => removeHumidorEntry(item.id)}
                      hitSlop={8}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.danger} />
                    </Pressable>
                  </View>
                </Card>
              ))
            )}
          </View>
        )}

        {/* ========================================================================= */}
        {/* ABA: LOCAIS FAVORITOS */}
        {/* ========================================================================= */}
        {activeTab === 'locais' && (
          <View style={styles.content}>
            {favoriteVenues.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="bookmark-outline" size={48} color={colors.border} />
                <Text style={styles.emptyTitle}>Nenhum local salvo</Text>
                <Text style={styles.emptySubtitle}>
                  Toque no ícone de marcador nos cards de lounges para salvar seus refúgios favoritos.
                </Text>
              </View>
            ) : (
              favoriteVenues.map((v) => <VenueCard key={v.id} venue={v} />)
            )}
          </View>
        )}

        {/* Opção de reinicialização da verificação de idade */}
        <View style={styles.settingsSection}>
          <Text style={styles.settingsLabel}>CONFORMIDADE & PREFERÊNCIAS</Text>
          <Pressable onPress={resetAge} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Refazer Verificação de Idade (18+)</Text>
          </Pressable>
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>

      {/* Modal para Adicionar Charuto */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Charuto no Umidor</Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={{ padding: spacing.xl }}>
              <Text style={styles.inputLabel}>NOME DO CHARUTO / LINHA</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Behike 52, Serie D No. 4, OpusX..."
                placeholderTextColor={colors.textMuted}
                value={cigarName}
                onChangeText={setCigarName}
              />

              <Text style={styles.inputLabel}>FORMATO / VITOLA</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Robusto, Churchill, Torpedo..."
                placeholderTextColor={colors.textMuted}
                value={vitola}
                onChangeText={setVitola}
              />

              <Text style={styles.inputLabel}>ESTADO</Text>
              <View style={styles.statusToggleRow}>
                <Pressable
                  onPress={() => setStatus('provado')}
                  style={[styles.statusBtn, status === 'provado' && styles.statusBtnActive]}
                >
                  <Text style={[styles.statusBtnText, status === 'provado' && styles.statusBtnTextActive]}>
                    Já Degustei
                  </Text>
                </Pressable>
                <Pressable
                  onPress={() => setStatus('desejo')}
                  style={[styles.statusBtn, status === 'desejo' && styles.statusBtnActive]}
                >
                  <Text style={[styles.statusBtnText, status === 'desejo' && styles.statusBtnTextActive]}>
                    Lista de Desejos
                  </Text>
                </Pressable>
              </View>

              {status === 'provado' && (
                <>
                  <Text style={styles.inputLabel}>SUA AVALIAÇÃO (1 A 5)</Text>
                  <View style={styles.ratingPickerRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable key={star} onPress={() => setRating(star)} style={{ padding: 6 }}>
                        <Ionicons
                          name={star <= rating ? 'star' : 'star-outline'}
                          size={28}
                          color={colors.gold}
                        />
                      </Pressable>
                    ))}
                  </View>
                </>
              )}

              <Text style={styles.inputLabel}>NOTAS DE DEGUSTAÇÃO</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Notas de cedro, café, harmonizou com single malt..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <Button
                label="Salvar no Umidor"
                variant="gold"
                onPress={handleSaveCigar}
                style={{ marginTop: spacing.xl, marginBottom: spacing.xxl }}
              />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 24 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontFamily: fonts.serifBold,
    fontSize: 26,
    color: colors.text,
    marginTop: 2,
  },
  tabToggleRow: {
    flexDirection: 'row',
    marginHorizontal: spacing.xl,
    marginVertical: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  tabToggleBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: radius.sm,
  },
  tabToggleBtnActive: {
    backgroundColor: colors.gold,
  },
  tabToggleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  tabToggleTextActive: {
    color: '#0F0E0E',
    fontFamily: fonts.sansBold,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.xl,
  },
  content: {
    paddingTop: spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  emptyTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.text,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.xs,
    textAlign: 'center',
    maxWidth: 280,
  },
  cigarCard: {
    marginBottom: spacing.md,
  },
  cigarCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cigarName: {
    fontFamily: fonts.serifBold,
    fontSize: 17,
    color: colors.text,
  },
  cigarMeta: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.goldSoft,
    marginTop: 2,
  },
  cigarRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  cigarNotes: {
    fontFamily: fonts.sans,
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 18,
  },
  cigarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  cigarDate: {
    fontFamily: fonts.sans,
    fontSize: 11,
    color: colors.textMuted,
  },
  settingsSection: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.borderSubtle,
  },
  settingsLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.5,
    marginBottom: spacing.sm,
  },
  resetBtn: {
    paddingVertical: 10,
  },
  resetBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSubtle,
  },
  modalTitle: {
    fontFamily: fonts.serifBold,
    fontSize: 20,
    color: colors.text,
  },
  inputLabel: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
    letterSpacing: 1.5,
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  textInput: {
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    color: colors.text,
    fontFamily: fonts.sans,
    fontSize: 14,
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  statusBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    alignItems: 'center',
  },
  statusBtnActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  statusBtnText: {
    fontFamily: fonts.sansMedium,
    fontSize: 13,
    color: colors.textSecondary,
  },
  statusBtnTextActive: {
    color: '#0F0E0E',
    fontFamily: fonts.sansBold,
  },
  ratingPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});

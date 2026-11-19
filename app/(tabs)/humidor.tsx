/**
 * Aba 4: MEU UMIDOR VIRTUAL (Perfil & Coleção Pessoal)
 * Dashboard da coleção (total, unidades, degustados, nota média, monitor 70/70),
 * charutos provados/desejados com controle de unidades e edição, locais salvos e marcas favoritas.
 */
import React, { useEffect, useMemo, useState } from 'react';
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
import { BRANDS, ORIGIN_MAP } from '../../src/data/brands';
import { VITOLAS } from '../../src/data/culture';
import { getAllKnownVenues, hydrateDiscoveredCache } from '../../src/services/nearbyVenues';
import { useUserStore } from '../../src/store/useUserStore';
import { colors, fonts, radius, spacing, type } from '../../src/theme';
import { HumidorEntry } from '../../src/types';

export default function HumidorScreen() {
  const router = useRouter();
  const {
    favoriteVenueIds,
    favoriteBrandIds,
    toggleFavoriteBrand,
    humidor,
    addHumidorEntry,
    updateHumidorEntry,
    removeHumidorEntry,
    resetAge,
  } = useUserStore();

  const [activeTab, setActiveTab] = useState<'charutos' | 'locais' | 'marcas'>('charutos');
  const [cigarFilter, setCigarFilter] = useState<'all' | 'provado' | 'desejo'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states para novo / editar charuto
  const [cigarName, setCigarName] = useState('');
  const [brandId, setBrandId] = useState('cohiba');
  const [vitola, setVitola] = useState('Robusto');
  const [status, setStatus] = useState<'provado' | 'desejo'>('provado');
  const [quantity, setQuantity] = useState(1);
  const [pairedWith, setPairedWith] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);

  const [, setHydratedExtra] = useState(false);
  useEffect(() => {
    hydrateDiscoveredCache().then(() => setHydratedExtra(true));
  }, []);

  const favoriteVenues = getAllKnownVenues().filter((v) =>
    favoriteVenueIds.includes(v.id),
  );
  const favoriteBrands = BRANDS.filter((b) => favoriteBrandIds.includes(b.id));

  // Estatísticas do Umidor
  const stats = useMemo(() => {
    const tasted = humidor.filter((h) => h.status === 'provado');
    const wishlist = humidor.filter((h) => h.status === 'desejo');
    const totalUnits = humidor.reduce((acc, h) => acc + (h.quantity ?? 1), 0);
    const rated = tasted.filter((h) => typeof h.rating === 'number');
    const avgRating =
      rated.length > 0
        ? (rated.reduce((acc, h) => acc + (h.rating || 0), 0) / rated.length).toFixed(1)
        : '—';
    return {
      totalEntries: humidor.length,
      totalUnits,
      tastedCount: tasted.length,
      wishlistCount: wishlist.length,
      avgRating,
    };
  }, [humidor]);

  const filteredHumidor = useMemo(() => {
    if (cigarFilter === 'all') return humidor;
    return humidor.filter((h) => h.status === cigarFilter);
  }, [humidor, cigarFilter]);

  const openNewModal = () => {
    setEditingId(null);
    setCigarName('');
    setBrandId('cohiba');
    setVitola('Robusto');
    setStatus('provado');
    setQuantity(1);
    setPairedWith('');
    setNotes('');
    setRating(5);
    setModalOpen(true);
  };

  const openEditModal = (entry: HumidorEntry) => {
    setEditingId(entry.id);
    setCigarName(entry.cigarName);
    setBrandId(entry.brandId || 'cohiba');
    setVitola(entry.vitola || 'Robusto');
    setStatus(entry.status);
    setQuantity(entry.quantity ?? 1);
    setPairedWith(entry.pairedWith || '');
    setNotes(entry.notes || '');
    setRating(entry.rating ?? 5);
    setModalOpen(true);
  };

  const handleSaveCigar = () => {
    if (!cigarName.trim()) return;
    const payload = {
      cigarName: cigarName.trim(),
      brandId,
      vitola: vitola.trim() || 'Robusto',
      status,
      quantity: Math.max(1, quantity),
      pairedWith: pairedWith.trim() || undefined,
      notes: notes.trim(),
      rating: status === 'provado' ? rating : undefined,
    };

    if (editingId) {
      updateHumidorEntry(editingId, payload);
    } else {
      addHumidorEntry(payload);
    }

    setModalOpen(false);
  };

  const handleConvertWishToTasted = (entry: HumidorEntry) => {
    updateHumidorEntry(entry.id, {
      status: 'provado',
      rating: entry.rating || 5,
    });
  };

  const handleStepQuantity = (entry: HumidorEntry, delta: number) => {
    const next = Math.max(0, (entry.quantity ?? 1) + delta);
    if (next === 0) {
      removeHumidorEntry(entry.id);
    } else {
      updateHumidorEntry(entry.id, { quantity: next });
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.topShell}>
        <View style={styles.header}>
          <View>
            <Text style={type.overline}>COLEÇÃO PESSOAL</Text>
            <Text style={styles.title}>Meu Umidor</Text>
          </View>

          {activeTab === 'charutos' && (
            <Button
              label="Novo Charuto"
              icon="add"
              variant="gold"
              size="sm"
              onPress={openNewModal}
            />
          )}
        </View>

        {/* Seletor entre Charutos, Locais Salvos e Marcas Favoritas */}
        <View style={styles.tabToggleRow}>
          <Pressable
            onPress={() => setActiveTab('charutos')}
            style={[
              styles.tabToggleBtn,
              activeTab === 'charutos' && styles.tabToggleBtnActive,
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={15}
              color={activeTab === 'charutos' ? '#0F0E0E' : colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.tabToggleText,
                activeTab === 'charutos' && styles.tabToggleTextActive,
              ]}
            >
              Charutos ({humidor.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('locais')}
            style={[
              styles.tabToggleBtn,
              activeTab === 'locais' && styles.tabToggleBtnActive,
            ]}
          >
            <Ionicons
              name="bookmark-outline"
              size={15}
              color={activeTab === 'locais' ? '#0F0E0E' : colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.tabToggleText,
                activeTab === 'locais' && styles.tabToggleTextActive,
              ]}
            >
              Locais ({favoriteVenues.length})
            </Text>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('marcas')}
            style={[
              styles.tabToggleBtn,
              activeTab === 'marcas' && styles.tabToggleBtnActive,
            ]}
          >
            <Ionicons
              name="heart-outline"
              size={15}
              color={activeTab === 'marcas' ? '#0F0E0E' : colors.textSecondary}
              style={{ marginRight: 5 }}
            />
            <Text
              style={[
                styles.tabToggleText,
                activeTab === 'marcas' && styles.tabToggleTextActive,
              ]}
            >
              Marcas ({favoriteBrands.length})
            </Text>
          </Pressable>
        </View>
      </View>

      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.centeredContent}>
          {/* ========================================================================= */}
          {/* ABA 1: CHARUTOS DO UMIDOR */}
          {/* ========================================================================= */}
          {activeTab === 'charutos' && (
            <View style={styles.content}>
              {/* Painel Resumo do Umidor + Monitor de Referência 70/70 */}
              <View style={styles.dashboardGrid}>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.totalUnits}</Text>
                  <Text style={styles.statLabel}>Unidades</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.tastedCount}</Text>
                  <Text style={styles.statLabel}>Degustados</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>{stats.wishlistCount}</Text>
                  <Text style={styles.statLabel}>Desejos</Text>
                </View>
                <View style={styles.statBox}>
                  <Text style={styles.statValue}>★ {stats.avgRating}</Text>
                  <Text style={styles.statLabel}>Nota Média</Text>
                </View>
              </View>

              <View style={styles.climateBanner}>
                <Ionicons name="thermometer-outline" size={16} color={colors.gold} />
                <Text style={styles.climateText}>
                  Padrão Ideal de Conservação: <Text style={styles.climateGold}>70% UR</Text> ·{' '}
                  <Text style={styles.climateGold}>21 °C (70 °F)</Text>
                </Text>
              </View>

              {/* Sub-filtro: Todos / Degustados / Lista de Desejos */}
              <View style={styles.subFilterRow}>
                {[
                  { id: 'all', label: `Todos (${humidor.length})` },
                  { id: 'provado', label: `Degustados (${stats.tastedCount})` },
                  { id: 'desejo', label: `Lista de Desejos (${stats.wishlistCount})` },
                ].map((f) => {
                  const active = cigarFilter === f.id;
                  return (
                    <Pressable
                      key={f.id}
                      onPress={() => setCigarFilter(f.id as any)}
                      style={[styles.subFilterChip, active && styles.subFilterChipActive]}
                    >
                      <Text
                        style={[
                          styles.subFilterText,
                          active && styles.subFilterTextActive,
                        ]}
                      >
                        {f.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {filteredHumidor.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="cube-outline" size={48} color={colors.border} />
                  <Text style={styles.emptyTitle}>Nenhum charuto nesta lista</Text>
                  <Text style={styles.emptySubtitle}>
                    Registre os charutos que você degustou, sua quantidade em estoque ou sua
                    lista de desejos.
                  </Text>
                  <Button
                    label="Adicionar Charuto"
                    variant="gold"
                    onPress={openNewModal}
                    style={{ marginTop: spacing.lg }}
                  />
                </View>
              ) : (
                filteredHumidor.map((item) => {
                  const brandObj = BRANDS.find((b) => b.id === item.brandId);
                  const brandDisplay = brandObj
                    ? `${ORIGIN_MAP[brandObj.origin].flag} ${brandObj.name}`
                    : item.brandId
                      ? item.brandId.toUpperCase()
                      : 'Marca Livre';

                  return (
                    <Card key={item.id} style={styles.cigarCard}>
                      <View style={styles.cigarCardHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cigarName}>{item.cigarName}</Text>
                          <Text style={styles.cigarMeta}>
                            {brandDisplay} · {item.vitola || 'Vitola livre'}
                          </Text>
                        </View>
                        <Badge
                          label={item.status === 'provado' ? 'DEGUSTADO' : 'DESEJO'}
                          variant={item.status === 'provado' ? 'gold' : 'tobacco'}
                        />
                      </View>

                      <View style={styles.cigarBadgesRow}>
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

                        {item.pairedWith ? (
                          <View style={styles.pairedPill}>
                            <Ionicons name="wine-outline" size={12} color={colors.gold} />
                            <Text style={styles.pairedPillText}>{item.pairedWith}</Text>
                          </View>
                        ) : null}
                      </View>

                      {item.notes ? (
                        <Text style={styles.cigarNotes}>{item.notes}</Text>
                      ) : null}

                      <View style={styles.cigarFooter}>
                        {/* Controle de Estoque / Unidades */}
                        <View style={styles.qtyControl}>
                          <Pressable
                            onPress={() => handleStepQuantity(item, -1)}
                            style={styles.qtyBtn}
                            hitSlop={6}
                          >
                            <Ionicons name="remove" size={13} color={colors.gold} />
                          </Pressable>
                          <Text style={styles.qtyText}>{item.quantity ?? 1} un.</Text>
                          <Pressable
                            onPress={() => handleStepQuantity(item, 1)}
                            style={styles.qtyBtn}
                            hitSlop={6}
                          >
                            <Ionicons name="add" size={13} color={colors.gold} />
                          </Pressable>
                        </View>

                        <View style={styles.cigarActionsRight}>
                          {item.status === 'desejo' && (
                            <Pressable
                              onPress={() => handleConvertWishToTasted(item)}
                              style={styles.convertBtn}
                            >
                              <Ionicons
                                name="checkmark-circle-outline"
                                size={14}
                                color={colors.gold}
                              />
                              <Text style={styles.convertBtnText}>Marcar Degustado</Text>
                            </Pressable>
                          )}

                          <Pressable
                            onPress={() => openEditModal(item)}
                            hitSlop={8}
                            style={styles.iconActionBtn}
                          >
                            <Ionicons
                              name="create-outline"
                              size={17}
                              color={colors.textSecondary}
                            />
                          </Pressable>

                          <Pressable
                            onPress={() => removeHumidorEntry(item.id)}
                            hitSlop={8}
                            style={styles.iconActionBtn}
                          >
                            <Ionicons name="trash-outline" size={16} color={colors.danger} />
                          </Pressable>
                        </View>
                      </View>
                    </Card>
                  );
                })
              )}
            </View>
          )}

          {/* ========================================================================= */}
          {/* ABA 2: LOCAIS FAVORITOS */}
          {/* ========================================================================= */}
          {activeTab === 'locais' && (
            <View style={styles.content}>
              {favoriteVenues.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="bookmark-outline" size={48} color={colors.border} />
                  <Text style={styles.emptyTitle}>Nenhum local salvo</Text>
                  <Text style={styles.emptySubtitle}>
                    Toque no ícone de marcador nos cards de lounges e tabacarias para salvar
                    seus refúgios favoritos.
                  </Text>
                </View>
              ) : (
                favoriteVenues.map((v) => <VenueCard key={v.id} venue={v} />)
              )}
            </View>
          )}

          {/* ========================================================================= */}
          {/* ABA 3: MARCAS FAVORITAS */}
          {/* ========================================================================= */}
          {activeTab === 'marcas' && (
            <View style={styles.content}>
              {favoriteBrands.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Ionicons name="heart-outline" size={48} color={colors.border} />
                  <Text style={styles.emptyTitle}>Nenhuma marca favorita</Text>
                  <Text style={styles.emptySubtitle}>
                    Toque no coração nas marcas da Enciclopédia para guardar suas casas
                    tabaqueiras preferidas.
                  </Text>
                  <Button
                    label="Explorar Enciclopédia"
                    variant="outline"
                    onPress={() => router.push('/(tabs)/encyclopedia')}
                    style={{ marginTop: spacing.lg }}
                  />
                </View>
              ) : (
                favoriteBrands.map((b) => (
                  <Card
                    key={b.id}
                    onPress={() =>
                      router.push({
                        pathname: '/brand/[id]',
                        params: { id: b.id },
                      })
                    }
                    style={styles.favBrandCard}
                  >
                    <View style={styles.favBrandRow}>
                      <View style={[styles.brandMonogram, { borderColor: b.accent }]}>
                        <Text style={[styles.brandMonogramText, { color: b.accent }]}>
                          {b.monogram}
                        </Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.cigarName}>{b.name}</Text>
                        <Text style={styles.cigarMeta}>
                          {ORIGIN_MAP[b.origin].flag} {b.region} · Desde {b.founded}
                        </Text>
                      </View>
                      <Pressable
                        onPress={(e) => {
                          e.stopPropagation();
                          toggleFavoriteBrand(b.id);
                        }}
                        hitSlop={8}
                      >
                        <Ionicons name="heart" size={20} color={colors.gold} />
                      </Pressable>
                    </View>
                  </Card>
                ))
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
        </View>
      </ScrollView>

      {/* Modal para Adicionar / Editar Charuto */}
      <Modal visible={modalOpen} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setModalOpen(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingId ? 'Editar Registro do Umidor' : 'Novo Charuto no Umidor'}
              </Text>
              <Pressable onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView style={{ padding: spacing.xl }} showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>MARCA DO CHARUTO</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: spacing.xs }}
              >
                {BRANDS.map((b) => {
                  const active = brandId === b.id;
                  return (
                    <Pressable
                      key={b.id}
                      onPress={() => setBrandId(b.id)}
                      style={[styles.pickerChip, active && styles.pickerChipActive]}
                    >
                      <Text style={styles.pickerFlag}>{ORIGIN_MAP[b.origin].flag}</Text>
                      <Text
                        style={[
                          styles.pickerChipText,
                          active && styles.pickerChipTextActive,
                        ]}
                      >
                        {b.name}
                      </Text>
                    </Pressable>
                  );
                })}
                <Pressable
                  onPress={() => setBrandId('outra')}
                  style={[styles.pickerChip, brandId === 'outra' && styles.pickerChipActive]}
                >
                  <Text
                    style={[
                      styles.pickerChipText,
                      brandId === 'outra' && styles.pickerChipTextActive,
                    ]}
                  >
                    Outra Marca
                  </Text>
                </Pressable>
              </ScrollView>

              <Text style={styles.inputLabel}>NOME DO CHARUTO / LINHA</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Behike 52, Serie D No. 4, OpusX..."
                placeholderTextColor={colors.textMuted}
                value={cigarName}
                onChangeText={setCigarName}
              />

              <Text style={styles.inputLabel}>FORMATO / VITOLA</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: spacing.xs }}
              >
                {VITOLAS.map((v) => {
                  const active = vitola === v.name;
                  return (
                    <Pressable
                      key={v.id}
                      onPress={() => setVitola(v.name)}
                      style={[styles.pickerChip, active && styles.pickerChipActive]}
                    >
                      <Text
                        style={[
                          styles.pickerChipText,
                          active && styles.pickerChipTextActive,
                        ]}
                      >
                        {v.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <TextInput
                style={styles.textInput}
                placeholder="Ou digite a vitola personalizada..."
                placeholderTextColor={colors.textMuted}
                value={vitola}
                onChangeText={setVitola}
              />

              <View style={styles.twoColRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>ESTADO</Text>
                  <View style={styles.statusToggleRow}>
                    <Pressable
                      onPress={() => setStatus('provado')}
                      style={[styles.statusBtn, status === 'provado' && styles.statusBtnActive]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          status === 'provado' && styles.statusBtnTextActive,
                        ]}
                      >
                        Degustado
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setStatus('desejo')}
                      style={[styles.statusBtn, status === 'desejo' && styles.statusBtnActive]}
                    >
                      <Text
                        style={[
                          styles.statusBtnText,
                          status === 'desejo' && styles.statusBtnTextActive,
                        ]}
                      >
                        Desejo
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <View style={{ width: 120, marginLeft: spacing.md }}>
                  <Text style={styles.inputLabel}>UNIDADES</Text>
                  <View style={styles.modalQtyRow}>
                    <Pressable
                      onPress={() => setQuantity((q) => Math.max(1, q - 1))}
                      style={styles.modalQtyBtn}
                    >
                      <Ionicons name="remove" size={16} color={colors.gold} />
                    </Pressable>
                    <Text style={styles.modalQtyText}>{quantity}</Text>
                    <Pressable
                      onPress={() => setQuantity((q) => q + 1)}
                      style={styles.modalQtyBtn}
                    >
                      <Ionicons name="add" size={16} color={colors.gold} />
                    </Pressable>
                  </View>
                </View>
              </View>

              {status === 'provado' && (
                <>
                  <Text style={styles.inputLabel}>SUA AVALIAÇÃO (1 A 5)</Text>
                  <View style={styles.ratingPickerRow}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Pressable
                        key={star}
                        onPress={() => setRating(star)}
                        style={{ padding: 6 }}
                      >
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

              <Text style={styles.inputLabel}>HARMONIZADO COM (OPCIONAL)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Ex: Macallan 12, Espresso Duplo, Zacapa 23..."
                placeholderTextColor={colors.textMuted}
                value={pairedWith}
                onChangeText={setPairedWith}
              />

              <Text style={styles.inputLabel}>NOTAS DE DEGUSTAÇÃO</Text>
              <TextInput
                style={[styles.textInput, { height: 80, textAlignVertical: 'top' }]}
                placeholder="Notas de cedro, cacau, excelente tiragem no segundo terço..."
                placeholderTextColor={colors.textMuted}
                multiline
                value={notes}
                onChangeText={setNotes}
              />

              <Button
                label={editingId ? 'Salvar Alterações' : 'Salvar no Umidor'}
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
  topShell: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
  },
  centeredContent: {
    width: '100%',
    maxWidth: 820,
    alignSelf: 'center',
    paddingHorizontal: spacing.xl,
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
    marginVertical: spacing.sm,
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
    paddingVertical: 9,
    borderRadius: radius.sm,
  },
  tabToggleBtnActive: {
    backgroundColor: colors.gold,
  },
  tabToggleText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  tabToggleTextActive: {
    color: '#0F0E0E',
    fontFamily: fonts.sansBold,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingTop: spacing.xs,
  },
  dashboardGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fonts.serifBold,
    fontSize: 18,
    color: colors.gold,
  },
  statLabel: {
    fontFamily: fonts.sansMedium,
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  climateBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(212, 175, 55, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.25)',
    borderRadius: radius.md,
    paddingVertical: 7,
    paddingHorizontal: 12,
    marginBottom: spacing.md,
  },
  climateText: {
    fontFamily: fonts.sans,
    fontSize: 12,
    color: colors.textSecondary,
  },
  climateGold: {
    fontFamily: fonts.sansBold,
    color: colors.goldSoft,
  },
  subFilterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  subFilterChip: {
    paddingVertical: 5,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  subFilterChipActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(212, 175, 55, 0.15)',
  },
  subFilterText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  subFilterTextActive: {
    fontFamily: fonts.sansBold,
    color: colors.gold,
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
    maxWidth: 300,
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
  cigarBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  cigarRatingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pairedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  pairedPillText: {
    fontFamily: fonts.sansMedium,
    fontSize: 11,
    color: colors.goldSoft,
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
  qtyControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  qtyBtn: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    fontFamily: fonts.sansBold,
    fontSize: 12,
    color: colors.text,
    minWidth: 34,
    textAlign: 'center',
  },
  cigarActionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  convertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(212, 175, 55, 0.14)',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 9,
  },
  convertBtnText: {
    fontFamily: fonts.sansSemiBold,
    fontSize: 11,
    color: colors.gold,
  },
  iconActionBtn: {
    padding: 4,
  },
  favBrandCard: {
    marginBottom: spacing.sm,
  },
  favBrandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandMonogram: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  brandMonogramText: {
    fontFamily: fonts.serifBold,
    fontSize: 16,
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
    alignItems: 'center',
  },
  modalContent: {
    width: '100%',
    maxWidth: 600,
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
    borderColor: colors.border,
    maxHeight: '92%',
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
  pickerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginRight: 6,
  },
  pickerChipActive: {
    backgroundColor: colors.gold,
    borderColor: colors.gold,
  },
  pickerFlag: {
    fontSize: 13,
    marginRight: 5,
  },
  pickerChipText: {
    fontFamily: fonts.sansMedium,
    fontSize: 12,
    color: colors.textSecondary,
  },
  pickerChipTextActive: {
    fontFamily: fonts.sansBold,
    color: '#0F0E0E',
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
  twoColRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  statusToggleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
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
    fontSize: 12,
    color: colors.textSecondary,
  },
  statusBtnTextActive: {
    color: '#0F0E0E',
    fontFamily: fonts.sansBold,
  },
  modalQtyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    height: 40,
    paddingHorizontal: 8,
  },
  modalQtyBtn: {
    padding: 4,
  },
  modalQtyText: {
    fontFamily: fonts.sansBold,
    fontSize: 14,
    color: colors.text,
  },
  ratingPickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
});

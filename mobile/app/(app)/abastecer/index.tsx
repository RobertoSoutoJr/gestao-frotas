import { useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { useAuth } from '../../../src/contexts/AuthContext';
import { abastecimentosApi } from '../../../src/api/abastecimentos';
import { caminhoesApi } from '../../../src/api/caminhoes';
import { useToast } from '../../../src/contexts/ToastContext';
import { type Colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { formatCurrency, formatDate, formatNumber } from '../../../src/lib/format';
import { SkeletonList } from '../../../src/components/Skeleton';
import { SearchBar } from '../../../src/components/SearchBar';
import { useHaptics } from '../../../src/hooks/useHaptics';
import { useOfflineSync } from '../../../src/hooks/useOfflineSync';
import { PeriodFilter, getDateFrom, type Periodo } from '../../../src/components/PeriodFilter';
import { SwipeableRow } from '../../../src/components/SwipeableRow';
import { ListSummary } from '../../../src/components/ListSummary';
import type { Abastecimento, Caminhao } from '../../../src/api/types';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';

export default function AbastecerListScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['abastecimentos'],
    queryFn: () => abastecimentosApi.list(),
  });

  const caminhoesQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });

  const isAdmin = user?.role !== 'motorista';
  const haptics = useHaptics();
  const [search, setSearch] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>('tudo');
  const { pendingCount, syncing, sync } = useOfflineSync();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => abastecimentosApi.delete(id),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      showToast('Abastecimento excluído', 'success');
    },
    onError: (err: any) => {
      haptics.error();
      showToast(err?.message || 'Erro ao excluir', 'error');
    },
  });

  const truckMap = useMemo(() => {
    const map: Record<number, Caminhao> = {};
    for (const c of caminhoesQuery.data ?? []) {
      map[c.id] = c;
    }
    return map;
  }, [caminhoesQuery.data]);

  const records = useMemo(() => {
    if (!data) return [];
    let list = [...data];
    if (user?.role === 'motorista' && user.motorista_id) {
      list = list.filter((r) => r.motorista_id === user.motorista_id);
    }
    const dateFrom = getDateFrom(periodo);
    if (dateFrom) {
      list = list.filter((r) => new Date(r.created_at) >= dateFrom);
    }
    const sorted = list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (r) =>
        truckMap[r.caminhao_id]?.placa?.toLowerCase().includes(q) ||
        r.posto?.toLowerCase().includes(q),
    );
  }, [data, user, search, truckMap, periodo]);

  const handleDelete = (id: number) => {
    haptics.warning();
    Alert.alert(
      'Excluir abastecimento',
      'Tem certeza que deseja excluir este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: () => deleteMutation.mutate(id),
        },
      ],
    );
  };

  const renderItem = ({ item }: { item: Abastecimento }) => {
    const truck = truckMap[item.caminhao_id];
    const precoLitro =
      Number(item.litros) > 0
        ? Number(item.valor_total) / Number(item.litros)
        : 0;

    return (
      <SwipeableRow
        onDelete={isAdmin ? () => handleDelete(item.id) : undefined}
        onEdit={isAdmin ? () => router.push({ pathname: '/(app)/abastecer/edit', params: { id: item.id } }) : undefined}
      >
      <Card style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.cardInfo}>
            <Text style={styles.cardPlaca}>
              {truck?.placa || `#${item.caminhao_id}`}
            </Text>
            <Text style={styles.cardDate}>{formatDate(item.created_at)}</Text>
          </View>
          <Text style={styles.cardValor}>
            {formatCurrency(item.valor_total)}
          </Text>
        </View>

        <View style={styles.cardMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="water-outline" size={14} color={colors.textMuted} />
            <Text style={styles.metaText}>{formatNumber(item.litros, 1)}L</Text>
          </View>
          {precoLitro > 0 && (
            <View style={styles.metaItem}>
              <Ionicons name="pricetag-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>R$ {precoLitro.toFixed(3)}/L</Text>
            </View>
          )}
          {item.km_registro ? (
            <View style={styles.metaItem}>
              <Ionicons name="speedometer-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText}>{formatNumber(item.km_registro, 0)} km</Text>
            </View>
          ) : null}
          {(item.postos?.nome || item.posto) ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>
                {item.postos?.nome || item.posto}
              </Text>
            </View>
          ) : null}
        </View>

        {isAdmin && (
          <View style={styles.cardActions}>
            <Pressable
              style={styles.actionBtn}
              onPress={() =>
                router.push({
                  pathname: '/(app)/abastecer/edit',
                  params: { id: item.id },
                })
              }
            >
              <Ionicons name="create-outline" size={18} color={colors.accent} />
              <Text style={styles.actionText}>Editar</Text>
            </Pressable>
            <Pressable
              style={styles.actionBtn}
              onPress={() => handleDelete(item.id)}
            >
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>
                Excluir
              </Text>
            </Pressable>
          </View>
        )}
      </Card>
      </SwipeableRow>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Abastecimentos</Text>
          <Text style={styles.subtitle}>{records.length} registros</Text>
        </View>
        <Button
          title="+ Novo"
          onPress={() => router.push('/(app)/abastecer/new')}
          style={styles.newBtn}
        />
      </View>

      {pendingCount > 0 && (
        <Pressable style={styles.offlineBanner} onPress={sync}>
          <Ionicons name="cloud-upload-outline" size={16} color={colors.warning} />
          <Text style={styles.offlineBannerText}>
            {syncing
              ? 'Sincronizando...'
              : `${pendingCount} lançamento${pendingCount > 1 ? 's' : ''} offline — toque para sincronizar`}
          </Text>
        </Pressable>
      )}

      <PeriodFilter value={periodo} onChange={setPeriodo} />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por placa ou posto..." />

      {records.length > 0 && (
        <ListSummary
          count={records.length}
          items={[
            { label: 'Litros', value: `${formatNumber(records.reduce((s, r) => s + (Number(r.litros) || 0), 0), 0)}L` },
            { label: 'Total', value: formatCurrency(records.reduce((s, r) => s + (Number(r.valor_total) || 0), 0)), color: colors.success },
          ]}
        />
      )}

      {isLoading ? (
        <SkeletonList count={5} />
      ) : records.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="water-outline" size={48} color={colors.textDim} />
          <Text style={styles.emptyTitle}>Nenhum abastecimento</Text>
          <Text style={styles.emptyText}>
            Toque em "+ Novo" para registrar seu primeiro abastecimento.
          </Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching || syncing}
              onRefresh={async () => {
                await sync();
                refetch();
              }}
              tintColor={colors.accent}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (c: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: c.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    marginTop: spacing.xs,
  },
  newBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: c.warning + '20',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: c.warning + '40',
  },
  offlineBannerText: {
    fontSize: fontSize.xs,
    color: c.warning,
    fontWeight: '600',
    flex: 1,
  },
  empty: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    gap: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: c.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    textAlign: 'center',
  },
  list: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
  },
  card: {
    padding: spacing.md,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  cardInfo: {},
  cardPlaca: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: c.text,
    letterSpacing: 1,
  },
  cardDate: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    marginTop: 2,
  },
  cardValor: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: c.warning,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: c.textMuted,
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: c.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: c.accent,
    fontWeight: '500',
  },
});

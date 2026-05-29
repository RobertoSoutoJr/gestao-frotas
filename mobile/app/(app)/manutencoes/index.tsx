import { useEffect, useMemo, useState } from 'react';
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
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { useAuth } from '../../../src/contexts/AuthContext';
import { manutencoesApi } from '../../../src/api/manutencoes';
import { useToast } from '../../../src/contexts/ToastContext';
import { useHaptics } from '../../../src/hooks/useHaptics';
import { SearchBar } from '../../../src/components/SearchBar';
import { SkeletonList } from '../../../src/components/Skeleton';
import { PeriodFilter, getDateFrom, type Periodo } from '../../../src/components/PeriodFilter';
import { SwipeableRow } from '../../../src/components/SwipeableRow';
import { ListSummary } from '../../../src/components/ListSummary';
import type { Manutencao } from '../../../src/api/types';
import { type Colors, fontSize, spacing } from '../../../src/lib/theme';
import { formatCurrency, formatDate } from '../../../src/lib/format';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';
import { useOfflineSync } from '../../../src/hooks/useOfflineSync';
import { getQueueByType } from '../../../src/lib/offlineQueue';

const TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Preventiva: 'shield-checkmark-outline',
  Corretiva: 'hammer-outline',
  Pneus: 'ellipse-outline',
  Motor: 'cog-outline',
  Freios: 'hand-left-outline',
  Suspensão: 'git-branch-outline',
  Elétrica: 'flash-outline',
  Outros: 'build-outline',
};

export default function ManutencoesListScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role !== 'motorista';
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const haptics = useHaptics();
  const [search, setSearch] = useState('');
  const [periodo, setPeriodo] = useState<Periodo>('tudo');
  const { syncing, sync } = useOfflineSync();
  const [offlineCount, setOfflineCount] = useState(0);
  const colors = useColors();
  const styles = useStyles(createStyles);

  // Track offline manutencoes count
  const refreshOfflineCount = async () => {
    const items = await getQueueByType('manutencoes');
    setOfflineCount(items.length);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useMemo(() => { refreshOfflineCount(); }, []);

  const query = useQuery({
    queryKey: ['manutencoes'],
    queryFn: () => manutencoesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => manutencoesApi.delete(id),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      showToast('Manutenção excluída', 'success');
    },
    onError: (err: any) => {
      haptics.error();
      showToast(err?.message || 'Erro ao excluir', 'error');
    },
  });

  const handleDelete = (id: number) => {
    haptics.warning();
    Alert.alert(
      'Excluir manutenção',
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

  const records = useMemo(() => {
    const dateFrom = getDateFrom(periodo);
    let list = (query.data ?? []).filter((r) => {
      if (!dateFrom) return true;
      const d = r.data_manutencao || (r as any).created_at;
      return d && new Date(d) >= dateFrom;
    });
    const sorted = list.sort(
      (a, b) =>
        new Date(b.data_manutencao || (b as any).created_at || 0).getTime() -
        new Date(a.data_manutencao || (a as any).created_at || 0).getTime(),
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (r) =>
        r.tipo_manutencao?.toLowerCase().includes(q) ||
        r.descricao?.toLowerCase().includes(q) ||
        r.caminhoes?.placa?.toLowerCase().includes(q) ||
        (r.oficinas?.nome || r.oficina)?.toLowerCase().includes(q),
    );
  }, [query.data, search, periodo]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Manutenções</Text>
          <Text style={styles.subtitle}>{records.length} registros</Text>
        </View>
        <Button
          title="+ Nova"
          onPress={() => router.push('/(app)/manutencoes/new')}
          style={styles.newBtn}
        />
      </View>

      <PeriodFilter value={periodo} onChange={setPeriodo} />
      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por tipo, placa ou oficina..." />

      {records.length > 0 && (
        <ListSummary
          count={records.length}
          items={[
            { label: 'Total', value: formatCurrency(records.reduce((s: number, r: Manutencao) => s + (Number(r.valor_total) || 0), 0)), color: colors.danger },
            { label: 'Pendentes', value: String(records.filter((r: Manutencao) => r.status === 'pendente').length), color: colors.warning },
          ]}
        />
      )}

      {offlineCount > 0 && (
        <Pressable style={styles.offlineBanner} onPress={sync}>
          <Ionicons name="cloud-offline-outline" size={18} color="#fff" />
          <Text style={styles.offlineBannerText}>
            {syncing
              ? 'Sincronizando...'
              : `${offlineCount} manutenção${offlineCount > 1 ? 'ões' : ''} offline — toque para sincronizar`}
          </Text>
        </Pressable>
      )}

      {query.isLoading ? (
        <SkeletonList count={5} />
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => query.refetch()}
              tintColor={colors.accent}
            />
          }
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="construct-outline" size={48} color={colors.textDim} />
              <Text style={styles.emptyTitle}>Nenhuma manutenção</Text>
              <Text style={styles.emptyText}>
                Toque em "+ Nova" para registrar uma manutenção.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <SwipeableRow
              onDelete={isAdmin ? () => handleDelete(item.id) : undefined}
              onEdit={isAdmin ? () => router.push({ pathname: '/(app)/manutencoes/edit', params: { id: item.id } }) : undefined}
            >
              <MaintenanceCard
                record={item}
                onEdit={isAdmin ? () =>
                  router.push({
                    pathname: '/(app)/manutencoes/edit',
                    params: { id: item.id },
                  }) : undefined
                }
                onDelete={isAdmin ? () => handleDelete(item.id) : undefined}
              />
            </SwipeableRow>
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function MaintenanceCard({
  record,
  onEdit,
  onDelete,
}: {
  record: Manutencao;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const icon = TYPE_ICONS[record.tipo_manutencao] || 'build-outline';

  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.typeRow}>
          <Ionicons name={icon} size={18} color={colors.accent} />
          <Text style={styles.type}>{record.tipo_manutencao}</Text>
        </View>
        <Text style={styles.date}>
          {formatDate(record.data_manutencao || record.created_at)}
        </Text>
      </View>

      {record.descricao ? (
        <Text style={styles.descricao} numberOfLines={2}>
          {record.descricao}
        </Text>
      ) : null}

      <View style={styles.cardFooter}>
        {record.caminhoes ? (
          <Text style={styles.placa}>{record.caminhoes.placa}</Text>
        ) : null}
        {(record.oficinas?.nome || record.oficina) ? (
          <Text style={styles.oficina} numberOfLines={1}>
            {record.oficinas?.nome || record.oficina}
          </Text>
        ) : null}
        <Text style={styles.valor}>{formatCurrency(record.valor_total)}</Text>
      </View>

      {(onEdit || onDelete) && (
        <View style={styles.cardActions}>
          {onEdit && (
            <Pressable style={styles.actionBtn} onPress={onEdit}>
              <Ionicons name="create-outline" size={18} color={colors.accent} />
              <Text style={styles.actionText}>Editar</Text>
            </Pressable>
          )}
          {onDelete && (
            <Pressable style={styles.actionBtn} onPress={onDelete}>
              <Ionicons name="trash-outline" size={18} color={colors.danger} />
              <Text style={[styles.actionText, { color: colors.danger }]}>
                Excluir
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </Card>
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
  list: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  empty: {
    alignItems: 'center',
    paddingTop: spacing.xxl * 2,
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
    maxWidth: 260,
  },
  card: { padding: spacing.md },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  type: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: c.accent,
  },
  date: {
    fontSize: fontSize.xs,
    color: c.textMuted,
  },
  descricao: {
    fontSize: fontSize.sm,
    color: c.text,
    marginBottom: spacing.sm,
    lineHeight: 20,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  placa: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    fontWeight: '600',
    backgroundColor: c.bgElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  oficina: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    flex: 1,
  },
  valor: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: c.warning,
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
  offlineBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: c.warning,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  offlineBannerText: {
    color: '#fff',
    fontSize: fontSize.sm,
    fontWeight: '600',
    flex: 1,
  },
});

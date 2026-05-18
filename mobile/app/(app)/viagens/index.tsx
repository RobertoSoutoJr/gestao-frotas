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
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../../src/components/Button';
import { Card } from '../../../src/components/Card';
import { useAuth } from '../../../src/contexts/AuthContext';
import { useToast } from '../../../src/contexts/ToastContext';
import { viagensApi } from '../../../src/api/viagens';
import type { Viagem } from '../../../src/api/types';
import { colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { formatCurrency, formatDate } from '../../../src/lib/format';
import { SkeletonList } from '../../../src/components/Skeleton';
import { SearchBar } from '../../../src/components/SearchBar';
import { useHaptics } from '../../../src/hooks/useHaptics';

export default function ViagensListScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const isMotorista = user?.role === 'motorista';

  const query = useQuery({
    queryKey: ['viagens'],
    queryFn: () => viagensApi.list(),
  });

  const haptics = useHaptics();
  const [search, setSearch] = useState('');

  const deleteMutation = useMutation({
    mutationFn: (id: number) => viagensApi.delete(id),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      showToast('Viagem excluída', 'success');
    },
    onError: (err: any) => {
      haptics.error();
      showToast(err?.message || 'Erro ao excluir', 'error');
    },
  });

  const handleDelete = (id: number) => {
    haptics.warning();
    Alert.alert(
      'Excluir viagem',
      'Tem certeza que deseja excluir esta viagem?',
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

  const myTrips = useMemo(() => {
    const all = query.data ?? [];
    const byDriver = isMotorista && user?.motorista_id
      ? all.filter((t) => t.motorista_id === user.motorista_id)
      : all;
    const sorted = byDriver.sort(
      (a, b) =>
        new Date(b.data_viagem ?? b.created_at ?? 0).getTime() -
        new Date(a.data_viagem ?? a.created_at ?? 0).getTime(),
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (t) =>
        t.produto?.toLowerCase().includes(q) ||
        t.motoristas?.nome?.toLowerCase().includes(q) ||
        t.clientes?.nome?.toLowerCase().includes(q) ||
        t.fornecedores?.nome?.toLowerCase().includes(q),
    );
  }, [query.data, isMotorista, user?.motorista_id, search]);

  const active = myTrips.filter((t) => t.status === 'cadastrada');
  const completed = myTrips.filter((t) => t.status === 'finalizada');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Ionicons name="map" size={28} color={colors.accent} />
        <Text style={styles.title}>Viagens</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{active.length} ativas</Text>
        </View>
      </View>

      <Button
        title="+ Nova Viagem"
        onPress={() => router.push('/(app)/viagens/new')}
        style={styles.newBtn}
      />

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por produto, motorista..." />

      {query.isLoading ? (
        <SkeletonList count={5} />
      ) : (
        <FlatList
          data={myTrips}
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
              <Ionicons
                name="map-outline"
                size={48}
                color={colors.textDim}
              />
              <Text style={styles.emptyTitle}>Nenhuma viagem</Text>
              <Text style={styles.emptyText}>
                {isMotorista
                  ? 'Viagens atribuídas a você aparecerão aqui.'
                  : 'Toque em "+ Nova Viagem" para cadastrar.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TripCard
              trip={item}
              onEdit={() =>
                router.push({
                  pathname: '/(app)/viagens/edit',
                  params: { id: item.id },
                })
              }
              onDelete={() => handleDelete(item.id)}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function TripCard({
  trip,
  onEdit,
  onDelete,
}: {
  trip: Viagem;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const isActive = trip.status === 'cadastrada';
  const custoTotal =
    (Number(trip.custo_combustivel) || 0) +
    (Number(trip.custo_pedagio) || 0) +
    (Number(trip.custo_manutencao) || 0) +
    (Number(trip.custo_outros) || 0);
  const lucro = (Number(trip.valor_total_frete) || 0) - custoTotal;

  return (
    <Pressable onPress={() => router.push(`/(app)/viagens/${trip.id}`)}>
      <Card
        style={isActive ? { ...styles.card, ...styles.cardActive } : styles.card}
      >
        <View style={styles.cardTop}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: isActive ? colors.warning + '25' : colors.success + '25' },
            ]}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: isActive ? colors.warning : colors.success },
              ]}
            />
            <Text
              style={[
                styles.statusText,
                { color: isActive ? colors.warning : colors.success },
              ]}
            >
              {isActive ? 'Ativa' : 'Finalizada'}
            </Text>
          </View>
          <Text style={styles.date}>
            {formatDate(trip.data_viagem || trip.created_at)}
          </Text>
        </View>

        <View style={styles.cardBody}>
          <Text style={styles.produto} numberOfLines={1}>
            {trip.produto || 'Sem produto'}
            {trip.quantidade_sacas ? ` — ${trip.quantidade_sacas} sacas` : ''}
          </Text>

          {trip.distancia_km ? (
            <View style={styles.infoRow}>
              <Ionicons name="speedometer-outline" size={14} color={colors.textMuted} />
              <Text style={styles.infoText}>
                {Number(trip.distancia_km).toLocaleString('pt-BR')} km
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.cardFooter}>
          <Text style={styles.frete}>
            Frete: {formatCurrency(trip.valor_total_frete)}
          </Text>
          {trip.status === 'finalizada' && custoTotal > 0 && (
            <Text
              style={[
                styles.lucro,
                { color: lucro >= 0 ? colors.success : colors.danger },
              ]}
            >
              Lucro: {formatCurrency(lucro)}
            </Text>
          )}
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </View>

        <View style={styles.cardActions}>
          <Pressable
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onEdit();
            }}
          >
            <Ionicons name="create-outline" size={18} color={colors.accent} />
            <Text style={styles.actionText}>Editar</Text>
          </Pressable>
          <Pressable
            style={styles.actionBtn}
            onPress={(e) => {
              e.stopPropagation?.();
              onDelete();
            }}
          >
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
            <Text style={[styles.actionText, { color: colors.danger }]}>
              Excluir
            </Text>
          </Pressable>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.warning + '25',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.warning,
  },
  newBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
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
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    maxWidth: 260,
  },
  card: {
    padding: spacing.md,
  },
  cardActive: {
    borderColor: colors.warning + '40',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  cardBody: {
    marginBottom: spacing.sm,
  },
  produto: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  frete: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.success,
    flex: 1,
  },
  lucro: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '500',
  },
});

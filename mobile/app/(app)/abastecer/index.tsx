import { useMemo } from 'react';
import {
  ActivityIndicator,
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
import { colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { formatCurrency, formatDate, formatNumber } from '../../../src/lib/format';
import type { Abastecimento, Caminhao } from '../../../src/api/types';

export default function AbastecerListScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['abastecimentos'],
    queryFn: () => abastecimentosApi.list(),
  });

  const caminhoesQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => abastecimentosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      showToast('Abastecimento excluído', 'success');
    },
    onError: (err: any) => {
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
    // Motorista vê só os dele
    if (user?.role === 'motorista' && user.motorista_id) {
      list = list.filter((r) => r.motorista_id === user.motorista_id);
    }
    return list.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }, [data, user]);

  const handleDelete = (id: number) => {
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
          {item.posto ? (
            <View style={styles.metaItem}>
              <Ionicons name="location-outline" size={14} color={colors.textMuted} />
              <Text style={styles.metaText} numberOfLines={1}>{item.posto}</Text>
            </View>
          ) : null}
        </View>

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
      </Card>
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

      {isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
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
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.accent}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
    color: colors.text,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  newBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    color: colors.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
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
    color: colors.text,
    letterSpacing: 1,
  },
  cardDate: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  cardValor: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.warning,
  },
  cardMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
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

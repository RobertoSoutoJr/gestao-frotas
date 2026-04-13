import { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { manutencoesApi } from '../../../src/api/manutencoes';
import type { Manutencao } from '../../../src/api/types';
import { colors, fontSize, spacing } from '../../../src/lib/theme';
import { formatCurrency, formatDate } from '../../../src/lib/format';

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
  const query = useQuery({
    queryKey: ['manutencoes'],
    queryFn: () => manutencoesApi.list(),
  });

  const records = useMemo(() => {
    return (query.data ?? []).sort(
      (a, b) =>
        new Date(b.data_manutencao || b.created_at || 0).getTime() -
        new Date(a.data_manutencao || a.created_at || 0).getTime(),
    );
  }, [query.data]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Ionicons name="construct" size={28} color={colors.accent} />
        <Text style={styles.title}>Manutenções</Text>
      </View>

      <Button
        title="+ Nova Manutenção"
        onPress={() => router.push('/(app)/manutencoes/new')}
        style={styles.newBtn}
      />

      {query.isLoading ? (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
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
                Registre manutenções e reparos dos caminhões.
              </Text>
            </View>
          }
          renderItem={({ item }) => <MaintenanceCard record={item} />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function MaintenanceCard({ record }: { record: Manutencao }) {
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
          <Text style={styles.placa}>
            {record.caminhoes.placa}
          </Text>
        ) : null}
        {record.oficina ? (
          <Text style={styles.oficina}>{record.oficina}</Text>
        ) : null}
        <Text style={styles.valor}>{formatCurrency(record.valor_total)}</Text>
      </View>
    </Card>
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
  newBtn: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
    color: colors.accent,
  },
  date: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  descricao: {
    fontSize: fontSize.sm,
    color: colors.text,
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
    color: colors.textMuted,
    fontWeight: '600',
    backgroundColor: colors.bgElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  oficina: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    flex: 1,
  },
  valor: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.warning,
  },
});

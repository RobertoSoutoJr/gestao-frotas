import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { useAuth } from '../../../src/contexts/AuthContext';
import { caminhoesApi } from '../../../src/api/caminhoes';
import { type Colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';
import { formatNumber } from '../../../src/lib/format';
import { SkeletonList } from '../../../src/components/Skeleton';
import { SearchBar } from '../../../src/components/SearchBar';
import type { Caminhao } from '../../../src/api/types';

export default function FrotaListScreen() {
  const { user } = useAuth();
  const isAdmin = user?.role !== 'motorista';
  const colors = useColors();
  const styles = useStyles(createStyles);

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });

  const [search, setSearch] = useState('');

  const trucks = useMemo(() => {
    if (!data) return [];
    const sorted = [...data].sort((a, b) => a.placa.localeCompare(b.placa));
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (t) =>
        t.placa?.toLowerCase().includes(q) ||
        t.modelo?.toLowerCase().includes(q) ||
        t.marca?.toLowerCase().includes(q),
    );
  }, [data, search]);

  const renderTruck = ({ item }: { item: Caminhao }) => {
    const fuelLabel =
      item.tipo_combustivel === 'diesel'
        ? 'Diesel'
        : item.tipo_combustivel || 'N/I';

    return (
      <Pressable onPress={() => router.push(`/(app)/frota/${item.id}`)}>
        <Card style={styles.truckCard}>
          <View style={styles.truckRow}>
            <View style={styles.truckIcon}>
              <Ionicons name="bus" size={24} color={colors.accent} />
            </View>
            <View style={styles.truckInfo}>
              <Text style={styles.truckPlaca}>{item.placa}</Text>
              <Text style={styles.truckModelo}>
                {item.marca ? `${item.marca} ` : ''}
                {item.modelo}
                {item.ano_fabricacao ? ` • ${item.ano_fabricacao}` : ''}
              </Text>
              <View style={styles.truckMeta}>
                {item.km_atual ? (
                  <View style={styles.metaChip}>
                    <Ionicons name="speedometer-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.metaText}>
                      {formatNumber(item.km_atual, 0)} km
                    </Text>
                  </View>
                ) : null}
                <View style={styles.metaChip}>
                  <Ionicons name="water-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.metaText}>{fuelLabel}</Text>
                </View>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
          </View>
        </Card>
      </Pressable>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Frota</Text>
          <Text style={styles.subtitle}>
            {trucks.length} caminhão{trucks.length !== 1 ? 'ões' : ''}
          </Text>
        </View>
        {isAdmin && (
          <Button
            title="+ Novo"
            onPress={() => router.push('/(app)/frota/new')}
            style={styles.newBtn}
          />
        )}
      </View>

      <SearchBar value={search} onChangeText={setSearch} placeholder="Buscar por placa ou modelo..." />

      {isLoading ? (
        <SkeletonList count={4} />
      ) : trucks.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="bus-outline" size={48} color={colors.textDim} />
          <Text style={styles.emptyTitle}>Nenhum caminhão</Text>
          <Text style={styles.emptyText}>
            {isAdmin
              ? 'Toque em "+ Novo" para cadastrar seu primeiro caminhão.'
              : 'Nenhum caminhão cadastrado pelo gestor ainda.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={trucks}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderTruck}
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

const createStyles = (c: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  newBtn: {
    paddingHorizontal: spacing.md,
    minWidth: 80,
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
  truckCard: {
    padding: spacing.md,
  },
  truckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  truckIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: c.accent + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  truckInfo: {
    flex: 1,
  },
  truckPlaca: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: c.text,
    letterSpacing: 1,
  },
  truckModelo: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    marginTop: 2,
  },
  truckMeta: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: fontSize.xs,
    color: c.textMuted,
  },
});

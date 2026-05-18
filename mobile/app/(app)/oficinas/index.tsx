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
import { SearchBar } from '../../../src/components/SearchBar';
import { SkeletonList } from '../../../src/components/Skeleton';
import { useHaptics } from '../../../src/hooks/useHaptics';
import { useToast } from '../../../src/contexts/ToastContext';
import { oficinasApi, Oficina } from '../../../src/api/oficinas';
import { colors, fontSize, radius, spacing } from '../../../src/lib/theme';

export default function OficinasListScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const haptics = useHaptics();
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['oficinas'],
    queryFn: () => oficinasApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => oficinasApi.delete(id),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['oficinas'] });
      showToast('Oficina excluida', 'success');
    },
    onError: (err: any) => {
      haptics.error();
      showToast(err?.message || 'Erro ao excluir', 'error');
    },
  });

  const handleDelete = (id: number) => {
    haptics.warning();
    Alert.alert(
      'Excluir oficina',
      'Tem certeza que deseja excluir esta oficina?',
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
    const sorted = (query.data ?? []).sort((a, b) =>
      a.nome.localeCompare(b.nome),
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (r) =>
        r.nome?.toLowerCase().includes(q) ||
        r.endereco?.toLowerCase().includes(q) ||
        r.telefone?.includes(q),
    );
  }, [query.data, search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Ionicons name="build" size={28} color={colors.accent} />
        <Text style={styles.title}>Oficinas</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{records.length}</Text>
        </View>
      </View>

      <Button
        title="+ Nova Oficina"
        onPress={() => router.push('/(app)/oficinas/new')}
        style={styles.newBtn}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nome ou endereco..."
      />

      {query.isLoading ? (
        <SkeletonList count={4} />
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
              <Ionicons name="build-outline" size={48} color={colors.textDim} />
              <Text style={styles.emptyTitle}>Nenhuma oficina</Text>
              <Text style={styles.emptyText}>
                Toque em "+ Nova Oficina" para cadastrar.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <OficinaCard oficina={item} onDelete={() => handleDelete(item.id)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function OficinaCard({
  oficina,
  onDelete,
}: {
  oficina: Oficina;
  onDelete: () => void;
}) {
  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Ionicons name="build" size={20} color={colors.accent} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.nome} numberOfLines={1}>
            {oficina.nome}
          </Text>
          {oficina.endereco ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText} numberOfLines={1}>
                {oficina.endereco}
              </Text>
            </View>
          ) : null}
          {oficina.telefone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>{oficina.telefone}</Text>
            </View>
          ) : null}
          {oficina.cnpj ? (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>{oficina.cnpj}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <View style={styles.cardActions}>
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
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.accent + '25',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: colors.accent,
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
  cardTop: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  nome: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    flex: 1,
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
    fontWeight: '500',
  },
});

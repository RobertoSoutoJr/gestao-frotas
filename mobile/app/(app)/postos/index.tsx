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
import { postosApi, Posto } from '../../../src/api/postos';
import { type Colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';

export default function PostosListScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const haptics = useHaptics();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['postos'],
    queryFn: () => postosApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => postosApi.delete(id),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['postos'] });
      showToast('Posto excluido', 'success');
    },
    onError: (err: any) => {
      haptics.error();
      showToast(err?.message || 'Erro ao excluir', 'error');
    },
  });

  const handleDelete = (id: number) => {
    haptics.warning();
    Alert.alert(
      'Excluir posto',
      'Tem certeza que deseja excluir este posto?',
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
        <Ionicons name="gas-station" size={28} color={colors.accent} />
        <Text style={styles.title}>Postos</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{records.length}</Text>
        </View>
      </View>

      <Button
        title="+ Novo Posto"
        onPress={() => router.push('/(app)/postos/new')}
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
              <Ionicons
                name="gas-station-outline"
                size={48}
                color={colors.textDim}
              />
              <Text style={styles.emptyTitle}>Nenhum posto</Text>
              <Text style={styles.emptyText}>
                Toque em "+ Novo Posto" para cadastrar.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <PostoCard posto={item} onDelete={() => handleDelete(item.id)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
      )}
    </SafeAreaView>
  );
}

function PostoCard({
  posto,
  onDelete,
}: {
  posto: Posto;
  onDelete: () => void;
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <View style={styles.iconWrap}>
          <Ionicons name="gas-station" size={20} color={colors.success} />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.nome} numberOfLines={1}>
            {posto.nome}
          </Text>
          {posto.endereco ? (
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText} numberOfLines={1}>
                {posto.endereco}
              </Text>
            </View>
          ) : null}
          {posto.telefone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>{posto.telefone}</Text>
            </View>
          ) : null}
          {posto.cnpj ? (
            <View style={styles.infoRow}>
              <Ionicons name="document-text-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>{posto.cnpj}</Text>
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

const createStyles = (c: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
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
    backgroundColor: c.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: c.border,
  },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: c.text,
    flex: 1,
  },
  badge: {
    backgroundColor: c.success + '25',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: c.success,
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
    color: c.text,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: c.textMuted,
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
    backgroundColor: c.success + '15',
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
    color: c.text,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    flex: 1,
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
    fontWeight: '500',
  },
});

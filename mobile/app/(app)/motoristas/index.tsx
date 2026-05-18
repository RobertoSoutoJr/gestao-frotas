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
import { motoristasApi } from '../../../src/api/motoristas';
import type { Motorista } from '../../../src/api/types';
import { type Colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';

function daysUntil(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export default function MotoristasListScreen() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const haptics = useHaptics();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [search, setSearch] = useState('');

  const query = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => motoristasApi.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => motoristasApi.delete(id),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      showToast('Motorista excluido', 'success');
    },
    onError: (err: any) => {
      haptics.error();
      showToast(err?.message || 'Erro ao excluir', 'error');
    },
  });

  const handleDelete = (id: number) => {
    haptics.warning();
    Alert.alert(
      'Excluir motorista',
      'Tem certeza que deseja excluir este motorista?',
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
        r.cpf?.includes(q) ||
        r.telefone?.includes(q) ||
        r.cnh?.includes(q),
    );
  }, [query.data, search]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
        <Ionicons name="people" size={28} color={colors.accent} />
        <Text style={styles.title}>Motoristas</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{records.length}</Text>
        </View>
      </View>

      <Button
        title="+ Novo Motorista"
        onPress={() => router.push('/(app)/motoristas/new')}
        style={styles.newBtn}
      />

      <SearchBar
        value={search}
        onChangeText={setSearch}
        placeholder="Buscar por nome, CPF ou CNH..."
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
              <Ionicons name="people-outline" size={48} color={colors.textDim} />
              <Text style={styles.emptyTitle}>Nenhum motorista</Text>
              <Text style={styles.emptyText}>
                Toque em "+ Novo Motorista" para cadastrar.
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <MotoristaCard
              motorista={item}
              onEdit={() =>
                router.push({
                  pathname: '/(app)/motoristas/edit',
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

function MotoristaCard({
  motorista,
  onEdit,
  onDelete,
}: {
  motorista: Motorista;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const cnhDays = daysUntil(motorista.vencimento_cnh);
  const cnhExpired = cnhDays !== null && cnhDays < 0;
  const cnhWarning = cnhDays !== null && cnhDays >= 0 && cnhDays <= 30;

  return (
    <Card style={styles.card}>
      <View style={styles.cardTop}>
        <View
          style={[
            styles.avatar,
            cnhExpired && { backgroundColor: colors.danger + '20' },
            cnhWarning && { backgroundColor: colors.warning + '20' },
          ]}
        >
          <Ionicons
            name="person"
            size={22}
            color={cnhExpired ? colors.danger : cnhWarning ? colors.warning : colors.accent}
          />
        </View>
        <View style={styles.cardInfo}>
          <Text style={styles.nome} numberOfLines={1}>
            {motorista.nome}
          </Text>
          {motorista.cpf ? (
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>{motorista.cpf}</Text>
            </View>
          ) : null}
          {motorista.telefone ? (
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>{motorista.telefone}</Text>
            </View>
          ) : null}
          {motorista.categoria_cnh ? (
            <View style={styles.infoRow}>
              <Ionicons name="id-card-outline" size={13} color={colors.textMuted} />
              <Text style={styles.infoText}>
                CNH {motorista.categoria_cnh}
                {cnhExpired
                  ? ' — Vencida!'
                  : cnhWarning
                  ? ` — Vence em ${cnhDays}d`
                  : ''}
              </Text>
            </View>
          ) : null}
        </View>

        {(cnhExpired || cnhWarning) && (
          <Ionicons
            name="warning"
            size={18}
            color={cnhExpired ? colors.danger : colors.warning}
          />
        )}
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
    backgroundColor: c.accent + '25',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: c.accent,
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
    alignItems: 'flex-start',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: c.accent + '15',
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
    color: c.accent,
    fontWeight: '500',
  },
});

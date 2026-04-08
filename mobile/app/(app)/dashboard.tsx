import { useMemo } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { StatCard } from '../../src/components/StatCard';
import { useAuth } from '../../src/contexts/AuthContext';
import { viagensApi } from '../../src/api/viagens';
import { abastecimentosApi } from '../../src/api/abastecimentos';
import { caminhoesApi } from '../../src/api/caminhoes';
import { colors, fontSize, radius, spacing } from '../../src/lib/theme';
import { formatCurrency, formatNumber } from '../../src/lib/format';

export default function DashboardScreen() {
  const { user } = useAuth();
  const isMotorista = user?.role === 'motorista';

  const viagensQuery = useQuery({
    queryKey: ['viagens'],
    queryFn: () => viagensApi.list(),
  });

  const fuelQuery = useQuery({
    queryKey: ['abastecimentos'],
    queryFn: () => abastecimentosApi.list(),
  });

  const caminhoesQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });

  const isLoading =
    viagensQuery.isLoading || fuelQuery.isLoading || caminhoesQuery.isLoading;
  const isRefetching =
    viagensQuery.isRefetching || fuelQuery.isRefetching || caminhoesQuery.isRefetching;

  const handleRefresh = () => {
    viagensQuery.refetch();
    fuelQuery.refetch();
    caminhoesQuery.refetch();
  };

  // Motorista stats
  const motoristaStats = useMemo(() => {
    if (!isMotorista || !user?.motorista_id) {
      return null;
    }
    const myTrips = (viagensQuery.data ?? []).filter(
      (t) => t.motorista_id === user.motorista_id,
    );
    const myFuel = (fuelQuery.data ?? []).filter(
      (r) => r.motorista_id === user.motorista_id,
    );

    const activeTrips = myTrips.filter((t) => t.status === 'cadastrada');
    const completedTrips = myTrips.filter((t) => t.status === 'finalizada');

    const totalLitros = myFuel.reduce((s, r) => s + (Number(r.litros) || 0), 0);
    const totalGasto = myFuel.reduce(
      (s, r) => s + (Number(r.valor_total) || 0),
      0,
    );
    const totalFrete = completedTrips.reduce(
      (s, t) => s + (Number(t.valor_total_frete) || 0),
      0,
    );
    const totalCustos = completedTrips.reduce(
      (s, t) =>
        s +
        (Number(t.custo_combustivel) || 0) +
        (Number(t.custo_pedagio) || 0) +
        (Number(t.custo_manutencao) || 0) +
        (Number(t.custo_outros) || 0),
      0,
    );
    const lucroTotal = totalFrete - totalCustos;
    const totalKm = myTrips.reduce(
      (s, t) => s + (Number(t.distancia_km) || 0),
      0,
    );
    const kmPerLiter = totalLitros > 0 ? totalKm / totalLitros : 0;

    return {
      activeTrips: activeTrips.length,
      completedTrips: completedTrips.length,
      totalKm,
      totalLitros,
      totalGasto,
      totalFrete,
      lucroTotal,
      kmPerLiter,
    };
  }, [isMotorista, user?.motorista_id, viagensQuery.data, fuelQuery.data]);

  // Admin (gestor) stats
  const adminStats = useMemo(() => {
    if (isMotorista) return null;
    const trips = viagensQuery.data ?? [];
    const fuel = fuelQuery.data ?? [];
    const caminhoes = caminhoesQuery.data ?? [];

    const activeTrips = trips.filter((t) => t.status === 'cadastrada').length;
    const completedTrips = trips.filter((t) => t.status === 'finalizada');
    const totalFrete = completedTrips.reduce(
      (s, t) => s + (Number(t.valor_total_frete) || 0),
      0,
    );
    const totalGasto = fuel.reduce(
      (s, r) => s + (Number(r.valor_total) || 0),
      0,
    );

    return {
      totalCaminhoes: caminhoes.length,
      activeTrips,
      completedTrips: completedTrips.length,
      totalFrete,
      totalGasto,
    };
  }, [isMotorista, viagensQuery.data, fuelQuery.data, caminhoesQuery.data]);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={handleRefresh}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Olá, {user?.nome?.split(' ')[0] ?? ''}
          </Text>
          <Text style={styles.role}>
            {isMotorista ? 'Motorista' : 'Gestor'}
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : isMotorista ? (
          <MotoristaView stats={motoristaStats} />
        ) : (
          <AdminView stats={adminStats} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function MotoristaView({
  stats,
}: {
  stats: ReturnType<typeof useMemo> extends infer R ? any : never;
}) {
  if (!stats) {
    return (
      <Card>
        <Text style={styles.emptyTitle}>Perfil incompleto</Text>
        <Text style={styles.emptyText}>
          Seu usuário ainda não está vinculado a um registro de motorista. Fale
          com o gestor da frota para liberar o acesso.
        </Text>
      </Card>
    );
  }

  return (
    <View>
      <View style={styles.statsRow}>
        <StatCard
          icon="navigate-outline"
          iconColor={colors.info}
          value={String(stats.activeTrips)}
          label="Viagens ativas"
        />
        <StatCard
          icon="checkmark-circle-outline"
          iconColor={colors.success}
          value={String(stats.completedTrips)}
          label="Finalizadas"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="speedometer-outline"
          iconColor={colors.warning}
          value={formatNumber(stats.totalKm, 0)}
          label="km rodados"
        />
        <StatCard
          icon="flash-outline"
          iconColor={colors.accent}
          value={formatNumber(stats.kmPerLiter, 1)}
          label="km/litro"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="cash-outline"
          iconColor={colors.success}
          value={formatCurrency(stats.totalFrete)}
          label="Frete total"
        />
        <StatCard
          icon="water-outline"
          iconColor={colors.info}
          value={formatCurrency(stats.totalGasto)}
          label="Combustível"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="trending-up-outline"
          iconColor={stats.lucroTotal >= 0 ? colors.success : colors.danger}
          value={formatCurrency(stats.lucroTotal)}
          label="Lucro líquido"
        />
        <StatCard
          icon="flame-outline"
          iconColor={colors.warning}
          value={`${formatNumber(stats.totalLitros, 0)}L`}
          label="Total litros"
        />
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.infoTitle}>Próximos passos</Text>
        </View>
        <Text style={styles.infoText}>
          Use a aba Abastecer para registrar um novo abastecimento ou Viagens
          para iniciar e finalizar uma viagem com GPS.
        </Text>
      </Card>
    </View>
  );
}

function AdminView({ stats }: { stats: any }) {
  if (!stats) return null;

  return (
    <View>
      <View style={styles.statsRow}>
        <StatCard
          icon="bus-outline"
          iconColor={colors.accent}
          value={String(stats.totalCaminhoes)}
          label="Caminhões"
        />
        <StatCard
          icon="navigate-outline"
          iconColor={colors.info}
          value={String(stats.activeTrips)}
          label="Viagens ativas"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="checkmark-circle-outline"
          iconColor={colors.success}
          value={String(stats.completedTrips)}
          label="Finalizadas"
        />
        <StatCard
          icon="cash-outline"
          iconColor={colors.success}
          value={formatCurrency(stats.totalFrete)}
          label="Receita"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="water-outline"
          iconColor={colors.info}
          value={formatCurrency(stats.totalGasto)}
          label="Gasto combustível"
        />
        <View style={{ flex: 1 }} />
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color={colors.accent}
          />
          <Text style={styles.infoTitle}>Painel do Gestor</Text>
        </View>
        <Text style={styles.infoText}>
          Versão mobile focada em acompanhamento rápido. Para gerenciar a frota
          com mais detalhes use o painel web.
        </Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  loading: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoCard: {
    marginTop: spacing.md,
    borderRadius: radius.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
});

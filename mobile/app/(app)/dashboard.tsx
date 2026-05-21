import { useMemo } from 'react';
import {
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
import { SkeletonStatGrid } from '../../src/components/Skeleton';
import { useAuth } from '../../src/contexts/AuthContext';
import { useColors, useStyles } from '../../src/contexts/ThemeContext';
import { viagensApi } from '../../src/api/viagens';
import { abastecimentosApi } from '../../src/api/abastecimentos';
import { caminhoesApi } from '../../src/api/caminhoes';
import { manutencoesApi } from '../../src/api/manutencoes';
import { type Colors, fontSize, radius, spacing } from '../../src/lib/theme';
import { formatCurrency, formatNumber } from '../../src/lib/format';

const MESES = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
];

export default function DashboardScreen() {
  const { user } = useAuth();
  const colors = useColors();
  const styles = useStyles(createStyles);
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

  const manutencoesQuery = useQuery({
    queryKey: ['manutencoes'],
    queryFn: () => manutencoesApi.list(),
    enabled: !isMotorista,
  });

  const isLoading =
    viagensQuery.isLoading ||
    fuelQuery.isLoading ||
    caminhoesQuery.isLoading ||
    (!isMotorista && manutencoesQuery.isLoading);

  const isRefetching =
    viagensQuery.isRefetching ||
    fuelQuery.isRefetching ||
    caminhoesQuery.isRefetching ||
    manutencoesQuery.isRefetching;

  const handleRefresh = () => {
    viagensQuery.refetch();
    fuelQuery.refetch();
    caminhoesQuery.refetch();
    manutencoesQuery.refetch();
  };

  // Motorista stats
  const motoristaStats = useMemo((): MotoristaStats | null => {
    if (!isMotorista || !user?.motorista_id) return null;

    const myTrips = (viagensQuery.data ?? []).filter(
      (t) => t.motorista_id === user.motorista_id,
    );
    const myFuel = (fuelQuery.data ?? []).filter(
      (r) => r.motorista_id === user.motorista_id,
    );

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const myFuelMes = myFuel.filter((r) => new Date(r.created_at) >= startOfMonth);

    const activeTrips = myTrips.filter((t) => t.status === 'cadastrada');
    const completedTrips = myTrips.filter((t) => t.status === 'finalizada');

    const totalLitros = myFuel.reduce((s, r) => s + (Number(r.litros) || 0), 0);
    const totalGasto = myFuel.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const gastoMes = myFuelMes.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const totalFrete = completedTrips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
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
    const totalKm = myTrips.reduce((s, t) => s + (Number(t.distancia_km) || 0), 0);
    const kmPerLiter = totalLitros > 0 ? totalKm / totalLitros : 0;

    return {
      activeTrips: activeTrips.length,
      completedTrips: completedTrips.length,
      totalKm,
      totalLitros,
      totalGasto,
      gastoMes,
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
    const manut = manutencoesQuery.data ?? [];

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const fuelMes = fuel.filter((r) => new Date(r.created_at) >= startOfMonth);
    const tripsMes = trips.filter((t) => {
      const d = t.data_viagem ?? (t as any).created_at;
      return d && new Date(d) >= startOfMonth;
    });

    const activeTrips = trips.filter((t) => t.status === 'cadastrada').length;
    const completedTrips = trips.filter((t) => t.status === 'finalizada');
    const totalFrete = completedTrips.reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
    const totalGasto = fuel.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const gastoMes = fuelMes.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);
    const receitaMes = tripsMes
      .filter((t) => t.status === 'finalizada')
      .reduce((s, t) => s + (Number(t.valor_total_frete) || 0), 0);
    const totalKm = trips.reduce((s, t) => s + (Number(t.distancia_km) || 0), 0);
    const totalLitros = fuel.reduce((s, r) => s + (Number(r.litros) || 0), 0);
    const kmPerLiter = totalLitros > 0 ? totalKm / totalLitros : 0;
    const pendingMaintenance = manut.filter((m) => m.status === 'pendente').length;
    const inProgressMaintenance = manut.filter((m) => m.status === 'em_andamento').length;

    return {
      totalCaminhoes: caminhoes.length,
      activeTrips,
      completedTrips: completedTrips.length,
      totalFrete,
      totalGasto,
      gastoMes,
      receitaMes,
      totalKm,
      kmPerLiter,
      pendingMaintenance,
      inProgressMaintenance,
      mesAtual: MESES[now.getMonth()],
    };
  }, [isMotorista, viagensQuery.data, fuelQuery.data, caminhoesQuery.data, manutencoesQuery.data]);

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
          <SkeletonStatGrid count={isMotorista ? 8 : 6} />
        ) : isMotorista ? (
          <MotoristaView stats={motoristaStats} />
        ) : (
          <AdminView stats={adminStats} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

interface MotoristaStats {
  activeTrips: number;
  completedTrips: number;
  totalKm: number;
  totalLitros: number;
  totalGasto: number;
  gastoMes: number;
  totalFrete: number;
  lucroTotal: number;
  kmPerLiter: number;
}

function MotoristaView({ stats }: { stats: MotoristaStats | null }) {
  const colors = useColors();
  const styles = useStyles(createStyles);

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
          value={formatCurrency(stats.gastoMes)}
          label="Combustível do mês"
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
          <Ionicons name="information-circle-outline" size={20} color={colors.accent} />
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

interface AdminStats {
  totalCaminhoes: number;
  activeTrips: number;
  completedTrips: number;
  totalFrete: number;
  totalGasto: number;
  gastoMes: number;
  receitaMes: number;
  totalKm: number;
  kmPerLiter: number;
  pendingMaintenance: number;
  inProgressMaintenance: number;
  mesAtual: string;
}

function AdminView({ stats }: { stats: AdminStats | null }) {
  const colors = useColors();
  const styles = useStyles(createStyles);

  if (!stats) return null;

  const hasMaintAlert = stats.pendingMaintenance > 0 || stats.inProgressMaintenance > 0;

  return (
    <View>
      {/* Alertas de manutenção */}
      {hasMaintAlert && (
        <View style={[styles.alertCard, { borderColor: colors.warning + '50', backgroundColor: colors.warning + '10' }]}>
          <Ionicons name="construct-outline" size={18} color={colors.warning} />
          <Text style={[styles.alertText, { color: colors.warning }]}>
            {stats.pendingMaintenance > 0
              ? `${stats.pendingMaintenance} manutenção(ões) pendente(s)`
              : ''}
            {stats.pendingMaintenance > 0 && stats.inProgressMaintenance > 0 ? ' · ' : ''}
            {stats.inProgressMaintenance > 0
              ? `${stats.inProgressMaintenance} em andamento`
              : ''}
          </Text>
        </View>
      )}

      {/* Mês atual */}
      <Text style={styles.mesLabel}>{stats.mesAtual}</Text>

      <View style={styles.statsRow}>
        <StatCard
          icon="water-outline"
          iconColor={colors.warning}
          value={formatCurrency(stats.gastoMes)}
          label="Combustível do mês"
        />
        <StatCard
          icon="cash-outline"
          iconColor={colors.success}
          value={formatCurrency(stats.receitaMes)}
          label="Receita do mês"
        />
      </View>

      {/* Totais gerais */}
      <Text style={styles.mesLabel}>Geral</Text>

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
          icon="trending-up-outline"
          iconColor={colors.success}
          value={formatCurrency(stats.totalFrete)}
          label="Receita total"
        />
        <StatCard
          icon="flash-outline"
          iconColor={colors.accent}
          value={formatNumber(stats.kmPerLiter, 2)}
          label="km/litro"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="speedometer-outline"
          iconColor={colors.warning}
          value={`${formatNumber(stats.totalKm, 0)} km`}
          label="km total"
        />
        <StatCard
          icon="checkmark-circle-outline"
          iconColor={colors.success}
          value={String(stats.completedTrips)}
          label="Viagens finalizadas"
        />
      </View>

      <Card style={styles.infoCard}>
        <View style={styles.infoHeader}>
          <Ionicons name="bar-chart-outline" size={20} color={colors.accent} />
          <Text style={styles.infoTitle}>Relatórios detalhados</Text>
        </View>
        <Text style={styles.infoText}>
          Acesse a aba Relatórios para ver KPIs filtrados por período, ranking de
          veículos e análise de custos.
        </Text>
      </Card>
    </View>
  );
}

const createStyles = (c: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { marginBottom: spacing.lg },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: c.text,
  },
  role: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    marginTop: spacing.xs,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  mesLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  alertCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  alertText: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
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
    color: c.text,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    lineHeight: 20,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: c.text,
    marginBottom: spacing.xs,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    lineHeight: 20,
  },
});

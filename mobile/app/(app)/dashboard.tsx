import { useMemo } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Card } from '../../src/components/Card';
import { StatCard } from '../../src/components/StatCard';
import { SkeletonStatGrid } from '../../src/components/Skeleton';
import { useAuth } from '../../src/contexts/AuthContext';
import { useColors, useStyles } from '../../src/contexts/ThemeContext';
import { dashboardApi, type DashboardData, type DashboardViagem } from '../../src/api/dashboard';
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

  const { data, isLoading, isRefetching, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: () => dashboardApi.getData(),
    staleTime: 60_000,
  });

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor={colors.accent}
          />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>
            Ola, {user?.nome?.split(' ')[0] ?? ''}
          </Text>
          <Text style={styles.role}>
            {isMotorista ? 'Motorista' : 'Gestor'}
          </Text>
        </View>

        {isLoading ? (
          <SkeletonStatGrid count={isMotorista ? 4 : 6} />
        ) : isMotorista ? (
          <MotoristaView data={data ?? null} />
        ) : (
          <AdminView data={data ?? null} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

/* ───────────────────── MOTORISTA VIEW ───────────────────── */

function MotoristaView({ data }: { data: DashboardData | null }) {
  const colors = useColors();
  const styles = useStyles(createStyles);

  if (!data) return null;

  const { caminhao, viagemAtiva, abastecimentos, viagens, manutencoes } = data;

  // Compute month stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const fuelMes = abastecimentos.filter(r => new Date(r.created_at) >= startOfMonth);
  const litrosMes = fuelMes.reduce((s, r) => s + (Number(r.litros) || 0), 0);
  const gastoMes = fuelMes.reduce((s, r) => s + (Number(r.valor_total) || 0), 0);

  const viagensFinalizadas = viagens.filter(v => v.status === 'finalizada');
  const viagensCadastradas = viagens.filter(v => v.status === 'cadastrada');
  const totalKm = viagens.reduce((s, v) => s + (Number(v.distancia_km) || 0), 0);
  const totalLitros = abastecimentos.reduce((s, r) => s + (Number(r.litros) || 0), 0);
  const kmPerLiter = totalLitros > 0 ? totalKm / totalLitros : 0;

  // Last 5 records (mixed fuel + maintenance) sorted by date
  const recentRecords = useMemo(() => {
    const items: Array<{ type: 'fuel' | 'maintenance'; date: string; label: string; value: string; id: number }> = [];

    abastecimentos.slice(0, 5).forEach(r => {
      items.push({
        type: 'fuel',
        date: r.created_at,
        label: `${formatNumber(r.litros, 1)}L`,
        value: formatCurrency(r.valor_total),
        id: r.id,
      });
    });

    manutencoes.slice(0, 5).forEach(m => {
      items.push({
        type: 'maintenance',
        date: m.created_at,
        label: m.tipo_manutencao,
        value: formatCurrency(m.valor_total),
        id: m.id,
      });
    });

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [abastecimentos, manutencoes]);

  // No truck assigned
  if (!caminhao) {
    return (
      <Card>
        <View style={styles.emptyIcon}>
          <Ionicons name="alert-circle-outline" size={40} color={colors.warning} />
        </View>
        <Text style={styles.emptyTitle}>Sem caminhao vinculado</Text>
        <Text style={styles.emptyText}>
          Seu perfil ainda nao esta vinculado a um caminhao. Fale com o gestor da frota para liberar o acesso.
        </Text>
      </Card>
    );
  }

  return (
    <View>
      {/* ── Card do Caminhao ── */}
      <Card style={styles.truckCard}>
        <View style={styles.truckHeader}>
          <View style={[styles.truckIconBox, { backgroundColor: colors.accent + '20' }]}>
            <Ionicons name="bus" size={24} color={colors.accent} />
          </View>
          <View style={styles.truckInfo}>
            <Text style={styles.truckPlaca}>{caminhao.placa}</Text>
            <Text style={styles.truckModelo}>{caminhao.modelo}{caminhao.marca ? ` - ${caminhao.marca}` : ''}</Text>
          </View>
        </View>
        <View style={styles.truckStats}>
          <View style={styles.truckStatItem}>
            <Text style={styles.truckStatValue}>{formatNumber(caminhao.km_atual || 0, 0)}</Text>
            <Text style={styles.truckStatLabel}>km atual</Text>
          </View>
          {caminhao.tipo_combustivel && (
            <View style={styles.truckStatItem}>
              <Text style={styles.truckStatValue}>{caminhao.tipo_combustivel}</Text>
              <Text style={styles.truckStatLabel}>Combustivel</Text>
            </View>
          )}
          {caminhao.capacidade_carga && (
            <View style={styles.truckStatItem}>
              <Text style={styles.truckStatValue}>{formatNumber(caminhao.capacidade_carga, 0)}t</Text>
              <Text style={styles.truckStatLabel}>Capacidade</Text>
            </View>
          )}
        </View>
      </Card>

      {/* ── Viagem Ativa ── */}
      {viagemAtiva && (
        <ActiveTripCard trip={viagemAtiva} />
      )}

      {/* ── Botoes de Acao Rapida (2x2) ── */}
      <Text style={styles.sectionLabel}>Acoes rapidas</Text>
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [
            styles.quickBtn,
            { backgroundColor: colors.info + '15', borderColor: colors.info + '30' },
            pressed && styles.quickBtnPressed,
          ]}
          onPress={() => router.push('/(app)/abastecer/new')}
        >
          <Ionicons name="water" size={24} color={colors.info} />
          <Text style={[styles.quickBtnText, { color: colors.info }]}>Abastecer</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.quickBtn,
            { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' },
            pressed && styles.quickBtnPressed,
          ]}
          onPress={() => router.push('/(app)/manutencoes/new')}
        >
          <Ionicons name="construct" size={24} color={colors.warning} />
          <Text style={[styles.quickBtnText, { color: colors.warning }]}>Manutencao</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.quickBtn,
            { backgroundColor: colors.success + '15', borderColor: colors.success + '30' },
            pressed && styles.quickBtnPressed,
          ]}
          onPress={() => router.push('/(app)/viagens')}
        >
          <Ionicons name="map" size={24} color={colors.success} />
          <Text style={[styles.quickBtnText, { color: colors.success }]}>Viagens</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.quickBtn,
            { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' },
            pressed && styles.quickBtnPressed,
          ]}
          onPress={() => router.push('/(app)/perfil')}
        >
          <Ionicons name="person" size={24} color={colors.accent} />
          <Text style={[styles.quickBtnText, { color: colors.accent }]}>Perfil</Text>
        </Pressable>
      </View>

      {/* ── Resumo do Mes ── */}
      <Text style={styles.sectionLabel}>{MESES[now.getMonth()]}</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="water-outline"
          iconColor={colors.info}
          value={formatCurrency(gastoMes)}
          label="Combustivel"
        />
        <StatCard
          icon="flame-outline"
          iconColor={colors.warning}
          value={`${formatNumber(litrosMes, 0)}L`}
          label="Litros abastecidos"
        />
      </View>

      {/* ── Totais Gerais ── */}
      <Text style={styles.sectionLabel}>Geral</Text>
      <View style={styles.statsRow}>
        <StatCard
          icon="navigate-outline"
          iconColor={colors.success}
          value={String(viagensCadastradas.length)}
          label="Viagens ativas"
        />
        <StatCard
          icon="checkmark-circle-outline"
          iconColor={colors.accent}
          value={String(viagensFinalizadas.length)}
          label="Finalizadas"
        />
      </View>
      <View style={styles.statsRow}>
        <StatCard
          icon="speedometer-outline"
          iconColor={colors.warning}
          value={`${formatNumber(totalKm, 0)} km`}
          label="km rodados"
        />
        <StatCard
          icon="flash-outline"
          iconColor={colors.info}
          value={formatNumber(kmPerLiter, 1)}
          label="km/litro"
        />
      </View>

      {/* ── Ultimos Registros ── */}
      {recentRecords.length > 0 && (
        <>
          <Text style={styles.sectionLabel}>Ultimos registros</Text>
          <Card>
            {recentRecords.map((rec, idx) => (
              <View
                key={`${rec.type}-${rec.id}`}
                style={[
                  styles.recentItem,
                  idx < recentRecords.length - 1 && styles.recentItemBorder,
                ]}
              >
                <Ionicons
                  name={rec.type === 'fuel' ? 'water-outline' : 'construct-outline'}
                  size={18}
                  color={rec.type === 'fuel' ? colors.info : colors.warning}
                />
                <View style={styles.recentInfo}>
                  <Text style={styles.recentLabel}>{rec.label}</Text>
                  <Text style={styles.recentDate}>
                    {new Date(rec.date).toLocaleDateString('pt-BR')}
                  </Text>
                </View>
                <Text style={styles.recentValue}>{rec.value}</Text>
              </View>
            ))}
          </Card>
        </>
      )}
    </View>
  );
}

/* ── Active Trip Card ── */
function ActiveTripCard({ trip }: { trip: DashboardViagem }) {
  const colors = useColors();
  const styles = useStyles(createStyles);

  const fornecedor = trip.fornecedores?.nome ?? 'Origem';
  const cliente = trip.clientes?.nome ?? 'Destino';

  return (
    <Pressable onPress={() => router.push(`/(app)/viagens/${trip.id}` as any)}>
      <Card style={[styles.activeTripCard, { borderColor: colors.success + '40' }]}>
        <View style={styles.activeTripBadge}>
          <View style={[styles.activeDot, { backgroundColor: colors.success }]} />
          <Text style={[styles.activeTripBadgeText, { color: colors.success }]}>
            Viagem ativa
          </Text>
        </View>

        <View style={styles.tripRoute}>
          <View style={styles.tripPoint}>
            <Ionicons name="location" size={16} color={colors.accent} />
            <Text style={styles.tripPointText} numberOfLines={1}>{fornecedor}</Text>
          </View>
          <Ionicons name="arrow-forward" size={14} color={colors.textMuted} style={{ marginHorizontal: spacing.xs }} />
          <View style={styles.tripPoint}>
            <Ionicons name="flag" size={16} color={colors.success} />
            <Text style={styles.tripPointText} numberOfLines={1}>{cliente}</Text>
          </View>
        </View>

        {trip.produto && (
          <Text style={styles.tripProduct}>{trip.produto}</Text>
        )}

        <View style={styles.tripFooter}>
          {trip.valor_total_frete > 0 && (
            <Text style={styles.tripFrete}>
              Frete: {formatCurrency(trip.valor_total_frete)}
            </Text>
          )}
          <View style={[styles.tripAction, { backgroundColor: colors.success + '20' }]}>
            <Text style={[styles.tripActionText, { color: colors.success }]}>
              Ver detalhes
            </Text>
            <Ionicons name="chevron-forward" size={14} color={colors.success} />
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

/* ───────────────────── ADMIN VIEW ───────────────────── */

function AdminView({ data }: { data: DashboardData | null }) {
  const colors = useColors();
  const styles = useStyles(createStyles);

  const stats = useMemo(() => {
    if (!data) return null;
    const { viagens: trips, abastecimentos: fuel, caminhoes, manutencoes: manut } = data;

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
  }, [data]);

  if (!stats) return null;

  const hasMaintAlert = stats.pendingMaintenance > 0 || stats.inProgressMaintenance > 0;

  const resultado = stats.receitaMes - stats.gastoMes;

  return (
    <View>
      {/* ── Status Strip ── */}
      <Card style={styles.statusStrip}>
        <View style={styles.statusRow}>
          <View style={styles.statusItem}>
            <Ionicons name="bus-outline" size={14} color={colors.accent} />
            <Text style={styles.statusValue}>{stats.totalCaminhoes}</Text>
            <Text style={styles.statusLabel}>Frota</Text>
          </View>
          <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statusItem}>
            <Ionicons name="navigate-outline" size={14} color={colors.info} />
            <Text style={styles.statusValue}>{stats.activeTrips}</Text>
            <Text style={styles.statusLabel}>Ativas</Text>
          </View>
          <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
            <Text style={styles.statusValue}>{stats.completedTrips}</Text>
            <Text style={styles.statusLabel}>Concluídas</Text>
          </View>
          <View style={[styles.statusDivider, { backgroundColor: colors.border }]} />
          <View style={styles.statusItem}>
            <Ionicons name="flash-outline" size={14} color={colors.warning} />
            <Text style={styles.statusValue}>{formatNumber(stats.kmPerLiter, 1)}</Text>
            <Text style={styles.statusLabel}>km/L</Text>
          </View>
        </View>
      </Card>

      {/* ── Alert ── */}
      {hasMaintAlert && (
        <Pressable
          style={[styles.alertCard, { borderColor: colors.warning + '50', backgroundColor: colors.warning + '10' }]}
          onPress={() => router.push('/(app)/manutencoes')}
        >
          <Ionicons name="construct-outline" size={18} color={colors.warning} />
          <Text style={[styles.alertText, { color: colors.warning }]}>
            {stats.pendingMaintenance > 0 ? `${stats.pendingMaintenance} pendente${stats.pendingMaintenance > 1 ? 's' : ''}` : ''}
            {stats.pendingMaintenance > 0 && stats.inProgressMaintenance > 0 ? ' · ' : ''}
            {stats.inProgressMaintenance > 0 ? `${stats.inProgressMaintenance} em andamento` : ''}
          </Text>
          <Ionicons name="chevron-forward" size={16} color={colors.warning} />
        </Pressable>
      )}

      {/* ── Financeiro do Mes ── */}
      <Text style={styles.sectionLabel}>{stats.mesAtual}</Text>

      <Card style={styles.financeCard}>
        <View style={styles.financeRow}>
          <View style={styles.financeItem}>
            <Text style={[styles.financeLabel, { color: colors.textMuted }]}>Receita</Text>
            <Text style={[styles.financeValue, { color: colors.success }]}>{formatCurrency(stats.receitaMes)}</Text>
          </View>
          <View style={styles.financeItem}>
            <Text style={[styles.financeLabel, { color: colors.textMuted }]}>Gastos</Text>
            <Text style={[styles.financeValue, { color: colors.danger }]}>{formatCurrency(stats.gastoMes)}</Text>
          </View>
          <View style={styles.financeItem}>
            <Text style={[styles.financeLabel, { color: colors.textMuted }]}>Resultado</Text>
            <Text style={[styles.financeValue, { color: resultado >= 0 ? colors.success : colors.danger }]}>{formatCurrency(resultado)}</Text>
          </View>
        </View>
      </Card>

      {/* ── Quick Actions ── */}
      <Text style={styles.sectionLabel}>Acoes rapidas</Text>
      <View style={styles.quickActions}>
        <Pressable
          style={({ pressed }) => [styles.quickBtn, { backgroundColor: colors.accent + '15', borderColor: colors.accent + '30' }, pressed && styles.quickBtnPressed]}
          onPress={() => router.push('/(app)/viagens/new')}
        >
          <Ionicons name="map" size={22} color={colors.accent} />
          <Text style={[styles.quickBtnText, { color: colors.accent }]}>Nova Viagem</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickBtn, { backgroundColor: colors.info + '15', borderColor: colors.info + '30' }, pressed && styles.quickBtnPressed]}
          onPress={() => router.push('/(app)/abastecer/new')}
        >
          <Ionicons name="water" size={22} color={colors.info} />
          <Text style={[styles.quickBtnText, { color: colors.info }]}>Abastecer</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickBtn, { backgroundColor: colors.warning + '15', borderColor: colors.warning + '30' }, pressed && styles.quickBtnPressed]}
          onPress={() => router.push('/(app)/manutencoes/new')}
        >
          <Ionicons name="construct" size={22} color={colors.warning} />
          <Text style={[styles.quickBtnText, { color: colors.warning }]}>Manutenção</Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [styles.quickBtn, { backgroundColor: colors.success + '15', borderColor: colors.success + '30' }, pressed && styles.quickBtnPressed]}
          onPress={() => router.push('/(app)/frota')}
        >
          <Ionicons name="bus" size={22} color={colors.success} />
          <Text style={[styles.quickBtnText, { color: colors.success }]}>Frota</Text>
        </Pressable>
      </View>

      {/* ── KPIs ── */}
      <Text style={styles.sectionLabel}>Indicadores</Text>
      <View style={styles.statsRow}>
        <StatCard icon="trending-up-outline" iconColor={colors.success} value={formatCurrency(stats.totalFrete)} label="Receita total" />
        <StatCard icon="speedometer-outline" iconColor={colors.warning} value={`${formatNumber(stats.totalKm, 0)} km`} label="km total" />
      </View>
    </View>
  );
}

/* ───────────────────── STYLES ───────────────────── */

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

  // Section
  sectionLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },

  // Truck card
  truckCard: {
    marginBottom: spacing.sm,
  },
  truckHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  truckIconBox: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  truckInfo: {
    flex: 1,
  },
  truckPlaca: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: c.text,
    letterSpacing: 1,
  },
  truckModelo: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    marginTop: 2,
  },
  truckStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: c.border,
    paddingTop: spacing.sm,
  },
  truckStatItem: {
    alignItems: 'center',
  },
  truckStatValue: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: c.text,
  },
  truckStatLabel: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    marginTop: 2,
  },

  // Active trip card
  activeTripCard: {
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  activeTripBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  activeTripBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  tripPoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  tripPointText: {
    fontSize: fontSize.sm,
    color: c.text,
    fontWeight: '500',
    flex: 1,
  },
  tripProduct: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    marginBottom: spacing.sm,
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripFrete: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: c.text,
  },
  tripAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  tripActionText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },

  // Quick actions grid
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  quickBtn: {
    width: '48%',
    flexGrow: 1,
    flexBasis: '46%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    gap: spacing.sm,
  },
  quickBtnPressed: {
    opacity: 0.7,
  },
  quickBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },

  // Recent records
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
  },
  recentItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  recentInfo: {
    flex: 1,
  },
  recentLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: c.text,
  },
  recentDate: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    marginTop: 1,
  },
  recentValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: c.text,
  },

  // Status strip
  statusStrip: {
    marginBottom: spacing.sm,
    padding: spacing.sm,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
    gap: 2,
  },
  statusValue: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: c.text,
  },
  statusLabel: {
    fontSize: 10,
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statusDivider: {
    width: 1,
    height: 28,
  },

  // Alert card (admin)
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

  // Finance card
  financeCard: {
    marginBottom: spacing.sm,
    padding: spacing.md,
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  financeItem: {
    alignItems: 'center',
    flex: 1,
  },
  financeLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  financeValue: {
    fontSize: fontSize.base,
    fontWeight: '700',
  },

  // Empty state
  emptyIcon: {
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: c.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    lineHeight: 20,
    textAlign: 'center',
  },
});

import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
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
import { Card } from '../../src/components/Card';
import { StatCard } from '../../src/components/StatCard';
import { caminhoesApi } from '../../src/api/caminhoes';
import { abastecimentosApi } from '../../src/api/abastecimentos';
import { manutencoesApi } from '../../src/api/manutencoes';
import { viagensApi } from '../../src/api/viagens';
import { motoristasApi } from '../../src/api/motoristas';
import { colors, fontSize, radius, spacing } from '../../src/lib/theme';
import {
  formatCurrency,
  formatNumber,
} from '../../src/lib/format';
import type { Caminhao } from '../../src/api/types';

type Periodo = '7d' | '30d' | '90d' | '1a' | 'tudo';

const PERIODOS: { label: string; value: Periodo }[] = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
  { label: '1 ano', value: '1a' },
  { label: 'Tudo', value: 'tudo' },
];

function getDateFrom(periodo: Periodo): Date | null {
  if (periodo === 'tudo') return null;
  const d = new Date();
  if (periodo === '7d') d.setDate(d.getDate() - 7);
  else if (periodo === '30d') d.setDate(d.getDate() - 30);
  else if (periodo === '90d') d.setDate(d.getDate() - 90);
  else if (periodo === '1a') d.setFullYear(d.getFullYear() - 1);
  return d;
}

export default function RelatoriosScreen() {
  const [periodo, setPeriodo] = useState<Periodo>('tudo');
  const caminhoesQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });
  const fuelQuery = useQuery({
    queryKey: ['abastecimentos'],
    queryFn: () => abastecimentosApi.list(),
  });
  const maintQuery = useQuery({
    queryKey: ['manutencoes'],
    queryFn: () => manutencoesApi.list(),
  });
  const tripsQuery = useQuery({
    queryKey: ['viagens'],
    queryFn: () => viagensApi.list(),
  });
  const driversQuery = useQuery({
    queryKey: ['motoristas'],
    queryFn: () => motoristasApi.list(),
  });

  const isLoading =
    caminhoesQuery.isLoading ||
    fuelQuery.isLoading ||
    maintQuery.isLoading ||
    tripsQuery.isLoading ||
    driversQuery.isLoading;

  const isRefetching =
    caminhoesQuery.isRefetching ||
    fuelQuery.isRefetching ||
    maintQuery.isRefetching ||
    tripsQuery.isRefetching ||
    driversQuery.isRefetching;

  const handleRefresh = () => {
    caminhoesQuery.refetch();
    fuelQuery.refetch();
    maintQuery.refetch();
    tripsQuery.refetch();
    driversQuery.refetch();
  };

  // KPIs gerais
  const kpis = useMemo(() => {
    const caminhoes = caminhoesQuery.data ?? [];
    const drivers = driversQuery.data ?? [];
    const dateFrom = getDateFrom(periodo);

    const inRange = (dateStr?: string | null) => {
      if (!dateFrom || !dateStr) return true;
      return new Date(dateStr) >= dateFrom;
    };

    const fuel = (fuelQuery.data ?? []).filter((r) => inRange(r.created_at));
    const maint = (maintQuery.data ?? []).filter((r) => inRange(r.data_manutencao));
    const trips = (tripsQuery.data ?? []).filter((t) => inRange(t.data_viagem ?? t.created_at));

    const totalCaminhoes = caminhoes.length;
    const totalMotoristas = drivers.length;

    const totalGastoComb = fuel.reduce(
      (s, r) => s + (Number(r.valor_total) || 0),
      0,
    );
    const totalLitros = fuel.reduce(
      (s, r) => s + (Number(r.litros) || 0),
      0,
    );
    const totalGastoManut = maint.reduce(
      (s, r) => s + (Number(r.valor_total) || 0),
      0,
    );
    const totalGastoGeral = totalGastoComb + totalGastoManut;

    const viagensFinalizadas = trips.filter((t) => t.status === 'finalizada');
    const viagensAtivas = trips.filter((t) => t.status === 'cadastrada');
    const totalFrete = viagensFinalizadas.reduce(
      (s, t) => s + (Number(t.valor_total_frete) || 0),
      0,
    );
    const totalKm = trips.reduce(
      (s, t) => s + (Number(t.distancia_km) || 0),
      0,
    );
    const kmPerLiter = totalLitros > 0 ? totalKm / totalLitros : 0;
    const custoPerKm = totalKm > 0 ? totalGastoGeral / totalKm : 0;

    // Preço médio por litro
    const precoMedioLitro = totalLitros > 0 ? totalGastoComb / totalLitros : 0;

    // Top 3 caminhões por gasto de combustível
    const gastoPerTruck: Record<number, { placa: string; gasto: number }> = {};
    for (const r of fuel) {
      const truck = caminhoes.find((c) => c.id === r.caminhao_id);
      if (!truck) continue;
      if (!gastoPerTruck[truck.id]) {
        gastoPerTruck[truck.id] = { placa: truck.placa, gasto: 0 };
      }
      gastoPerTruck[truck.id].gasto += Number(r.valor_total) || 0;
    }
    const topTrucks = Object.values(gastoPerTruck)
      .sort((a, b) => b.gasto - a.gasto)
      .slice(0, 5);

    return {
      totalCaminhoes,
      totalMotoristas,
      totalGastoComb,
      totalGastoManut,
      totalGastoGeral,
      totalLitros,
      totalFrete,
      totalKm,
      kmPerLiter,
      custoPerKm,
      precoMedioLitro,
      viagensAtivas: viagensAtivas.length,
      viagensFinalizadas: viagensFinalizadas.length,
      topTrucks,
    };
  }, [
    caminhoesQuery.data,
    fuelQuery.data,
    maintQuery.data,
    tripsQuery.data,
    driversQuery.data,
    periodo,
  ]);

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
        <Text style={styles.title}>Relatórios</Text>

        <View style={styles.periodoRow}>
          {PERIODOS.map((p) => (
            <Pressable
              key={p.value}
              onPress={() => setPeriodo(p.value)}
              style={[styles.periodoChip, periodo === p.value && styles.periodoChipActive]}
            >
              <Text style={[styles.periodoText, periodo === p.value && styles.periodoTextActive]}>
                {p.label}
              </Text>
            </Pressable>
          ))}
        </View>

        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={colors.accent} />
          </View>
        ) : (
          <>
            {/* Frota */}
            <SectionLabel icon="bus-outline" label="Frota" />
            <View style={styles.statsRow}>
              <StatCard
                icon="bus-outline"
                iconColor={colors.accent}
                value={String(kpis.totalCaminhoes)}
                label="Caminhões"
              />
              <StatCard
                icon="people-outline"
                iconColor={colors.info}
                value={String(kpis.totalMotoristas)}
                label="Motoristas"
              />
            </View>

            {/* Viagens */}
            <SectionLabel icon="map-outline" label="Viagens" />
            <View style={styles.statsRow}>
              <StatCard
                icon="navigate-outline"
                iconColor={colors.info}
                value={String(kpis.viagensAtivas)}
                label="Ativas"
              />
              <StatCard
                icon="checkmark-circle-outline"
                iconColor={colors.success}
                value={String(kpis.viagensFinalizadas)}
                label="Finalizadas"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon="cash-outline"
                iconColor={colors.success}
                value={formatCurrency(kpis.totalFrete)}
                label="Receita frete"
              />
              <StatCard
                icon="speedometer-outline"
                iconColor={colors.warning}
                value={`${formatNumber(kpis.totalKm, 0)} km`}
                label="Km total"
              />
            </View>

            {/* Financeiro */}
            <SectionLabel icon="wallet-outline" label="Financeiro" />
            <View style={styles.statsRow}>
              <StatCard
                icon="water-outline"
                iconColor={colors.warning}
                value={formatCurrency(kpis.totalGastoComb)}
                label="Combustível"
              />
              <StatCard
                icon="construct-outline"
                iconColor={colors.danger}
                value={formatCurrency(kpis.totalGastoManut)}
                label="Manutenção"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon="trending-down-outline"
                iconColor={colors.danger}
                value={formatCurrency(kpis.totalGastoGeral)}
                label="Gasto total"
              />
              <StatCard
                icon="trending-up-outline"
                iconColor={
                  kpis.totalFrete - kpis.totalGastoGeral >= 0
                    ? colors.success
                    : colors.danger
                }
                value={formatCurrency(kpis.totalFrete - kpis.totalGastoGeral)}
                label="Lucro bruto"
              />
            </View>

            {/* Eficiência */}
            <SectionLabel icon="analytics-outline" label="Eficiência" />
            <View style={styles.statsRow}>
              <StatCard
                icon="flash-outline"
                iconColor={colors.accent}
                value={formatNumber(kpis.kmPerLiter, 2)}
                label="km/litro"
              />
              <StatCard
                icon="pricetag-outline"
                iconColor={colors.warning}
                value={formatCurrency(kpis.precoMedioLitro)}
                label="R$/litro médio"
              />
            </View>
            <View style={styles.statsRow}>
              <StatCard
                icon="calculator-outline"
                iconColor={colors.info}
                value={formatCurrency(kpis.custoPerKm)}
                label="R$/km"
              />
              <StatCard
                icon="flame-outline"
                iconColor={colors.warning}
                value={`${formatNumber(kpis.totalLitros, 0)}L`}
                label="Total litros"
              />
            </View>

            {/* Ranking Caminhões */}
            {kpis.topTrucks.length > 0 && (
              <>
                <SectionLabel
                  icon="trophy-outline"
                  label="Top gasto combustível"
                />
                <Card style={styles.rankingCard}>
                  {kpis.topTrucks.map((t, i) => (
                    <View
                      key={t.placa}
                      style={[
                        styles.rankRow,
                        i < kpis.topTrucks.length - 1 && styles.rankBorder,
                      ]}
                    >
                      <View style={styles.rankLeft}>
                        <Text style={styles.rankPos}>{i + 1}.</Text>
                        <Text style={styles.rankPlaca}>{t.placa}</Text>
                      </View>
                      <Text style={styles.rankValue}>
                        {formatCurrency(t.gasto)}
                      </Text>
                    </View>
                  ))}
                </Card>
              </>
            )}

            {/* Footer info */}
            <Card style={styles.footerCard}>
              <View style={styles.footerRow}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={colors.accent}
                />
                <Text style={styles.footerText}>
                  Para relatórios detalhados, exportações PDF/Excel e gráficos
                  completos, acesse o painel web.
                </Text>
              </View>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionLabel({
  icon,
  label,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
}) {
  return (
    <View style={styles.sectionLabel}>
      <Ionicons name={icon} size={16} color={colors.accent} />
      <Text style={styles.sectionLabelText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  periodoRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    flexWrap: 'wrap',
  },
  periodoChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgCard,
  },
  periodoChipActive: {
    borderColor: colors.accent,
    backgroundColor: colors.accent + '20',
  },
  periodoText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
  },
  periodoTextActive: {
    color: colors.accent,
    fontWeight: '700',
  },
  loading: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  sectionLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  sectionLabelText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  rankingCard: {
    padding: 0,
    overflow: 'hidden',
  },
  rankRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
  },
  rankBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rankLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  rankPos: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.textMuted,
    width: 20,
  },
  rankPlaca: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: 1,
  },
  rankValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.warning,
  },
  footerCard: {
    marginTop: spacing.lg,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  footerText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 20,
  },
});

import { useMemo } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/Card';
import { StatCard } from '../../../src/components/StatCard';
import { caminhoesApi } from '../../../src/api/caminhoes';
import { abastecimentosApi } from '../../../src/api/abastecimentos';
import { manutencoesApi } from '../../../src/api/manutencoes';
import { viagensApi } from '../../../src/api/viagens';
import { colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from '../../../src/lib/format';

export default function TruckDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const truckId = Number(id);

  const truckQuery = useQuery({
    queryKey: ['caminhoes', truckId],
    queryFn: () => caminhoesApi.getById(truckId),
    enabled: !!truckId,
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

  const truck = truckQuery.data;
  const isLoading =
    truckQuery.isLoading ||
    fuelQuery.isLoading ||
    maintQuery.isLoading ||
    tripsQuery.isLoading;

  const fuelRecords = useMemo(() => {
    if (!fuelQuery.data) return [];
    return fuelQuery.data
      .filter((r) => r.caminhao_id === truckId)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 10);
  }, [fuelQuery.data, truckId]);

  const maintRecords = useMemo(() => {
    if (!maintQuery.data) return [];
    return maintQuery.data
      .filter((r) => r.caminhao_id === truckId)
      .sort(
        (a, b) =>
          new Date(b.data_manutencao || b.created_at || '').getTime() -
          new Date(a.data_manutencao || a.created_at || '').getTime(),
      )
      .slice(0, 10);
  }, [maintQuery.data, truckId]);

  const tripRecords = useMemo(() => {
    if (!tripsQuery.data) return [];
    return tripsQuery.data
      .filter((t) => t.caminhao_id === truckId)
      .sort(
        (a, b) =>
          new Date(b.created_at || '').getTime() -
          new Date(a.created_at || '').getTime(),
      );
  }, [tripsQuery.data, truckId]);

  const stats = useMemo(() => {
    const totalLitros = fuelRecords.reduce(
      (s, r) => s + (Number(r.litros) || 0),
      0,
    );
    const totalGastoComb = fuelRecords.reduce(
      (s, r) => s + (Number(r.valor_total) || 0),
      0,
    );
    const totalGastoManut = maintRecords.reduce(
      (s, r) => s + (Number(r.valor_total) || 0),
      0,
    );
    const totalViagens = tripRecords.length;
    const viagensAtivas = tripRecords.filter(
      (t) => t.status === 'cadastrada',
    ).length;

    return {
      totalLitros,
      totalGastoComb,
      totalGastoManut,
      totalViagens,
      viagensAtivas,
    };
  }, [fuelRecords, maintRecords, tripRecords]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!truck) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <Text style={styles.errorText}>Caminhão não encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header with back */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={22} color={colors.text} />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.placa}>{truck.placa}</Text>
            <Text style={styles.modelo}>
              {truck.marca ? `${truck.marca} ` : ''}
              {truck.modelo}
              {truck.ano_fabricacao ? ` • ${truck.ano_fabricacao}` : ''}
            </Text>
          </View>
        </View>

        {/* Info card */}
        <Card style={styles.infoCard}>
          <InfoRow
            icon="speedometer-outline"
            label="Km Atual"
            value={truck.km_atual ? `${formatNumber(truck.km_atual, 0)} km` : 'N/I'}
          />
          <InfoRow
            icon="water-outline"
            label="Combustível"
            value={truck.tipo_combustivel || 'N/I'}
          />
          {truck.capacidade_carga ? (
            <InfoRow
              icon="cube-outline"
              label="Capacidade"
              value={`${formatNumber(truck.capacidade_carga, 0)} ton`}
            />
          ) : null}
          {truck.numero_chassi ? (
            <InfoRow icon="barcode-outline" label="Chassi" value={truck.numero_chassi} />
          ) : null}
        </Card>

        {/* Stats */}
        <View style={styles.statsRow}>
          <StatCard
            icon="water-outline"
            iconColor={colors.warning}
            value={formatCurrency(stats.totalGastoComb)}
            label="Combustível"
          />
          <StatCard
            icon="construct-outline"
            iconColor={colors.danger}
            value={formatCurrency(stats.totalGastoManut)}
            label="Manutenção"
          />
        </View>
        <View style={styles.statsRow}>
          <StatCard
            icon="map-outline"
            iconColor={colors.info}
            value={String(stats.totalViagens)}
            label="Viagens"
          />
          <StatCard
            icon="flame-outline"
            iconColor={colors.accent}
            value={`${formatNumber(stats.totalLitros, 0)}L`}
            label="Total litros"
          />
        </View>

        {/* Últimos Abastecimentos */}
        <SectionHeader
          icon="water-outline"
          iconColor={colors.warning}
          title={`Abastecimentos (${fuelRecords.length})`}
        />
        {fuelRecords.length === 0 ? (
          <EmptySection text="Nenhum abastecimento registrado" />
        ) : (
          fuelRecords.map((r) => (
            <Card key={r.id} style={styles.recordCard}>
              <View style={styles.recordRow}>
                <View>
                  <Text style={styles.recordTitle}>
                    {formatNumber(r.litros, 1)} L — {r.posto || 'Sem posto'}
                  </Text>
                  <Text style={styles.recordSub}>
                    {formatDate(r.created_at)}
                    {r.km_registro
                      ? ` • ${formatNumber(r.km_registro, 0)} km`
                      : ''}
                  </Text>
                </View>
                <Text style={styles.recordValue}>
                  {formatCurrency(r.valor_total)}
                </Text>
              </View>
            </Card>
          ))
        )}

        {/* Últimas Manutenções */}
        <SectionHeader
          icon="construct-outline"
          iconColor={colors.danger}
          title={`Manutenções (${maintRecords.length})`}
        />
        {maintRecords.length === 0 ? (
          <EmptySection text="Nenhuma manutenção registrada" />
        ) : (
          maintRecords.map((r) => (
            <Card key={r.id} style={styles.recordCard}>
              <View style={styles.recordRow}>
                <View>
                  <Text style={styles.recordTitle}>{r.tipo_manutencao}</Text>
                  <Text style={styles.recordSub}>
                    {formatDate(r.data_manutencao)}
                    {r.oficina ? ` • ${r.oficina}` : ''}
                  </Text>
                </View>
                <Text style={[styles.recordValue, { color: colors.danger }]}>
                  {formatCurrency(r.valor_total)}
                </Text>
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function SectionHeader({
  icon,
  iconColor,
  title,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  title: string;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={18} color={iconColor} />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );
}

function EmptySection({ text }: { text: string }) {
  return (
    <Card style={styles.recordCard}>
      <Text style={styles.emptyText}>{text}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.base,
    color: colors.danger,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.bgCard,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  headerInfo: { flex: 1 },
  placa: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 1,
  },
  modelo: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  infoCard: {
    padding: 0,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    flex: 1,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: fontSize.base,
    fontWeight: '600',
    color: colors.text,
  },
  recordCard: {
    padding: spacing.md,
    marginBottom: spacing.xs,
  },
  recordRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordTitle: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  recordSub: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  recordValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.warning,
  },
  emptyText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

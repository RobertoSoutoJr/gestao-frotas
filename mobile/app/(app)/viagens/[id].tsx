import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../../src/components/Card';
import { Button } from '../../../src/components/Button';
import { Input } from '../../../src/components/Input';
import { Picker, PickerOption } from '../../../src/components/Picker';
import { viagensApi, FinalizeViagemPayload } from '../../../src/api/viagens';
import { colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { formatCurrency, formatDate } from '../../../src/lib/format';

const PAYMENT_OPTIONS: PickerOption[] = [
  { label: 'Dinheiro', value: 'dinheiro' },
  { label: 'PIX', value: 'pix' },
  { label: 'Transferência', value: 'transferencia' },
  { label: 'Boleto', value: 'boleto' },
  { label: 'Cheque', value: 'cheque' },
  { label: 'Cartão', value: 'cartao' },
  { label: 'A prazo', value: 'a_prazo' },
];

export default function ViagemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['viagens', tripId],
    queryFn: () => viagensApi.getById(tripId),
    enabled: !!tripId,
  });

  const trip = query.data;
  const isActive = trip?.status === 'cadastrada';

  // GPS capture
  const [capturingGps, setCapturingGps] = useState<'origem' | 'destino' | null>(null);

  const locationMutation = useMutation({
    mutationFn: ({ field, lat, lng }: { field: 'origem' | 'destino'; lat: number; lng: number }) =>
      viagensApi.updateLocation(tripId, { field, lat, lng }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      Alert.alert('GPS salvo', 'Localização registrada com sucesso.');
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.message || 'Falha ao salvar GPS');
    },
  });

  const captureGps = async (field: 'origem' | 'destino') => {
    setCapturingGps(field);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Habilite a localização nas configurações.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      locationMutation.mutate({
        field,
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    } catch {
      Alert.alert('Erro', 'Não foi possível obter a localização.');
    } finally {
      setCapturingGps(null);
    }
  };

  // Finalize form
  const [showFinalize, setShowFinalize] = useState(false);
  const [finalForm, setFinalForm] = useState({
    forma_pagamento: '' as string,
    custo_combustivel: '',
    custo_pedagio: '',
    custo_manutencao: '',
    custo_outros: '',
  });

  const finalizeMutation = useMutation({
    mutationFn: (data: FinalizeViagemPayload) =>
      viagensApi.finalize(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      Alert.alert('Viagem finalizada', 'Custos e pagamento registrados.');
      setShowFinalize(false);
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.message || 'Falha ao finalizar viagem');
    },
  });

  const handleFinalize = () => {
    if (!finalForm.forma_pagamento) {
      Alert.alert('Obrigatório', 'Selecione a forma de pagamento.');
      return;
    }
    finalizeMutation.mutate({
      forma_pagamento: finalForm.forma_pagamento,
      custo_combustivel: Number(finalForm.custo_combustivel) || 0,
      custo_pedagio: Number(finalForm.custo_pedagio) || 0,
      custo_manutencao: Number(finalForm.custo_manutencao) || 0,
      custo_outros: Number(finalForm.custo_outros) || 0,
    });
  };

  if (query.isLoading || !trip) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  const custoTotal =
    (Number(trip.custo_combustivel) || 0) +
    (Number(trip.custo_pedagio) || 0) +
    (Number(trip.custo_manutencao) || 0) +
    (Number(trip.custo_outros) || 0);
  const lucro = (Number(trip.valor_total_frete) || 0) - custoTotal;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <Button
            title="Voltar"
            variant="ghost"
            onPress={() => router.back()}
            style={styles.backBtn}
          />
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: isActive
                  ? colors.warning + '25'
                  : colors.success + '25',
              },
            ]}
          >
            <Text
              style={{
                color: isActive ? colors.warning : colors.success,
                fontSize: fontSize.sm,
                fontWeight: '600',
              }}
            >
              {isActive ? 'Ativa' : 'Finalizada'}
            </Text>
          </View>
        </View>

        {/* Trip info */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <InfoRow label="Produto" value={trip.produto || '-'} />
          <InfoRow label="Sacas" value={trip.quantidade_sacas ? String(trip.quantidade_sacas) : '-'} />
          <InfoRow label="Frete/saca" value={trip.preco_frete_saca ? `R$ ${Number(trip.preco_frete_saca).toFixed(2)}` : '-'} />
          <InfoRow label="Frete total" value={formatCurrency(trip.valor_total_frete)} accent />
          <InfoRow label="Distância" value={trip.distancia_km ? `${Number(trip.distancia_km).toLocaleString('pt-BR')} km` : '-'} />
          <InfoRow label="Data" value={formatDate(trip.data_viagem || trip.created_at)} />
          {trip.forma_pagamento && (
            <InfoRow label="Pagamento" value={trip.forma_pagamento} />
          )}
        </Card>

        {/* GPS section */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Localização GPS</Text>
          <GpsRow
            label="Origem"
            lat={trip.lat_origem}
            lng={trip.lng_origem}
            capturing={capturingGps === 'origem'}
            onCapture={isActive ? () => captureGps('origem') : undefined}
          />
          <GpsRow
            label="Destino"
            lat={trip.lat_destino}
            lng={trip.lng_destino}
            capturing={capturingGps === 'destino'}
            onCapture={isActive ? () => captureGps('destino') : undefined}
          />
        </Card>

        {/* Costs */}
        {custoTotal > 0 && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Custos</Text>
            {Number(trip.custo_combustivel) > 0 && (
              <InfoRow label="Combustível" value={formatCurrency(trip.custo_combustivel)} />
            )}
            {Number(trip.custo_pedagio) > 0 && (
              <InfoRow label="Pedágio" value={formatCurrency(trip.custo_pedagio)} />
            )}
            {Number(trip.custo_manutencao) > 0 && (
              <InfoRow label="Manutenção" value={formatCurrency(trip.custo_manutencao)} />
            )}
            {Number(trip.custo_outros) > 0 && (
              <InfoRow label="Outros" value={formatCurrency(trip.custo_outros)} />
            )}
            <View style={styles.divider} />
            <InfoRow label="Total custos" value={formatCurrency(custoTotal)} />
            <InfoRow
              label="Lucro"
              value={formatCurrency(lucro)}
              accent
              color={lucro >= 0 ? colors.success : colors.danger}
            />
          </Card>
        )}

        {/* Finalize section */}
        {isActive && !showFinalize && (
          <Button
            title="Finalizar Viagem"
            onPress={() => setShowFinalize(true)}
            style={styles.finalizeBtn}
          />
        )}

        {isActive && showFinalize && (
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>Finalizar Viagem</Text>

            <Picker
              label="Forma de pagamento *"
              placeholder="Selecione"
              options={PAYMENT_OPTIONS}
              value={finalForm.forma_pagamento || null}
              onSelect={(v) =>
                setFinalForm((p) => ({ ...p, forma_pagamento: v as string }))
              }
            />

            <Input
              label="Custo combustível (R$)"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={finalForm.custo_combustivel}
              onChangeText={(v) =>
                setFinalForm((p) => ({
                  ...p,
                  custo_combustivel: v.replace(/[^0-9.,]/g, '').replace(',', '.'),
                }))
              }
            />
            <Input
              label="Custo pedágio (R$)"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={finalForm.custo_pedagio}
              onChangeText={(v) =>
                setFinalForm((p) => ({
                  ...p,
                  custo_pedagio: v.replace(/[^0-9.,]/g, '').replace(',', '.'),
                }))
              }
            />
            <Input
              label="Custo manutenção (R$)"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={finalForm.custo_manutencao}
              onChangeText={(v) =>
                setFinalForm((p) => ({
                  ...p,
                  custo_manutencao: v.replace(/[^0-9.,]/g, '').replace(',', '.'),
                }))
              }
            />
            <Input
              label="Outros custos (R$)"
              placeholder="0.00"
              keyboardType="decimal-pad"
              value={finalForm.custo_outros}
              onChangeText={(v) =>
                setFinalForm((p) => ({
                  ...p,
                  custo_outros: v.replace(/[^0-9.,]/g, '').replace(',', '.'),
                }))
              }
            />

            <View style={styles.finalizeActions}>
              <Button
                title="Cancelar"
                variant="secondary"
                onPress={() => setShowFinalize(false)}
                style={styles.flexBtn}
              />
              <Button
                title="Confirmar"
                onPress={handleFinalize}
                loading={finalizeMutation.isPending}
                style={styles.flexBtn}
              />
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  label,
  value,
  accent,
  color,
}: {
  label: string;
  value: string;
  accent?: boolean;
  color?: string;
}) {
  return (
    <View style={infoStyles.row}>
      <Text style={infoStyles.label}>{label}</Text>
      <Text
        style={[
          infoStyles.value,
          accent && { fontWeight: '700' },
          color ? { color } : null,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function GpsRow({
  label,
  lat,
  lng,
  capturing,
  onCapture,
}: {
  label: string;
  lat?: number | null;
  lng?: number | null;
  capturing: boolean;
  onCapture?: () => void;
}) {
  const hasCoords = lat != null && lng != null;
  return (
    <View style={gpsStyles.row}>
      <View style={gpsStyles.info}>
        <Ionicons
          name={hasCoords ? 'location' : 'location-outline'}
          size={18}
          color={hasCoords ? colors.success : colors.textMuted}
        />
        <View>
          <Text style={gpsStyles.label}>{label}</Text>
          <Text style={gpsStyles.coords}>
            {hasCoords
              ? `${lat!.toFixed(5)}, ${lng!.toFixed(5)}`
              : 'Não registrado'}
          </Text>
        </View>
      </View>
      {onCapture && (
        <Button
          title={capturing ? 'Capturando...' : hasCoords ? 'Atualizar' : 'Capturar'}
          variant="secondary"
          onPress={onCapture}
          loading={capturing}
          style={gpsStyles.btn}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  backBtn: { paddingHorizontal: 0 },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  finalizeBtn: {
    marginTop: spacing.sm,
  },
  finalizeActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  flexBtn: { flex: 1 },
});

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  label: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  value: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '500',
  },
});

const gpsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  info: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  coords: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
  },
  btn: {
    height: 36,
    paddingHorizontal: spacing.md,
  },
});

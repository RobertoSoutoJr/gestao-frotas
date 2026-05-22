import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { KeyboardAwareScroll } from '../../../src/components/KeyboardAwareScroll';
import { Card } from '../../../src/components/Card';
import { useToast } from '../../../src/contexts/ToastContext';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';
import { viagensApi } from '../../../src/api/viagens';
import { type Colors, fontSize, radius, spacing } from '../../../src/lib/theme';

export default function EditViagemScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const tripId = Number(id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const [form, setForm] = useState({
    produto: '',
    quantidade_sacas: '',
    preco_frete_saca: '',
    valor_total_frete: '',
    distancia_km: '',
    observacoes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  const recordQuery = useQuery({
    queryKey: ['viagens', tripId],
    queryFn: () => viagensApi.getById(tripId),
    enabled: !!tripId,
  });

  useEffect(() => {
    if (recordQuery.data && !loaded) {
      const t = recordQuery.data;
      setForm({
        produto: t.produto || '',
        quantidade_sacas: t.quantidade_sacas ? String(t.quantidade_sacas) : '',
        preco_frete_saca: t.preco_frete_saca ? String(t.preco_frete_saca) : '',
        valor_total_frete: t.valor_total_frete
          ? String(t.valor_total_frete)
          : '',
        distancia_km: t.distancia_km ? String(t.distancia_km) : '',
        observacoes: t.observacoes || '',
      });
      setLoaded(true);
    }
  }, [recordQuery.data, loaded]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof viagensApi.update>[1]) =>
      viagensApi.update(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      showToast('Viagem atualizada', 'success');
      router.back();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Erro ao atualizar', 'error');
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.produto) e.produto = 'Informe o produto';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      produto: form.produto,
      quantidade_sacas: Number(form.quantidade_sacas) || undefined,
      preco_frete_saca: Number(form.preco_frete_saca) || undefined,
      valor_total_frete: Number(form.valor_total_frete) || undefined,
      distancia_km: Number(form.distancia_km) || undefined,
      observacoes: form.observacoes || undefined,
    });
  };

  // Auto-calculate frete total
  const sacas = Number(form.quantidade_sacas) || 0;
  const precoSaca = Number(form.preco_frete_saca) || 0;
  const freteCalculado = sacas > 0 && precoSaca > 0 ? sacas * precoSaca : 0;

  const handleAutoCalc = () => {
    if (freteCalculado > 0) {
      setForm((p) => ({
        ...p,
        valor_total_frete: freteCalculado.toFixed(2),
      }));
    }
  };

  if (recordQuery.isLoading) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAwareScroll
        contentContainerStyle={styles.scroll}
        containerStyle={styles.flex}
      >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Ionicons name="create" size={28} color={colors.accent} />
            <Text style={styles.title}>Editar Viagem</Text>
          </View>

          <Input
            label="Produto *"
            placeholder="Ex: Milho, Soja, Sorgo"
            value={form.produto}
            onChangeText={(v) => {
              setForm((p) => ({ ...p, produto: v }));
              setErrors((p) => ({ ...p, produto: '' }));
            }}
            error={errors.produto}
          />

          <Input
            label="Quantidade de sacas"
            placeholder="Ex: 500"
            keyboardType="numeric"
            value={form.quantidade_sacas}
            onChangeText={(v) =>
              setForm((p) => ({
                ...p,
                quantidade_sacas: v.replace(/[^0-9]/g, ''),
              }))
            }
          />

          <Input
            label="Preço frete/saca (R$)"
            placeholder="Ex: 8.50"
            keyboardType="decimal-pad"
            value={form.preco_frete_saca}
            onChangeText={(v) =>
              setForm((p) => ({
                ...p,
                preco_frete_saca: v
                  .replace(/[^0-9.,]/g, '')
                  .replace(',', '.'),
              }))
            }
          />

          {freteCalculado > 0 && (
            <Pressable onPress={handleAutoCalc}>
              <Card style={styles.calcCard}>
                <View style={styles.calcRow}>
                  <Text style={styles.calcLabel}>
                    {sacas} sacas × R$ {precoSaca.toFixed(2)} =
                  </Text>
                  <Text style={styles.calcValue}>
                    R$ {freteCalculado.toFixed(2)}
                  </Text>
                </View>
                <Text style={styles.calcHint}>
                  Toque para aplicar ao frete total
                </Text>
              </Card>
            </Pressable>
          )}

          <Input
            label="Valor total frete (R$)"
            placeholder="Ex: 4250.00"
            keyboardType="decimal-pad"
            value={form.valor_total_frete}
            onChangeText={(v) =>
              setForm((p) => ({
                ...p,
                valor_total_frete: v
                  .replace(/[^0-9.,]/g, '')
                  .replace(',', '.'),
              }))
            }
          />

          <Input
            label="Distância (km)"
            placeholder="Ex: 350"
            keyboardType="numeric"
            value={form.distancia_km}
            onChangeText={(v) =>
              setForm((p) => ({
                ...p,
                distancia_km: v.replace(/[^0-9]/g, ''),
              }))
            }
          />

          <Input
            label="Observações"
            placeholder="Notas adicionais sobre a viagem"
            multiline
            numberOfLines={3}
            style={styles.multiline}
            value={form.observacoes}
            onChangeText={(v) => setForm((p) => ({ ...p, observacoes: v }))}
          />

          <Button
            title={mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSubmit}
            loading={mutation.isPending}
            disabled={mutation.isPending}
            style={styles.submitBtn}
          />
      </KeyboardAwareScroll>
    </SafeAreaView>
  );
}

const createStyles = (c: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  flex: { flex: 1 },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
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
  },
  calcCard: {
    marginBottom: spacing.md,
    borderColor: c.accent + '40',
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  calcLabel: {
    fontSize: fontSize.sm,
    color: c.textMuted,
  },
  calcValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: c.accent,
  },
  calcHint: {
    fontSize: fontSize.xs,
    color: c.accent,
    marginTop: spacing.xs,
    opacity: 0.7,
  },
  multiline: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

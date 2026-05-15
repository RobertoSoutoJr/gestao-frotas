import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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
import { Picker, PickerOption } from '../../../src/components/Picker';
import { Card } from '../../../src/components/Card';
import { useToast } from '../../../src/contexts/ToastContext';
import { caminhoesApi } from '../../../src/api/caminhoes';
import { abastecimentosApi } from '../../../src/api/abastecimentos';
import { colors, fontSize, radius, spacing } from '../../../src/lib/theme';

export default function EditAbastecimentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = Number(id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [form, setForm] = useState({
    caminhao_id: null as number | null,
    litros: '',
    valor_total: '',
    km_registro: '',
    posto: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  const recordQuery = useQuery({
    queryKey: ['abastecimentos', recordId],
    queryFn: () => abastecimentosApi.getById(recordId),
    enabled: !!recordId,
  });

  const caminhoesQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });

  // Populate form when data loads
  useEffect(() => {
    if (recordQuery.data && !loaded) {
      const r = recordQuery.data;
      setForm({
        caminhao_id: r.caminhao_id,
        litros: String(r.litros),
        valor_total: String(r.valor_total),
        km_registro: r.km_registro ? String(r.km_registro) : '',
        posto: r.postos?.nome || r.posto || '',
      });
      setLoaded(true);
    }
  }, [recordQuery.data, loaded]);

  const caminhaoOptions: PickerOption[] = (caminhoesQuery.data ?? []).map(
    (c) => ({
      label: `${c.placa} — ${c.modelo}`,
      value: c.id,
    }),
  );

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof abastecimentosApi.update>[1]) =>
      abastecimentosApi.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      showToast('Abastecimento atualizado', 'success');
      router.back();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Erro ao atualizar', 'error');
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.caminhao_id) e.caminhao_id = 'Selecione um caminhão';
    if (!form.litros || Number(form.litros) <= 0) e.litros = 'Litros inválido';
    if (!form.valor_total || Number(form.valor_total) <= 0)
      e.valor_total = 'Valor inválido';
    if (!form.km_registro || Number(form.km_registro) < 0)
      e.km_registro = 'KM inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      caminhao_id: form.caminhao_id!,
      litros: Number(form.litros),
      valor_total: Number(form.valor_total),
      km_registro: Number(form.km_registro),
      posto: form.posto || undefined,
    });
  };

  const litrosNum = Number(form.litros) || 0;
  const valorNum = Number(form.valor_total) || 0;
  const precoLitro = litrosNum > 0 && valorNum > 0 ? valorNum / litrosNum : 0;

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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Ionicons name="create" size={28} color={colors.accent} />
            <Text style={styles.title}>Editar Abastecimento</Text>
          </View>

          <Picker
            label="Caminhão *"
            placeholder="Selecione o caminhão"
            options={caminhaoOptions}
            value={form.caminhao_id}
            onSelect={(v) => {
              setForm((p) => ({ ...p, caminhao_id: v as number }));
              setErrors((p) => ({ ...p, caminhao_id: '' }));
            }}
            error={errors.caminhao_id}
          />

          <Input
            label="KM atual *"
            placeholder="Ex: 150000"
            keyboardType="numeric"
            value={form.km_registro}
            onChangeText={(v) => {
              setForm((p) => ({ ...p, km_registro: v.replace(/[^0-9]/g, '') }));
              setErrors((p) => ({ ...p, km_registro: '' }));
            }}
            error={errors.km_registro}
          />

          <Input
            label="Litros *"
            placeholder="Ex: 200"
            keyboardType="decimal-pad"
            value={form.litros}
            onChangeText={(v) => {
              setForm((p) => ({
                ...p,
                litros: v.replace(/[^0-9.,]/g, '').replace(',', '.'),
              }));
              setErrors((p) => ({ ...p, litros: '' }));
            }}
            error={errors.litros}
          />

          <Input
            label="Valor total (R$) *"
            placeholder="Ex: 1200.00"
            keyboardType="decimal-pad"
            value={form.valor_total}
            onChangeText={(v) => {
              setForm((p) => ({
                ...p,
                valor_total: v.replace(/[^0-9.,]/g, '').replace(',', '.'),
              }));
              setErrors((p) => ({ ...p, valor_total: '' }));
            }}
            error={errors.valor_total}
          />

          <Input
            label="Posto (opcional)"
            placeholder="Nome do posto"
            value={form.posto}
            onChangeText={(v) => setForm((p) => ({ ...p, posto: v }))}
          />

          {precoLitro > 0 && (
            <Card style={styles.precoCard}>
              <View style={styles.precoRow}>
                <Text style={styles.precoLabel}>Preço por litro</Text>
                <Text style={styles.precoValue}>
                  R$ {precoLitro.toFixed(3)}
                </Text>
              </View>
            </Card>
          )}

          <Button
            title={mutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
            onPress={handleSubmit}
            loading={mutation.isPending}
            disabled={mutation.isPending}
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
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
  },
  precoCard: {
    marginBottom: spacing.lg,
    borderColor: colors.accent + '40',
  },
  precoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  precoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
  precoValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.accent,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});

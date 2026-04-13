import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../src/components/Input';
import { Button } from '../../src/components/Button';
import { Picker, PickerOption } from '../../src/components/Picker';
import { Card } from '../../src/components/Card';
import { useAuth } from '../../src/contexts/AuthContext';
import { caminhoesApi } from '../../src/api/caminhoes';
import {
  abastecimentosApi,
  CreateAbastecimentoPayload,
} from '../../src/api/abastecimentos';
import { colors, fontSize, radius, spacing } from '../../src/lib/theme';

const INITIAL_FORM = {
  caminhao_id: null as number | null,
  litros: '',
  valor_total: '',
  km_registro: '',
  posto: '',
};

export default function AbastecerScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const caminhoesQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });

  const caminhaoOptions: PickerOption[] = (caminhoesQuery.data ?? []).map(
    (c) => ({
      label: `${c.placa} — ${c.modelo}`,
      value: c.id,
    }),
  );

  const mutation = useMutation({
    mutationFn: (data: CreateAbastecimentoPayload) =>
      abastecimentosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['abastecimentos'] });
      Alert.alert('Sucesso', 'Abastecimento registrado!');
      setForm(INITIAL_FORM);
      setErrors({});
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.message || 'Falha ao registrar abastecimento');
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
      motorista_id: user?.motorista_id ?? 0,
      litros: Number(form.litros),
      valor_total: Number(form.valor_total),
      km_registro: Number(form.km_registro),
      posto: form.posto || undefined,
    });
  };

  // Auto-calculate preço/litro
  const litrosNum = Number(form.litros) || 0;
  const valorNum = Number(form.valor_total) || 0;
  const precoLitro = litrosNum > 0 && valorNum > 0 ? valorNum / litrosNum : 0;

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
            <Ionicons name="water" size={28} color={colors.accent} />
            <Text style={styles.title}>Novo Abastecimento</Text>
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
              setForm((p) => ({ ...p, litros: v.replace(/[^0-9.,]/g, '').replace(',', '.') }));
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
              setForm((p) => ({ ...p, valor_total: v.replace(/[^0-9.,]/g, '').replace(',', '.') }));
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
            title={mutation.isPending ? 'Registrando...' : 'Registrar Abastecimento'}
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
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
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

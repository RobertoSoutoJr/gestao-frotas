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
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Picker, PickerOption } from '../../../src/components/Picker';
import { caminhoesApi, CreateCaminhaoPayload } from '../../../src/api/caminhoes';
import { colors, fontSize, spacing } from '../../../src/lib/theme';

const COMBUSTIVEL_OPTIONS: PickerOption[] = [
  { label: 'Diesel', value: 'diesel' },
  { label: 'Gasolina', value: 'gasolina' },
  { label: 'Etanol', value: 'etanol' },
  { label: 'GNV', value: 'gnv' },
  { label: 'Elétrico', value: 'eletrico' },
];

const INITIAL_FORM = {
  placa: '',
  modelo: '',
  marca: '',
  ano_fabricacao: '',
  tipo_combustivel: null as string | null,
  km_atual: '',
  capacidade_carga: '',
  numero_chassi: '',
  observacoes: '',
};

export default function NovoCaminhaoScreen() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: CreateCaminhaoPayload) => caminhoesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caminhoes'] });
      Alert.alert('Caminhão cadastrado!', 'O caminhão foi adicionado à sua frota.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.message || 'Falha ao cadastrar caminhão');
    },
  });

  const set = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.placa.trim()) e.placa = 'Informe a placa';
    if (!form.modelo.trim()) e.modelo = 'Informe o modelo';
    if (form.ano_fabricacao && (Number(form.ano_fabricacao) < 1950 || Number(form.ano_fabricacao) > new Date().getFullYear() + 1))
      e.ano_fabricacao = 'Ano inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      placa: form.placa.trim().toUpperCase(),
      modelo: form.modelo.trim(),
      marca: form.marca.trim() || undefined,
      ano_fabricacao: form.ano_fabricacao ? Number(form.ano_fabricacao) : null,
      tipo_combustivel: form.tipo_combustivel ?? undefined,
      km_atual: form.km_atual ? Number(form.km_atual) : null,
      capacidade_carga: form.capacidade_carga ? Number(form.capacidade_carga) : null,
      numero_chassi: form.numero_chassi.trim() || undefined,
      observacoes: form.observacoes.trim() || undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.headerRow}>
            <Button title="Voltar" variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
          </View>
          <View style={styles.header}>
            <Ionicons name="bus" size={28} color={colors.accent} />
            <Text style={styles.title}>Novo Caminhão</Text>
          </View>

          <Input
            label="Placa *"
            placeholder="Ex: ABC-1234"
            value={form.placa}
            onChangeText={(v) => set('placa', v.toUpperCase())}
            autoCapitalize="characters"
            error={errors.placa}
          />
          <Input
            label="Modelo *"
            placeholder="Ex: FH 460, Constellation 24.280..."
            value={form.modelo}
            onChangeText={(v) => set('modelo', v)}
            error={errors.modelo}
          />
          <Input
            label="Marca"
            placeholder="Ex: Volvo, Scania, Mercedes..."
            value={form.marca}
            onChangeText={(v) => set('marca', v)}
          />
          <Input
            label="Ano de fabricação"
            placeholder="Ex: 2020"
            keyboardType="numeric"
            value={form.ano_fabricacao}
            onChangeText={(v) => set('ano_fabricacao', v.replace(/\D/g, '').slice(0, 4))}
            error={errors.ano_fabricacao}
          />
          <Picker
            label="Combustível"
            placeholder="Selecione o combustível"
            options={COMBUSTIVEL_OPTIONS}
            value={form.tipo_combustivel}
            onSelect={(v) => setForm((p) => ({ ...p, tipo_combustivel: v as string }))}
          />
          <Input
            label="KM atual"
            placeholder="Ex: 150000"
            keyboardType="numeric"
            value={form.km_atual}
            onChangeText={(v) => set('km_atual', v.replace(/\D/g, ''))}
          />
          <Input
            label="Capacidade de carga (toneladas)"
            placeholder="Ex: 30"
            keyboardType="decimal-pad"
            value={form.capacidade_carga}
            onChangeText={(v) => set('capacidade_carga', v.replace(/[^0-9.]/g, ''))}
          />
          <Input
            label="Número do chassi"
            placeholder="Ex: 9BWHE21JX24060831"
            value={form.numero_chassi}
            onChangeText={(v) => set('numero_chassi', v.toUpperCase())}
            autoCapitalize="characters"
          />
          <Input
            label="Observações"
            placeholder="Informações adicionais..."
            multiline
            numberOfLines={3}
            style={styles.multiline}
            value={form.observacoes}
            onChangeText={(v) => set('observacoes', v)}
          />

          <Button
            title={mutation.isPending ? 'Cadastrando...' : 'Cadastrar Caminhão'}
            onPress={handleSubmit}
            loading={mutation.isPending}
            disabled={mutation.isPending}
            style={styles.submitBtn}
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
  headerRow: { flexDirection: 'row', marginBottom: spacing.xs },
  backBtn: { paddingHorizontal: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: colors.text },
  multiline: { height: 80, textAlignVertical: 'top', paddingTop: spacing.md },
  submitBtn: { marginTop: spacing.sm },
});

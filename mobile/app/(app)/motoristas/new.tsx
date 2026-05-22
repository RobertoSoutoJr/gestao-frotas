import { useState } from 'react';
import {
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScroll } from '../../../src/components/KeyboardAwareScroll';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Picker, PickerOption } from '../../../src/components/Picker';
import { motoristasApi, CreateMotoristaPayload } from '../../../src/api/motoristas';
import { type Colors, fontSize, spacing } from '../../../src/lib/theme';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';

const CNH_OPTIONS: PickerOption[] = [
  { label: 'A', value: 'A' },
  { label: 'B', value: 'B' },
  { label: 'C', value: 'C' },
  { label: 'D', value: 'D' },
  { label: 'E', value: 'E' },
  { label: 'AB', value: 'AB' },
  { label: 'AC', value: 'AC' },
  { label: 'AD', value: 'AD' },
  { label: 'AE', value: 'AE' },
];

const INITIAL_FORM = {
  nome: '',
  cpf: '',
  email: '',
  telefone: '',
  cnh: '',
  categoria_cnh: null as string | null,
  vencimento_cnh: '',
};

export default function NovoMotoristaScreen() {
  const queryClient = useQueryClient();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: CreateMotoristaPayload) => motoristasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      Alert.alert('Motorista cadastrado!', 'O motorista foi adicionado com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.message || 'Falha ao cadastrar motorista');
    },
  });

  const set = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome do motorista';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Email inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      nome: form.nome.trim(),
      cpf: form.cpf.trim() || undefined,
      email: form.email.trim() || undefined,
      telefone: form.telefone.trim() || undefined,
      cnh: form.cnh.trim() || undefined,
      categoria_cnh: form.categoria_cnh ?? undefined,
      vencimento_cnh: form.vencimento_cnh.trim() || undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <KeyboardAwareScroll contentContainerStyle={styles.scroll} containerStyle={styles.flex}>
          <View style={styles.headerRow}>
            <Button title="Voltar" variant="ghost" onPress={() => router.back()} style={styles.backBtn} />
          </View>
          <View style={styles.header}>
            <Ionicons name="person-add" size={28} color={colors.accent} />
            <Text style={styles.title}>Novo Motorista</Text>
          </View>

          <Input
            label="Nome completo *"
            placeholder="Ex: João da Silva"
            value={form.nome}
            onChangeText={(v) => set('nome', v)}
            error={errors.nome}
          />
          <Input
            label="CPF"
            placeholder="000.000.000-00"
            keyboardType="numeric"
            value={form.cpf}
            onChangeText={(v) => set('cpf', v)}
          />
          <Input
            label="Telefone"
            placeholder="(00) 90000-0000"
            keyboardType="phone-pad"
            value={form.telefone}
            onChangeText={(v) => set('telefone', v)}
          />
          <Input
            label="Email"
            placeholder="motorista@email.com"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => set('email', v)}
            error={errors.email}
          />

          <Text style={styles.sectionLabel}>CNH</Text>
          <Input
            label="Número da CNH"
            placeholder="00000000000"
            keyboardType="numeric"
            value={form.cnh}
            onChangeText={(v) => set('cnh', v)}
          />
          <Picker
            label="Categoria"
            placeholder="Selecione a categoria"
            options={CNH_OPTIONS}
            value={form.categoria_cnh}
            onSelect={(v) => setForm((p) => ({ ...p, categoria_cnh: v as string }))}
          />
          <Input
            label="Vencimento da CNH"
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            value={form.vencimento_cnh}
            onChangeText={(v) => set('vencimento_cnh', v)}
          />

          <Button
            title={mutation.isPending ? 'Cadastrando...' : 'Cadastrar Motorista'}
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
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', marginBottom: spacing.xs },
  backBtn: { paddingHorizontal: 0 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: { fontSize: fontSize.xxl, fontWeight: '700', color: c.text },
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: c.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  submitBtn: { marginTop: spacing.sm },
});

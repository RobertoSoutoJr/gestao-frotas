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
import { useToast } from '../../../src/contexts/ToastContext';
import { useHaptics } from '../../../src/hooks/useHaptics';
import { motoristasApi } from '../../../src/api/motoristas';
import { type Colors, fontSize, radius, spacing } from '../../../src/lib/theme';
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

export default function EditMotoristaScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = Number(id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const haptics = useHaptics();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    cnh: '',
    categoria_cnh: null as string | null,
    vencimento_cnh: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  const recordQuery = useQuery({
    queryKey: ['motoristas', recordId],
    queryFn: () => motoristasApi.getById(recordId),
    enabled: !!recordId,
  });

  useEffect(() => {
    if (recordQuery.data && !loaded) {
      const r = recordQuery.data;
      setForm({
        nome: r.nome || '',
        cpf: r.cpf || '',
        email: r.email || '',
        telefone: r.telefone || '',
        cnh: r.cnh || '',
        categoria_cnh: r.categoria_cnh || null,
        vencimento_cnh: r.vencimento_cnh || '',
      });
      setLoaded(true);
    }
  }, [recordQuery.data, loaded]);

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof motoristasApi.update>[1]) =>
      motoristasApi.update(recordId, data),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['motoristas'] });
      showToast('Motorista atualizado', 'success');
      router.back();
    },
    onError: (err: any) => {
      haptics.error();
      showToast(err?.message || 'Erro ao atualizar', 'error');
    },
  });

  const set = (field: keyof typeof form, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nome.trim()) e.nome = 'Informe o nome do motorista';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Email invalido';
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
            <Text style={styles.title}>Editar Motorista</Text>
          </View>

          <Input
            label="Nome completo *"
            placeholder="Ex: Joao da Silva"
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
            label="Numero da CNH"
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
            onSelect={(v) =>
              setForm((p) => ({ ...p, categoria_cnh: v as string }))
            }
          />
          <Input
            label="Vencimento da CNH"
            placeholder="DD/MM/AAAA"
            keyboardType="numeric"
            value={form.vencimento_cnh}
            onChangeText={(v) => set('vencimento_cnh', v)}
          />

          <Button
            title={mutation.isPending ? 'Salvando...' : 'Salvar Alteracoes'}
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
  sectionLabel: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: c.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

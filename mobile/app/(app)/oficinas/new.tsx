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
import { useHaptics } from '../../../src/hooks/useHaptics';
import { oficinasApi, CreateOficinaPayload } from '../../../src/api/oficinas';
import { colors, fontSize, spacing } from '../../../src/lib/theme';

const INITIAL_FORM = {
  nome: '',
  endereco: '',
  telefone: '',
  cnpj: '',
};

export default function NovaOficinaScreen() {
  const queryClient = useQueryClient();
  const haptics = useHaptics();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: (data: CreateOficinaPayload) => oficinasApi.create(data),
    onSuccess: () => {
      haptics.success();
      queryClient.invalidateQueries({ queryKey: ['oficinas'] });
      Alert.alert('Oficina cadastrada!', 'A oficina foi adicionada com sucesso.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: (err: any) => {
      haptics.error();
      Alert.alert('Erro', err?.message || 'Falha ao cadastrar oficina');
    },
  });

  const set = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.nome.trim() || form.nome.trim().length < 2)
      e.nome = 'Nome deve ter pelo menos 2 caracteres';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      nome: form.nome.trim(),
      endereco: form.endereco.trim() || undefined,
      telefone: form.telefone.trim() || undefined,
      cnpj: form.cnpj.trim() || undefined,
    });
  };

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
          <View style={styles.headerRow}>
            <Button
              title="Voltar"
              variant="ghost"
              onPress={() => router.back()}
              style={styles.backBtn}
            />
          </View>

          <View style={styles.header}>
            <Ionicons name="build" size={28} color={colors.accent} />
            <Text style={styles.title}>Nova Oficina</Text>
          </View>

          <Input
            label="Nome *"
            placeholder="Ex: Auto Mecanica Silva"
            value={form.nome}
            onChangeText={(v) => set('nome', v)}
            error={errors.nome}
          />

          <Input
            label="Endereco"
            placeholder="Ex: Rua das Flores, 123"
            value={form.endereco}
            onChangeText={(v) => set('endereco', v)}
          />

          <Input
            label="Telefone"
            placeholder="Ex: (34) 99999-0000"
            keyboardType="phone-pad"
            value={form.telefone}
            onChangeText={(v) => set('telefone', v)}
          />

          <Input
            label="CNPJ"
            placeholder="Ex: 12.345.678/0001-00"
            keyboardType="numeric"
            value={form.cnpj}
            onChangeText={(v) => set('cnpj', v)}
          />

          <Button
            title={mutation.isPending ? 'Cadastrando...' : 'Cadastrar Oficina'}
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
  submitBtn: { marginTop: spacing.sm },
});

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
import { KeyboardAwareScroll } from '../../../src/components/KeyboardAwareScroll';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Picker, PickerOption } from '../../../src/components/Picker';
import { useToast } from '../../../src/contexts/ToastContext';
import { caminhoesApi } from '../../../src/api/caminhoes';
import {
  manutencoesApi,
  MAINTENANCE_TYPES,
} from '../../../src/api/manutencoes';
import { oficinasApi } from '../../../src/api/oficinas';
import { type Colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';

const typeOptions: PickerOption[] = MAINTENANCE_TYPES.map((t) => ({
  label: t,
  value: t,
}));

export default function EditManutencaoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = Number(id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const colors = useColors();
  const styles = useStyles(createStyles);

  const [form, setForm] = useState({
    caminhao_id: null as number | null,
    tipo_manutencao: '' as string,
    descricao: '',
    valor_total: '',
    km_manutencao: '',
    oficina_id: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  const recordQuery = useQuery({
    queryKey: ['manutencoes', recordId],
    queryFn: () => manutencoesApi.getById(recordId),
    enabled: !!recordId,
  });

  const caminhoesQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });

  const oficinasQuery = useQuery({
    queryKey: ['oficinas'],
    queryFn: () => oficinasApi.list(),
  });

  useEffect(() => {
    if (recordQuery.data && !loaded) {
      const r = recordQuery.data;
      setForm({
        caminhao_id: r.caminhao_id,
        tipo_manutencao: r.tipo_manutencao || '',
        descricao: r.descricao || '',
        valor_total: String(r.valor_total),
        km_manutencao: r.km_manutencao ? String(r.km_manutencao) : '',
        oficina_id: r.oficina_id ?? null,
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

  const oficinaOptions: PickerOption[] = (oficinasQuery.data ?? []).map(
    (o) => ({
      label: o.nome,
      value: o.id,
    }),
  );

  const mutation = useMutation({
    mutationFn: (data: Parameters<typeof manutencoesApi.update>[1]) =>
      manutencoesApi.update(recordId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      showToast('Manutenção atualizada', 'success');
      router.back();
    },
    onError: (err: any) => {
      showToast(err?.message || 'Erro ao atualizar', 'error');
    },
  });

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.caminhao_id) e.caminhao_id = 'Selecione um caminhão';
    if (!form.tipo_manutencao) e.tipo_manutencao = 'Selecione o tipo';
    if (!form.descricao || form.descricao.length < 3)
      e.descricao = 'Descrição muito curta';
    if (!form.valor_total || Number(form.valor_total) < 0)
      e.valor_total = 'Valor inválido';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    mutation.mutate({
      caminhao_id: form.caminhao_id!,
      tipo_manutencao: form.tipo_manutencao,
      descricao: form.descricao,
      valor_total: Number(form.valor_total),
      km_manutencao: Number(form.km_manutencao) || 0,
      oficina_id: form.oficina_id || null,
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
      <KeyboardAwareScroll contentContainerStyle={styles.scroll} containerStyle={styles.flex}>
          <View style={styles.header}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.text} />
            </Pressable>
            <Ionicons name="create" size={28} color={colors.accent} />
            <Text style={styles.title}>Editar Manutenção</Text>
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

          <Picker
            label="Tipo de manutenção *"
            placeholder="Selecione o tipo"
            options={typeOptions}
            value={form.tipo_manutencao || null}
            onSelect={(v) => {
              setForm((p) => ({ ...p, tipo_manutencao: v as string }));
              setErrors((p) => ({ ...p, tipo_manutencao: '' }));
            }}
            error={errors.tipo_manutencao}
          />

          <Input
            label="Descrição *"
            placeholder="Descreva o serviço realizado"
            multiline
            numberOfLines={3}
            style={styles.multiline}
            value={form.descricao}
            onChangeText={(v) => {
              setForm((p) => ({ ...p, descricao: v }));
              setErrors((p) => ({ ...p, descricao: '' }));
            }}
            error={errors.descricao}
          />

          <Input
            label="Valor total (R$) *"
            placeholder="Ex: 800.00"
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
            label="KM atual"
            placeholder="Ex: 150000"
            keyboardType="numeric"
            value={form.km_manutencao}
            onChangeText={(v) =>
              setForm((p) => ({
                ...p,
                km_manutencao: v.replace(/[^0-9]/g, ''),
              }))
            }
          />

          <Picker
            label="Oficina (opcional)"
            placeholder="Selecione a oficina"
            options={oficinaOptions}
            value={form.oficina_id}
            onSelect={(v) =>
              setForm((p) => ({ ...p, oficina_id: v as number }))
            }
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
  multiline: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

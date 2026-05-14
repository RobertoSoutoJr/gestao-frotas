import { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Picker, PickerOption } from '../../../src/components/Picker';
import { Card } from '../../../src/components/Card';
import { useAuth } from '../../../src/contexts/AuthContext';
import { caminhoesApi } from '../../../src/api/caminhoes';
import { clientesApi } from '../../../src/api/clientes';
import { fornecedoresApi } from '../../../src/api/fornecedores';
import { viagensApi, CreateViagemPayload } from '../../../src/api/viagens';
import { colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { formatCurrency } from '../../../src/lib/format';

const INITIAL_FORM = {
  fornecedor_id: null as number | null,
  cliente_id: null as number | null,
  caminhao_id: null as number | null,
  produto: '',
  quantidade_sacas: '',
  preco_produto_saca: '',
  preco_frete_saca: '',
  distancia_km: '',
  observacoes: '',
};

export default function NovaViagemScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [capturingGps, setCapturingGps] = useState(false);
  const [gpsOrigem, setGpsOrigem] = useState<{ lat: number; lng: number } | null>(null);

  const caminhoesQuery = useQuery({ queryKey: ['caminhoes'], queryFn: () => caminhoesApi.list() });
  const clientesQuery = useQuery({ queryKey: ['clientes'], queryFn: () => clientesApi.list() });
  const fornecedoresQuery = useQuery({ queryKey: ['fornecedores'], queryFn: () => fornecedoresApi.list() });

  const caminhaoOptions: PickerOption[] = (caminhoesQuery.data ?? []).map((c) => ({
    label: `${c.placa} — ${c.modelo}`,
    value: c.id,
  }));
  const clienteOptions: PickerOption[] = (clientesQuery.data ?? []).map((c) => ({
    label: c.nome,
    value: c.id,
  }));
  const fornecedorOptions: PickerOption[] = (fornecedoresQuery.data ?? []).map((f) => ({
    label: f.nome,
    value: f.id,
  }));

  const sacasNum = Number(form.quantidade_sacas) || 0;
  const precoSacaNum = Number(form.preco_produto_saca) || 0;
  const freteNum = Number(form.preco_frete_saca) || 0;

  const totalProduto = sacasNum * precoSacaNum;
  const totalFrete = sacasNum * freteNum;

  const captureGpsOrigem = async () => {
    setCapturingGps(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permissão negada', 'Habilite a localização nas configurações.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setGpsOrigem({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {
      Alert.alert('Erro', 'Não foi possível obter a localização.');
    } finally {
      setCapturingGps(false);
    }
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.fornecedor_id) e.fornecedor_id = 'Selecione o fornecedor';
    if (!form.cliente_id) e.cliente_id = 'Selecione o cliente';
    if (!form.caminhao_id) e.caminhao_id = 'Selecione um caminhão';
    if (!form.produto.trim()) e.produto = 'Informe o produto';
    if (!form.quantidade_sacas || Number(form.quantidade_sacas) <= 0)
      e.quantidade_sacas = 'Informe a quantidade de sacas';
    if (!form.preco_produto_saca || Number(form.preco_produto_saca) <= 0)
      e.preco_produto_saca = 'Informe o preço do produto por saca';
    const frete = Number(form.preco_frete_saca);
    if (!form.preco_frete_saca || frete < 0.5 || frete > 10)
      e.preco_frete_saca = 'Frete deve ser entre R$0,50 e R$10,00 por saca';
    if (!user?.motorista_id)
      e.motorista_id = 'Seu usuário não está vinculado a um motorista';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const mutation = useMutation({
    mutationFn: (data: CreateViagemPayload) => viagensApi.create(data),
    onSuccess: (viagem) => {
      queryClient.invalidateQueries({ queryKey: ['viagens'] });
      Alert.alert(
        'Viagem registrada!',
        'Acesse o detalhe para capturar o GPS de destino e finalizar.',
        [
          { text: 'Ver viagem', onPress: () => router.replace(`/(app)/viagens/${viagem.id}`) },
          { text: 'Fechar', onPress: () => router.back() },
        ],
      );
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.message || 'Falha ao registrar viagem');
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;
    const today = new Date().toISOString().split('T')[0];
    mutation.mutate({
      fornecedor_id: form.fornecedor_id!,
      cliente_id: form.cliente_id!,
      caminhao_id: form.caminhao_id!,
      motorista_id: user!.motorista_id!,
      produto: form.produto.trim(),
      quantidade_sacas: Number(form.quantidade_sacas),
      preco_produto_saca: Number(form.preco_produto_saca),
      preco_frete_saca: Number(form.preco_frete_saca),
      data_viagem: today,
      distancia_km: form.distancia_km ? Number(form.distancia_km) : null,
      observacoes: form.observacoes.trim() || null,
      origem_lat: gpsOrigem?.lat ?? null,
      origem_lng: gpsOrigem?.lng ?? null,
    });
  };

  const set = (field: keyof typeof INITIAL_FORM, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
    setErrors((p) => ({ ...p, [field]: '' }));
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
            <Ionicons name="map" size={28} color={colors.accent} />
            <Text style={styles.title}>Nova Viagem</Text>
          </View>

          {/* Erro de motorista não vinculado */}
          {!user?.motorista_id && (
            <Card style={styles.alertCard}>
              <Ionicons name="warning-outline" size={18} color={colors.warning} />
              <Text style={styles.alertText}>
                Seu usuário não está vinculado a um cadastro de motorista. Fale com o gestor para liberar o acesso.
              </Text>
            </Card>
          )}

          {/* Fornecedor e Cliente */}
          <Picker
            label="Fornecedor *"
            placeholder="Selecione o fornecedor"
            options={fornecedorOptions}
            value={form.fornecedor_id}
            onSelect={(v) => { setForm((p) => ({ ...p, fornecedor_id: v as number })); setErrors((p) => ({ ...p, fornecedor_id: '' })); }}
            error={errors.fornecedor_id}
          />
          <Picker
            label="Cliente *"
            placeholder="Selecione o cliente"
            options={clienteOptions}
            value={form.cliente_id}
            onSelect={(v) => { setForm((p) => ({ ...p, cliente_id: v as number })); setErrors((p) => ({ ...p, cliente_id: '' })); }}
            error={errors.cliente_id}
          />
          <Picker
            label="Caminhão *"
            placeholder="Selecione o caminhão"
            options={caminhaoOptions}
            value={form.caminhao_id}
            onSelect={(v) => { setForm((p) => ({ ...p, caminhao_id: v as number })); setErrors((p) => ({ ...p, caminhao_id: '' })); }}
            error={errors.caminhao_id}
          />

          {/* Produto e sacas */}
          <Input
            label="Produto *"
            placeholder="Ex: Soja, Milho, Trigo..."
            value={form.produto}
            onChangeText={(v) => set('produto', v)}
            error={errors.produto}
          />
          <Input
            label="Quantidade de sacas *"
            placeholder="Ex: 1200"
            keyboardType="numeric"
            value={form.quantidade_sacas}
            onChangeText={(v) => set('quantidade_sacas', v.replace(/[^0-9]/g, ''))}
            error={errors.quantidade_sacas}
          />
          <Input
            label="Preço do produto por saca (R$) *"
            placeholder="Ex: 120.00"
            keyboardType="decimal-pad"
            value={form.preco_produto_saca}
            onChangeText={(v) => set('preco_produto_saca', v.replace(/[^0-9.,]/g, '').replace(',', '.'))}
            error={errors.preco_produto_saca}
          />
          <Input
            label="Frete por saca (R$) * — entre R$0,50 e R$10,00"
            placeholder="Ex: 4.50"
            keyboardType="decimal-pad"
            value={form.preco_frete_saca}
            onChangeText={(v) => set('preco_frete_saca', v.replace(/[^0-9.,]/g, '').replace(',', '.'))}
            error={errors.preco_frete_saca}
          />

          {/* Resumo calculado */}
          {sacasNum > 0 && (precoSacaNum > 0 || freteNum > 0) && (
            <Card style={styles.resumoCard}>
              <Text style={styles.resumoTitle}>Resumo da viagem</Text>
              {precoSacaNum > 0 && (
                <View style={styles.resumoRow}>
                  <Text style={styles.resumoLabel}>Valor do produto</Text>
                  <Text style={styles.resumoValue}>{formatCurrency(totalProduto)}</Text>
                </View>
              )}
              {freteNum > 0 && (
                <View style={styles.resumoRow}>
                  <Text style={styles.resumoLabel}>Frete total</Text>
                  <Text style={[styles.resumoValue, { color: colors.accent }]}>{formatCurrency(totalFrete)}</Text>
                </View>
              )}
              <Text style={styles.resumoSub}>{sacasNum.toLocaleString('pt-BR')} sacas</Text>
            </Card>
          )}

          {/* GPS Origem */}
          <Text style={styles.sectionLabel}>GPS de origem (opcional)</Text>
          <Pressable
            style={[styles.gpsBtn, gpsOrigem && styles.gpsBtnDone]}
            onPress={captureGpsOrigem}
            disabled={capturingGps}
          >
            <Ionicons
              name={gpsOrigem ? 'location' : 'location-outline'}
              size={20}
              color={gpsOrigem ? colors.success : colors.accent}
            />
            <View style={styles.gpsBtnText}>
              <Text style={[styles.gpsBtnTitle, gpsOrigem && { color: colors.success }]}>
                {capturingGps ? 'Capturando GPS...' : gpsOrigem ? 'GPS capturado' : 'Capturar localização atual'}
              </Text>
              {gpsOrigem && (
                <Text style={styles.gpsBtnCoords}>
                  {gpsOrigem.lat.toFixed(5)}, {gpsOrigem.lng.toFixed(5)}
                </Text>
              )}
            </View>
            {!capturingGps && !gpsOrigem && (
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            )}
          </Pressable>

          <Input
            label="Distância estimada (km)"
            placeholder="Ex: 450"
            keyboardType="numeric"
            value={form.distancia_km}
            onChangeText={(v) => set('distancia_km', v.replace(/[^0-9]/g, ''))}
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
            title={mutation.isPending ? 'Registrando...' : 'Registrar Viagem'}
            onPress={handleSubmit}
            loading={mutation.isPending}
            disabled={mutation.isPending || !user?.motorista_id}
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
  alertCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderColor: colors.warning + '50',
    backgroundColor: colors.warning + '10',
  },
  alertText: { flex: 1, fontSize: fontSize.sm, color: colors.warning, lineHeight: 20 },
  resumoCard: { marginBottom: spacing.md, borderColor: colors.accent + '40' },
  resumoTitle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  resumoRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  resumoLabel: { fontSize: fontSize.sm, color: colors.textMuted },
  resumoValue: { fontSize: fontSize.sm, fontWeight: '700', color: colors.text },
  resumoSub: { fontSize: fontSize.xs, color: colors.textDim, marginTop: spacing.xs },
  sectionLabel: { fontSize: fontSize.sm, color: colors.textMuted, fontWeight: '500', marginBottom: spacing.sm },
  gpsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  gpsBtnDone: { borderColor: colors.success + '60', backgroundColor: colors.success + '10' },
  gpsBtnText: { flex: 1 },
  gpsBtnTitle: { fontSize: fontSize.sm, fontWeight: '600', color: colors.accent },
  gpsBtnCoords: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 2 },
  multiline: { height: 80, textAlignVertical: 'top', paddingTop: spacing.md },
  submitBtn: { marginTop: spacing.sm },
});

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
import { Card } from '../../../src/components/Card';
import { NfceScanner } from '../../../src/components/NfceScanner';
import { useToast } from '../../../src/contexts/ToastContext';
import { caminhoesApi } from '../../../src/api/caminhoes';
import { abastecimentosApi } from '../../../src/api/abastecimentos';
import { postosApi } from '../../../src/api/postos';
import { ocrApi } from '../../../src/api/ocr';
import { type Colors, fontSize, radius, spacing } from '../../../src/lib/theme';
import { useColors, useStyles } from '../../../src/contexts/ThemeContext';
import { useHaptics } from '../../../src/hooks/useHaptics';

export default function EditAbastecimentoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const recordId = Number(id);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const haptics = useHaptics();

  const [form, setForm] = useState({
    caminhao_id: null as number | null,
    litros: '',
    valor_total: '',
    km_registro: '',
    posto_id: null as number | null,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);

  // NFC-e scanner state
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<{
    confidence: number;
    method: string;
    documento_id?: number;
  } | null>(null);

  const recordQuery = useQuery({
    queryKey: ['abastecimentos', recordId],
    queryFn: () => abastecimentosApi.getById(recordId),
    enabled: !!recordId,
  });

  const caminhoesQuery = useQuery({
    queryKey: ['caminhoes'],
    queryFn: () => caminhoesApi.list(),
  });

  const postosQuery = useQuery({
    queryKey: ['postos'],
    queryFn: () => postosApi.list(),
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
        posto_id: r.posto_id ?? null,
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

  const postoOptions: PickerOption[] = (postosQuery.data ?? []).map(
    (p) => ({
      label: p.nome,
      value: p.id,
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

  const handleScanCapture = async (result: { uri: string; qrData?: string }) => {
    setScannerVisible(false);
    setScanning(true);

    try {
      const response = await ocrApi.extractFuelReceipt(result.uri);

      if (response.extracted) {
        const ext = response.extracted;

        setForm((prev) => ({
          ...prev,
          litros: ext.litros ? String(ext.litros) : prev.litros,
          valor_total: ext.valor_total ? String(ext.valor_total) : prev.valor_total,
          posto_id: prev.posto_id || matchPostoByCnpj(ext.posto_cnpj) || prev.posto_id,
        }));

        if (ext.placa_veiculo && !form.caminhao_id) {
          const truck = (caminhoesQuery.data ?? []).find(
            (c) =>
              c.placa?.replace(/[-\s]/g, '').toUpperCase() ===
              ext.placa_veiculo?.replace(/[-\s]/g, '').toUpperCase(),
          );
          if (truck) {
            setForm((prev) => ({ ...prev, caminhao_id: truck.id }));
          }
        }

        setOcrResult({
          confidence: response.confidence,
          method: response.method,
          documento_id: response.documento_id,
        });

        haptics.success();
        showToast(
          `Dados extraídos (${Math.round(response.confidence * 100)}% confiança)`,
          response.confidence >= 0.7 ? 'success' : 'info',
        );
      } else {
        haptics.warning();
        showToast(response.error || 'Não foi possível ler o cupom', 'error');
      }
    } catch (err: any) {
      haptics.error();
      showToast(err?.message || 'Erro ao processar imagem', 'error');
    } finally {
      setScanning(false);
    }
  };

  const matchPostoByCnpj = (cnpj: string | null): number | null => {
    if (!cnpj) return null;
    const clean = cnpj.replace(/[^\d]/g, '');
    const posto = (postosQuery.data ?? []).find(
      (p) => p.cnpj?.replace(/[^\d]/g, '') === clean,
    );
    return posto?.id ?? null;
  };

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
      posto_id: form.posto_id || undefined,
    });
  };

  const litrosNum = Number(form.litros) || 0;
  const valorNum = Number(form.valor_total) || 0;
  const precoLitro = litrosNum > 0 && valorNum > 0 ? valorNum / litrosNum : 0;

  // Confidence badge color
  const confColor = ocrResult
    ? ocrResult.confidence >= 0.7
      ? colors.success
      : ocrResult.confidence >= 0.4
        ? colors.warning
        : colors.danger
    : null;

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
            <Text style={styles.title}>Editar Abastecimento</Text>
          </View>

          {/* NFC-e Scanner Button */}
          <Pressable
            onPress={() => setScannerVisible(true)}
            disabled={scanning}
            style={[styles.scanBtn, scanning && { opacity: 0.6 }]}
          >
            {scanning ? (
              <>
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={styles.scanBtnText}>Lendo cupom fiscal...</Text>
              </>
            ) : (
              <>
                <Ionicons name="camera-outline" size={22} color={colors.accent} />
                <View style={styles.scanBtnContent}>
                  <Text style={styles.scanBtnText}>Escanear NFC-e</Text>
                  <Text style={styles.scanBtnHint}>
                    Tire uma foto do cupom para atualizar valores
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
              </>
            )}
          </Pressable>

          {/* OCR confidence badge */}
          {ocrResult && confColor && (
            <View style={[styles.ocrBadge, { backgroundColor: confColor + '15', borderColor: confColor + '40' }]}>
              <Ionicons
                name={ocrResult.confidence >= 0.7 ? 'checkmark-circle' : 'information-circle'}
                size={16}
                color={confColor}
              />
              <Text style={[styles.ocrBadgeText, { color: confColor }]}>
                {ocrResult.confidence >= 0.7
                  ? 'Dados extraídos com alta confiança'
                  : ocrResult.confidence >= 0.4
                    ? 'Dados parciais — revise os valores'
                    : 'Poucos dados extraídos — preencha manualmente'}
                {' '}({ocrResult.method === 'qr+vision' ? 'QR + OCR' : ocrResult.method === 'qr' ? 'QR Code' : 'OCR'})
              </Text>
            </View>
          )}

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

          <Picker
            label="Posto (opcional)"
            placeholder="Selecione o posto"
            options={postoOptions}
            value={form.posto_id}
            onSelect={(v) =>
              setForm((p) => ({ ...p, posto_id: v as number }))
            }
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
      </KeyboardAwareScroll>

      <NfceScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onCapture={handleScanCapture}
      />
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
  scanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: c.accent + '10',
    borderWidth: 1,
    borderColor: c.accent + '30',
    borderRadius: radius.lg,
    borderStyle: 'dashed',
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  scanBtnContent: {
    flex: 1,
  },
  scanBtnText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: c.accent,
  },
  scanBtnHint: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    marginTop: 2,
  },
  ocrBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  ocrBadgeText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    flex: 1,
  },
  precoCard: {
    marginBottom: spacing.lg,
    borderColor: c.accent + '40',
  },
  precoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  precoLabel: {
    fontSize: fontSize.sm,
    color: c.textMuted,
  },
  precoValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: c.accent,
  },
  submitButton: {
    marginTop: spacing.sm,
  },
});

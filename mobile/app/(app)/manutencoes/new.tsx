import { useState } from 'react';
import {
  Alert,
  Image,
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
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Input } from '../../../src/components/Input';
import { Button } from '../../../src/components/Button';
import { Picker, PickerOption } from '../../../src/components/Picker';
import { useAuth } from '../../../src/contexts/AuthContext';
import { caminhoesApi } from '../../../src/api/caminhoes';
import {
  manutencoesApi,
  MAINTENANCE_TYPES,
  CreateManutencaoPayload,
} from '../../../src/api/manutencoes';
import { documentosApi } from '../../../src/api/documentos';
import { colors, fontSize, radius, spacing } from '../../../src/lib/theme';

const typeOptions: PickerOption[] = MAINTENANCE_TYPES.map((t) => ({
  label: t,
  value: t,
}));

const INITIAL_FORM = {
  caminhao_id: null as number | null,
  tipo_manutencao: '' as string,
  descricao: '',
  valor_total: '',
  km_manutencao: '',
  oficina: '',
};

export default function NewManutencaoScreen() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

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

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Habilite o acesso à galeria.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permissão negada', 'Habilite o acesso à câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: true,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0]);
    }
  };

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

  const mutation = useMutation({
    mutationFn: async (data: CreateManutencaoPayload) => {
      const record = await manutencoesApi.create(data);
      // Upload photo if selected
      if (photo) {
        setUploading(true);
        try {
          const ext = photo.uri.split('.').pop() || 'jpg';
          const mime = photo.mimeType || `image/${ext}`;
          await documentosApi.upload(
            photo.uri,
            `manutencao_${record.id}.${ext}`,
            mime,
            {
              entidade_tipo: 'manutencao',
              entidade_id: record.id,
              tipo_documento: 'foto_manutencao',
            },
          );
        } catch {
          // Non-blocking: maintenance saved even if upload fails
          Alert.alert('Aviso', 'Manutenção salva, mas a foto não foi enviada.');
        } finally {
          setUploading(false);
        }
      }
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      Alert.alert('Sucesso', 'Manutenção registrada!');
      router.back();
    },
    onError: (err: any) => {
      Alert.alert('Erro', err?.message || 'Falha ao registrar manutenção');
    },
  });

  const handleSubmit = () => {
    if (!validate()) return;

    const today = new Date().toISOString().split('T')[0];
    mutation.mutate({
      caminhao_id: form.caminhao_id!,
      tipo_manutencao: form.tipo_manutencao,
      descricao: form.descricao,
      valor_total: Number(form.valor_total),
      km_manutencao: Number(form.km_manutencao) || 0,
      data_manutencao: today,
      oficina: form.oficina || null,
      status: 'concluida',
    });
  };

  const isBusy = mutation.isPending || uploading;

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
            <Ionicons name="construct" size={28} color={colors.accent} />
            <Text style={styles.title}>Nova Manutenção</Text>
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
              setForm((p) => ({ ...p, km_manutencao: v.replace(/[^0-9]/g, '') }))
            }
          />

          <Input
            label="Oficina (opcional)"
            placeholder="Nome da oficina"
            value={form.oficina}
            onChangeText={(v) => setForm((p) => ({ ...p, oficina: v }))}
          />

          {/* Photo section */}
          <Text style={styles.photoLabel}>Foto do comprovante</Text>
          <View style={styles.photoRow}>
            <Pressable style={styles.photoBtn} onPress={takePhoto}>
              <Ionicons name="camera-outline" size={24} color={colors.accent} />
              <Text style={styles.photoBtnText}>Câmera</Text>
            </Pressable>
            <Pressable style={styles.photoBtn} onPress={pickPhoto}>
              <Ionicons name="images-outline" size={24} color={colors.accent} />
              <Text style={styles.photoBtnText}>Galeria</Text>
            </Pressable>
          </View>

          {photo && (
            <View style={styles.preview}>
              <Image source={{ uri: photo.uri }} style={styles.previewImage} />
              <Pressable
                style={styles.removePhoto}
                onPress={() => setPhoto(null)}
              >
                <Ionicons name="close-circle" size={24} color={colors.danger} />
              </Pressable>
            </View>
          )}

          <Button
            title={isBusy ? 'Salvando...' : 'Registrar Manutenção'}
            onPress={handleSubmit}
            loading={isBusy}
            disabled={isBusy}
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
  headerRow: {
    flexDirection: 'row',
    marginBottom: spacing.xs,
  },
  backBtn: { paddingHorizontal: 0 },
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
  multiline: {
    height: 90,
    textAlignVertical: 'top',
    paddingTop: spacing.md,
  },
  photoLabel: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  photoRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  photoBtn: {
    flex: 1,
    height: 56,
    backgroundColor: colors.bgCard,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  photoBtnText: {
    fontSize: fontSize.sm,
    color: colors.accent,
    fontWeight: '600',
  },
  preview: {
    marginBottom: spacing.lg,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: radius.lg,
  },
  removePhoto: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  submitBtn: {
    marginTop: spacing.sm,
  },
});

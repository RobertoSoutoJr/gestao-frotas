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
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { authApi } from '../../src/api/auth';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, fontSize, spacing } from '../../src/lib/theme';

export default function VerifyEmailScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { refreshProfile } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async () => {
    if (!email || code.length !== 6) {
      Alert.alert('Atenção', 'Informe o código de 6 dígitos');
      return;
    }
    setLoading(true);
    try {
      await authApi.verifyEmail(email, code);
      await refreshProfile();
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      Alert.alert('Erro', err?.message ?? 'Código inválido ou expirado');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;
    setResending(true);
    try {
      await authApi.resendCode(email);
      Alert.alert('Pronto', 'Novo código enviado para seu email');
    } catch (err: any) {
      Alert.alert('Erro', err?.message ?? 'Não foi possível reenviar o código');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Verifique seu email</Text>
            <Text style={styles.subtitle}>
              Enviamos um código de 6 dígitos para{'\n'}
              <Text style={styles.email}>{email}</Text>
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Código de verificação"
              value={code}
              onChangeText={(text) => setCode(text.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              style={{ textAlign: 'center', fontSize: fontSize.xxl, letterSpacing: 8 }}
            />
            <Button
              title="Verificar"
              onPress={handleVerify}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />
            <Button
              title={resending ? 'Enviando...' : 'Reenviar código'}
              onPress={handleResend}
              variant="ghost"
              disabled={resending}
              style={{ marginTop: spacing.sm }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.lg, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: spacing.xl },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  email: { color: colors.text, fontWeight: '600' },
  form: { marginBottom: spacing.xl },
});

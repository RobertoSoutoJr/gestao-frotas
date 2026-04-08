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
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { authApi } from '../../src/api/auth';
import { colors, fontSize, spacing } from '../../src/lib/theme';

export default function RegisterScreen() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [empresa, setEmpresa] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome.trim() || !email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha nome, email e senha');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Atenção', 'Senha deve ter pelo menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await authApi.register({
        nome: nome.trim(),
        email: email.trim(),
        password,
        empresa: empresa.trim() || undefined,
        telefone: telefone.trim() || undefined,
      });
      router.replace({
        pathname: '/(auth)/verify-email',
        params: { email: email.trim() },
      });
    } catch (err: any) {
      Alert.alert('Erro ao cadastrar', err?.message ?? 'Tente novamente');
    } finally {
      setLoading(false);
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
            <Text style={styles.title}>Criar conta</Text>
            <Text style={styles.subtitle}>Comece a gerenciar sua frota</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Nome completo"
              value={nome}
              onChangeText={setNome}
              placeholder="João Silva"
              autoCapitalize="words"
            />
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="Mínimo 6 caracteres"
              secureTextEntry
            />
            <Input
              label="Empresa (opcional)"
              value={empresa}
              onChangeText={setEmpresa}
              placeholder="Minha Transportadora"
            />
            <Input
              label="Telefone (opcional)"
              value={telefone}
              onChangeText={setTelefone}
              placeholder="(11) 99999-9999"
              keyboardType="phone-pad"
            />
            <Button
              title="Cadastrar"
              onPress={handleRegister}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Já tem conta?</Text>
            <Link href="/(auth)/login" asChild>
              <Text style={styles.link}>Entrar</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: spacing.lg },
  header: { alignItems: 'center', marginVertical: spacing.xl },
  title: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: { fontSize: fontSize.sm, color: colors.textMuted },
  form: { marginBottom: spacing.xl },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  footerText: { color: colors.textMuted, fontSize: fontSize.sm },
  link: { color: colors.accent, fontSize: fontSize.sm, fontWeight: '600' },
});

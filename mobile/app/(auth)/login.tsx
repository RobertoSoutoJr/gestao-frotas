import { useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const logoDark = require('../../assets/images/logoFuelTrack_black-removebg.png');
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';
import { useAuth } from '../../src/contexts/AuthContext';
import { type Colors, fontSize, spacing } from '../../src/lib/theme';
import { useColors, useStyles } from '../../src/contexts/ThemeContext';

const createStyles = (c: Colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    scroll: {
      flexGrow: 1,
      padding: spacing.lg,
      justifyContent: 'center',
    },
    header: {
      alignItems: 'center',
      marginBottom: spacing.xxl,
    },
    logo: {
      width: 200,
      height: 60,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: c.textMuted,
    },
    form: {
      marginBottom: spacing.xl,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: spacing.xs,
    },
    footerText: {
      color: c.textMuted,
      fontSize: fontSize.sm,
    },
    link: {
      color: c.accent,
      fontSize: fontSize.sm,
      fontWeight: '600',
    },
  });

export default function LoginScreen() {
  const { login } = useAuth();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace('/(app)/dashboard');
    } catch (err: any) {
      Alert.alert('Erro ao entrar', err?.message ?? 'Verifique suas credenciais');
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
            <Image source={logoDark} style={styles.logo} resizeMode="contain" />
            <Text style={styles.subtitle}>Gestão Inteligente de Frotas</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
            />
            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry
              autoComplete="password"
            />
            <Button
              title="Entrar"
              onPress={handleLogin}
              loading={loading}
              style={{ marginTop: spacing.sm }}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Ainda não tem conta?</Text>
            <Link href="/(auth)/register" asChild>
              <Text style={styles.link}>Cadastre-se</Text>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

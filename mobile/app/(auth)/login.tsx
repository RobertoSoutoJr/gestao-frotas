import { useEffect, useState } from 'react';
import {
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { type Colors, fontSize, radius, spacing } from '../../src/lib/theme';
import { useColors, useStyles, useTheme } from '../../src/contexts/ThemeContext';

const logoDark = require('../../assets/images/logoFuelTrack_light-removebg.png');
const logoLight = require('../../assets/images/logoFuelTrack_black-removebg.png');

const REMEMBER_EMAIL_KEY = '@fueltrack:remember_email';
const REMEMBER_ENABLED_KEY = '@fueltrack:remember_enabled';

export default function LoginScreen() {
  const { login } = useAuth();
  const { isDark } = useTheme();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Fade-in animation
  const [fadeAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();

    // Load remembered email
    (async () => {
      try {
        const enabled = await AsyncStorage.getItem(REMEMBER_ENABLED_KEY);
        if (enabled === 'true') {
          setRememberMe(true);
          const saved = await AsyncStorage.getItem(REMEMBER_EMAIL_KEY);
          if (saved) setEmail(saved);
        }
      } catch {}
    })();
  }, []);

  const handleLogin = async () => {
    if (!email.trim()) {
      Alert.alert('Atenção', 'Informe seu email');
      return;
    }
    if (!password) {
      Alert.alert('Atenção', 'Informe sua senha');
      return;
    }

    setLoading(true);
    try {
      // Save or clear remembered email
      if (rememberMe) {
        await AsyncStorage.setItem(REMEMBER_EMAIL_KEY, email.trim());
        await AsyncStorage.setItem(REMEMBER_ENABLED_KEY, 'true');
      } else {
        await AsyncStorage.removeItem(REMEMBER_EMAIL_KEY);
        await AsyncStorage.setItem(REMEMBER_ENABLED_KEY, 'false');
      }

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
          showsVerticalScrollIndicator={false}
        >
          <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.iconCircle}>
                <Ionicons name="water" size={40} color={colors.accent} />
              </View>
              <Image
                source={isDark ? logoDark : logoLight}
                style={styles.logo}
                resizeMode="contain"
              />
              <Text style={styles.subtitle}>Gestão Inteligente de Frotas</Text>
            </View>

            {/* Login Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Entrar na sua conta</Text>

              {/* Email Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color={colors.textDim} style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="seu@email.com"
                    placeholderTextColor={colors.textDim}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="email"
                    returnKeyType="next"
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Senha</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color={colors.textDim} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor={colors.textDim}
                    secureTextEntry={!showPassword}
                    autoComplete="password"
                    returnKeyType="go"
                    onSubmitEditing={handleLogin}
                  />
                  <Pressable
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                    hitSlop={12}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={22}
                      color={colors.textDim}
                    />
                  </Pressable>
                </View>
              </View>

              {/* Remember Me */}
              <View style={styles.rememberRow}>
                <Pressable
                  style={styles.rememberLeft}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <Switch
                    value={rememberMe}
                    onValueChange={setRememberMe}
                    trackColor={{ false: colors.border, true: colors.accent + '60' }}
                    thumbColor={rememberMe ? colors.accent : colors.textDim}
                    style={styles.switch}
                  />
                  <Text style={styles.rememberText}>Lembrar de mim</Text>
                </Pressable>
              </View>

              {/* Login Button */}
              <Button
                title={loading ? 'Entrando...' : 'Entrar'}
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
              />
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>Ainda não tem conta?</Text>
              <Link href="/(auth)/register" asChild>
                <Pressable>
                  <Text style={styles.link}>Cadastre-se gratuitamente</Text>
                </Pressable>
              </Link>
            </View>

            {/* Version */}
            <Text style={styles.version}>v0.1.0</Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    flex: { flex: 1 },
    scroll: {
      flexGrow: 1,
      justifyContent: 'center',
    },
    content: {
      padding: spacing.lg,
    },
    logoSection: {
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.accent + '15',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    logo: {
      width: 260,
      height: 80,
      marginBottom: spacing.xs,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      letterSpacing: 0.5,
    },
    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.xl,
      padding: spacing.lg,
      borderWidth: 1,
      borderColor: c.border,
      marginBottom: spacing.lg,
    },
    cardTitle: {
      fontSize: fontSize.lg,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.lg,
      textAlign: 'center',
    },
    inputGroup: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      marginBottom: spacing.xs,
      fontWeight: '500',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgElevated,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      height: 52,
      paddingHorizontal: spacing.sm,
    },
    inputIcon: {
      marginRight: spacing.sm,
      marginLeft: spacing.xs,
    },
    input: {
      flex: 1,
      color: c.text,
      fontSize: fontSize.base,
      height: '100%',
    },
    eyeButton: {
      padding: spacing.sm,
    },
    rememberRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
      marginTop: spacing.xs,
    },
    rememberLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    switch: {
      transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
      marginRight: spacing.xs,
    },
    rememberText: {
      fontSize: fontSize.sm,
      color: c.textMuted,
    },
    loginButton: {
      height: 54,
      borderRadius: radius.lg,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing.xs,
      marginBottom: spacing.md,
    },
    footerText: {
      color: c.textMuted,
      fontSize: fontSize.sm,
    },
    link: {
      color: c.accent,
      fontSize: fontSize.sm,
      fontWeight: '700',
    },
    version: {
      textAlign: 'center',
      fontSize: fontSize.xs,
      color: c.textDim,
    },
  });

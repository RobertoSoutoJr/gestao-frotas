import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, fontSize } from '../src/lib/theme';

// Splash/gate: branded loading screen → redirect based on auth state
export default function Index() {
  const { user, loading } = useAuth();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        tension: 80,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (loading) return;
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(app)/dashboard');
      } else {
        router.replace('/(auth)/login');
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [user, loading]);

  return (
    <View style={styles.container}>
      <Animated.View
        style={[styles.content, { opacity, transform: [{ scale }] }]}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="water" size={36} color={colors.accent} />
        </View>
        <Text style={styles.brand}>
          <Text style={styles.brandWhite}>Fuel</Text>
          <Text style={styles.brandAccent}>Track</Text>
        </Text>
        <Text style={styles.tagline}>Gestão Inteligente de Frotas</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: colors.accent + '20',
    borderWidth: 1,
    borderColor: colors.accent + '40',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  brand: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
  },
  brandWhite: {
    color: colors.text,
  },
  brandAccent: {
    color: colors.accent,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 6,
  },
});

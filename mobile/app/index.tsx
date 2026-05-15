import { useEffect, useRef } from 'react';
import { Animated, Image, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';
import { colors, fontSize } from '../src/lib/theme';

const logoDark = require('../assets/images/logoFuelTrack_black-removebg.png');

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
        <Image source={logoDark} style={styles.logo} resizeMode="contain" />
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
  logo: {
    width: 220,
    height: 72,
    marginBottom: 8,
  },
  tagline: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 6,
  },
});

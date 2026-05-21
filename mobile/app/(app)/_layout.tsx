import { useEffect } from 'react';
import { Tabs, router } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { type Colors } from '../../src/lib/theme';
import { useColors, useStyles } from '../../src/contexts/ThemeContext';
import { useExpirationNotifications } from '../../src/hooks/useExpirationNotifications';
import { useTripAssignmentNotifications } from '../../src/hooks/useTripAssignmentNotifications';
import { useOfflineSync } from '../../src/hooks/useOfflineSync';

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: c.bg,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default function AppLayout() {
  const { user, loading } = useAuth();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const insets = useSafeAreaInsets();

  // Define roles before any hook that depends on them
  const isAdmin = user?.role !== 'motorista';
  const isMotorista = !isAdmin;

  const { pendingCount } = useOfflineSync();

  useExpirationNotifications(!!user && isAdmin);
  useTripAssignmentNotifications(isMotorista ? user?.motorista_id : null);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/(auth)/login');
    }
  }, [user, loading]);

  if (loading || !user) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bgCard,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60 + insets.bottom,
          paddingBottom: insets.bottom + 4,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="viagens"
        options={{
          title: 'Viagens',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="abastecer"
        options={{
          title: 'Abastecer',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="water-outline" size={size} color={color} />
          ),
          tabBarBadge: pendingCount > 0 ? pendingCount : undefined,
          tabBarBadgeStyle: { fontSize: 10 },
          // Show for both roles
        }}
      />
      <Tabs.Screen
        name="manutencoes"
        options={{
          title: 'Manutenção',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="construct-outline" size={size} color={color} />
          ),
          // Show for both roles
        }}
      />
      <Tabs.Screen
        name="frota"
        options={{
          title: 'Frota',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bus-outline" size={size} color={color} />
          ),
          href: !isMotorista ? '/(app)/frota' : null,
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: 'Relatórios',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bar-chart-outline" size={size} color={color} />
          ),
          href: !isMotorista ? '/(app)/relatorios' : null,
        }}
      />
      <Tabs.Screen
        name="cadastros"
        options={{
          title: 'Cadastros',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="grid-outline" size={size} color={color} />
          ),
          href: !isMotorista ? '/(app)/cadastros' : null,
        }}
      />
      {/* postos e oficinas são acessadas via tela Cadastros — sem tab própria */}
      <Tabs.Screen name="postos" options={{ href: null }} />
      <Tabs.Screen name="oficinas" options={{ href: null }} />
      <Tabs.Screen name="motoristas" options={{ href: null }} />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

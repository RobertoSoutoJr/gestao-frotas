import { StyleSheet, Text, View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, fontSize, radius, spacing } from '../../src/lib/theme';

// MVP placeholder — adaptive content per role gets built in Etapa 2
export default function DashboardScreen() {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.greeting}>Olá, {user?.nome?.split(' ')[0]}</Text>
          <Text style={styles.role}>
            {user?.role === 'motorista' ? 'Motorista' : 'Gestor'}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login funcionando ✓</Text>
          <Text style={styles.cardText}>
            Você está autenticado no backend de produção.{'\n'}
            As próximas etapas (abastecimento, viagens, manutenção) serão
            construídas a seguir.
          </Text>
        </View>

        <Button
          title="Sair"
          onPress={logout}
          variant="secondary"
          style={{ marginTop: spacing.lg }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg },
  header: { marginBottom: spacing.xl },
  greeting: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: colors.text,
  },
  role: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cardText: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 22,
  },
});

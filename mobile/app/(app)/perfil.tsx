import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { useAuth } from '../../src/contexts/AuthContext';
import { useColors, useStyles } from '../../src/contexts/ThemeContext';
import { useTheme } from '../../src/contexts/ThemeContext';
import { type Colors, fontSize, radius, spacing } from '../../src/lib/theme';

export default function PerfilScreen() {
  const { user, logout } = useAuth();
  const colors = useColors();
  const styles = useStyles(createStyles);
  const { mode, setMode, isDark } = useTheme();
  const isAdmin = user?.role !== 'motorista';

  const handleLogout = () => {
    Alert.alert('Sair', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  };

  const initial = user?.nome?.charAt(0)?.toUpperCase() ?? '?';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          <Text style={styles.name}>{user?.nome}</Text>
          <Text style={styles.role}>
            {user?.role === 'motorista' ? 'Motorista' : 'Gestor'}
          </Text>
        </View>

        <Card style={styles.card}>
          <InfoRow icon="mail-outline" label="Email" value={user?.email ?? '-'} />
          {user?.telefone ? (
            <InfoRow
              icon="call-outline"
              label="Telefone"
              value={user.telefone}
            />
          ) : null}
          {user?.empresa ? (
            <InfoRow
              icon="business-outline"
              label="Empresa"
              value={user.empresa}
            />
          ) : null}
          <InfoRow
            icon="shield-checkmark-outline"
            label="Status"
            value={user?.is_active ? 'Ativo' : 'Inativo'}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.themeRow}>
            <Ionicons name={isDark ? 'moon' : 'sunny'} size={20} color={colors.accent} />
            <View style={styles.rowText}>
              <Text style={styles.rowLabel}>Tema</Text>
              <Text style={styles.rowValue}>{mode === 'dark' ? 'Escuro' : mode === 'light' ? 'Claro' : 'Sistema'}</Text>
            </View>
          </View>
          <View style={styles.themeOptions}>
            {(['dark', 'light', 'system'] as const).map((m) => (
              <Pressable
                key={m}
                onPress={() => setMode(m)}
                style={[styles.themeChip, mode === m && styles.themeChipActive]}
              >
                <Ionicons
                  name={m === 'dark' ? 'moon-outline' : m === 'light' ? 'sunny-outline' : 'phone-portrait-outline'}
                  size={16}
                  color={mode === m ? colors.accent : colors.textMuted}
                />
                <Text style={[styles.themeChipText, mode === m && styles.themeChipTextActive]}>
                  {m === 'dark' ? 'Escuro' : m === 'light' ? 'Claro' : 'Sistema'}
                </Text>
              </Pressable>
            ))}
          </View>
        </Card>

        {isAdmin && (
          <Button
            title="+ Cadastrar Motorista"
            onPress={() => router.push('/(app)/motoristas/new')}
            style={styles.actionButton}
          />
        )}

        <Button
          title="Sair"
          variant="secondary"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  const colors = useColors();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.row}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <View style={styles.rowText}>
        <Text style={styles.rowLabel}>{label}</Text>
        <Text style={styles.rowValue}>{value}</Text>
      </View>
    </View>
  );
}

const createStyles = (c: Colors) => StyleSheet.create({
  safe: { flex: 1, backgroundColor: c.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: c.accent,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: fontSize.xxxl,
    fontWeight: '700',
    color: c.text,
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: c.text,
  },
  role: {
    fontSize: fontSize.sm,
    color: c.textMuted,
    marginTop: spacing.xs,
  },
  card: {
    borderRadius: radius.lg,
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: c.border,
  },
  rowText: { flex: 1 },
  rowLabel: {
    fontSize: fontSize.xs,
    color: c.textMuted,
    marginBottom: 2,
  },
  rowValue: {
    fontSize: fontSize.sm,
    color: c.text,
    fontWeight: '500',
  },
  actionButton: {
    marginTop: spacing.xl,
  },
  logoutButton: {
    marginTop: spacing.sm,
  },
  themeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    gap: spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  themeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: c.border,
    backgroundColor: c.bgElevated,
  },
  themeChipActive: {
    borderColor: c.accent,
    backgroundColor: c.accent + '15',
  },
  themeChipText: {
    fontSize: fontSize.xs,
    fontWeight: '500',
    color: c.textMuted,
  },
  themeChipTextActive: {
    color: c.accent,
    fontWeight: '700',
  },
});

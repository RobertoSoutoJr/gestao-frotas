import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { useColors, useStyles } from '../../src/contexts/ThemeContext';
import { postosApi } from '../../src/api/postos';
import { oficinasApi } from '../../src/api/oficinas';
import { type Colors, fontSize, radius, spacing } from '../../src/lib/theme';

export default function CadastrosScreen() {
  const colors = useColors();
  const styles = useStyles(createStyles);

  const postosQuery = useQuery({
    queryKey: ['postos'],
    queryFn: () => postosApi.list(),
  });

  const oficinasQuery = useQuery({
    queryKey: ['oficinas'],
    queryFn: () => oficinasApi.list(),
  });

  const postosCount = postosQuery.data?.length ?? 0;
  const oficinasCount = oficinasQuery.data?.length ?? 0;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.header}>
          <Text style={styles.title}>Cadastros</Text>
          <Text style={styles.subtitle}>Gerencie seus dados de referência</Text>
        </View>

        {/* Postos */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push('/(app)/postos')}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.success + '18' }]}>
            <Ionicons name="storefront-outline" size={28} color={colors.success} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>Postos de Combustível</Text>
              {postosCount > 0 && (
                <View style={[styles.countBadge, { backgroundColor: colors.success + '20' }]}>
                  <Text style={[styles.countText, { color: colors.success }]}>
                    {postosCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDesc}>
              Postos vinculados aos registros de abastecimento.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
        </Pressable>

        {/* Oficinas */}
        <Pressable
          style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
          onPress={() => router.push('/(app)/oficinas')}
        >
          <View style={[styles.iconWrap, { backgroundColor: colors.warning + '18' }]}>
            <Ionicons name="hammer-outline" size={28} color={colors.warning} />
          </View>
          <View style={styles.cardBody}>
            <View style={styles.cardRow}>
              <Text style={styles.cardTitle}>Oficinas</Text>
              {oficinasCount > 0 && (
                <View style={[styles.countBadge, { backgroundColor: colors.warning + '20' }]}>
                  <Text style={[styles.countText, { color: colors.warning }]}>
                    {oficinasCount}
                  </Text>
                </View>
              )}
            </View>
            <Text style={styles.cardDesc}>
              Oficinas vinculadas aos registros de manutenção.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textDim} />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.bg },
    scroll: {
      padding: spacing.lg,
      paddingBottom: spacing.xxl,
    },
    header: {
      marginBottom: spacing.xl,
    },
    title: {
      fontSize: fontSize.xxl,
      fontWeight: '700',
      color: c.text,
    },
    subtitle: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      marginTop: spacing.xs,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      borderWidth: 1,
      borderColor: c.border,
      padding: spacing.lg,
      marginBottom: spacing.md,
    },
    cardPressed: {
      opacity: 0.75,
    },
    iconWrap: {
      width: 56,
      height: 56,
      borderRadius: radius.lg,
      justifyContent: 'center',
      alignItems: 'center',
      flexShrink: 0,
    },
    cardBody: {
      flex: 1,
      gap: spacing.xs,
    },
    cardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    cardTitle: {
      fontSize: fontSize.base,
      fontWeight: '700',
      color: c.text,
    },
    cardDesc: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      lineHeight: 18,
    },
    countBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 999,
    },
    countText: {
      fontSize: fontSize.xs,
      fontWeight: '700',
    },
  });

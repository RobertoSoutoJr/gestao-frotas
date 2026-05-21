import { Pressable, StyleSheet, Text, View } from 'react-native';
import { type Colors, fontSize, spacing } from '../lib/theme';
import { useStyles } from '../contexts/ThemeContext';

export type Periodo = '7d' | '30d' | '90d' | '1a' | 'tudo';

const OPTIONS: { label: string; value: Periodo }[] = [
  { label: '7 dias', value: '7d' },
  { label: '30 dias', value: '30d' },
  { label: '90 dias', value: '90d' },
  { label: '1 ano', value: '1a' },
  { label: 'Tudo', value: 'tudo' },
];

export function getDateFrom(periodo: Periodo): Date | null {
  if (periodo === 'tudo') return null;
  const d = new Date();
  if (periodo === '7d') d.setDate(d.getDate() - 7);
  else if (periodo === '30d') d.setDate(d.getDate() - 30);
  else if (periodo === '90d') d.setDate(d.getDate() - 90);
  else if (periodo === '1a') d.setFullYear(d.getFullYear() - 1);
  return d;
}

export function PeriodFilter({
  value,
  onChange,
}: {
  value: Periodo;
  onChange: (v: Periodo) => void;
}) {
  const styles = useStyles(createStyles);

  return (
    <View style={styles.row}>
      {OPTIONS.map((opt) => (
        <Pressable
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={[styles.chip, value === opt.value && styles.chipActive]}
        >
          <Text style={[styles.chipText, value === opt.value && styles.chipTextActive]}>
            {opt.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
      gap: spacing.xs,
    },
    chip: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: c.border,
      backgroundColor: c.bgCard,
    },
    chipActive: {
      borderColor: c.accent,
      backgroundColor: c.accent + '20',
    },
    chipText: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      fontWeight: '500',
    },
    chipTextActive: {
      color: c.accent,
      fontWeight: '700',
    },
  });

import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../contexts/ThemeContext';
import { type Colors, fontSize, radius, spacing } from '../lib/theme';

type SummaryItem = {
  label: string;
  value: string;
  color?: string;
};

type Props = {
  items: SummaryItem[];
  count: number;
};

export function ListSummary({ items, count }: Props) {
  const colors = useColors();

  if (items.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: colors.bgCard, borderColor: colors.border }]}>
      <View style={styles.row}>
        <Text style={[styles.count, { color: colors.textMuted }]}>
          {count} registro{count !== 1 ? 's' : ''}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        {items.map((item, i) => (
          <View key={i} style={styles.item}>
            <Text style={[styles.label, { color: colors.textMuted }]}>{item.label}</Text>
            <Text style={[styles.value, { color: item.color || colors.text }]}>{item.value}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  count: {
    fontSize: fontSize.xs,
  },
  divider: {
    width: 1,
    height: 14,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  label: {
    fontSize: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: fontSize.xs,
    fontWeight: '700',
  },
});

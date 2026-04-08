import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { colors, fontSize, spacing } from '../lib/theme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  value: string;
  label: string;
}

export function StatCard({ icon, iconColor = colors.accent, value, label }: StatCardProps) {
  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Ionicons name={icon} size={22} color={iconColor} style={styles.icon} />
        <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </Text>
        <Text style={styles.label} numberOfLines={2}>
          {label}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: spacing.md,
  },
  content: {
    alignItems: 'center',
  },
  icon: {
    marginBottom: spacing.xs,
  },
  value: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  label: {
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
});

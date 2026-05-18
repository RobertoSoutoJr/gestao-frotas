import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from './Card';
import { type Colors, fontSize, spacing } from '../lib/theme';
import { useColors, useStyles } from '../contexts/ThemeContext';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  value: string;
  label: string;
}

export function StatCard({ icon, iconColor, value, label }: StatCardProps) {
  const colors = useColors();
  const styles = useStyles(createStyles);

  return (
    <Card style={styles.card}>
      <View style={styles.content}>
        <Ionicons name={icon} size={22} color={iconColor ?? colors.accent} style={styles.icon} />
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

const createStyles = (c: Colors) =>
  StyleSheet.create({
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
      color: c.text,
      marginBottom: 2,
    },
    label: {
      fontSize: fontSize.xs,
      color: c.textMuted,
      textAlign: 'center',
    },
  });

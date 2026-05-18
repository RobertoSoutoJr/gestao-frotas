import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type Colors, fontSize, spacing } from '../lib/theme';
import { useColors, useStyles } from '../contexts/ThemeContext';

interface ComingSoonProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

export function ComingSoon({ icon, title, description }: ComingSoonProps) {
  const colors = useColors();
  const styles = useStyles(createStyles);

  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name={icon} size={40} color={colors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>Em breve</Text>
      </View>
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    iconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: c.bgCard,
      borderWidth: 1,
      borderColor: c.border,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.lg,
    },
    title: {
      fontSize: fontSize.xl,
      fontWeight: '700',
      color: c.text,
      marginBottom: spacing.sm,
      textAlign: 'center',
    },
    description: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.lg,
      maxWidth: 300,
    },
    badge: {
      backgroundColor: c.accent + '22',
      borderWidth: 1,
      borderColor: c.accent,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      borderRadius: 999,
    },
    badgeText: {
      color: c.accent,
      fontSize: fontSize.xs,
      fontWeight: '600',
    },
  });

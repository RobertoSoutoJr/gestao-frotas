import type { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { type Colors, radius, spacing } from '../lib/theme';
import { useStyles } from '../contexts/ThemeContext';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
}

export function Card({ children, style }: CardProps) {
  const styles = useStyles(createStyles);
  return <View style={[styles.card, style]}>{children}</View>;
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
  });

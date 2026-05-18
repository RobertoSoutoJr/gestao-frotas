import React, { forwardRef } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { type Colors, fontSize, radius, spacing } from '../lib/theme';
import { useColors, useStyles } from '../contexts/ThemeContext';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
}

export const Input = forwardRef<TextInput, InputProps>(
  ({ label, error, style, ...props }, ref) => {
    const colors = useColors();
    const styles = useStyles(createStyles);

    return (
      <View style={styles.container}>
        {label && <Text style={styles.label}>{label}</Text>}
        <TextInput
          ref={ref}
          placeholderTextColor={colors.textDim}
          style={[styles.input, error && styles.inputError, style]}
          {...props}
        />
        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    );
  }
);

Input.displayName = 'Input';

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      marginBottom: spacing.md,
    },
    label: {
      fontSize: fontSize.sm,
      color: c.textMuted,
      marginBottom: spacing.xs,
      fontWeight: '500',
    },
    input: {
      height: 52,
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: spacing.md,
      color: c.text,
      fontSize: fontSize.base,
    },
    inputError: {
      borderColor: c.danger,
    },
    error: {
      fontSize: fontSize.xs,
      color: c.danger,
      marginTop: spacing.xs,
    },
  });

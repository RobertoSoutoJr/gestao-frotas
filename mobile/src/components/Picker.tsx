import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type Colors, fontSize, radius, spacing } from '../lib/theme';
import { useColors, useStyles } from '../contexts/ThemeContext';

export interface PickerOption {
  label: string;
  value: string | number;
}

interface PickerProps {
  label?: string;
  placeholder?: string;
  options: PickerOption[];
  value: string | number | null;
  onSelect: (value: string | number) => void;
  error?: string;
}

export function Picker({
  label,
  placeholder = 'Selecione',
  options,
  value,
  onSelect,
  error,
}: PickerProps) {
  const colors = useColors();
  const styles = useStyles(createStyles);
  const [visible, setVisible] = useState(false);
  const selected = options.find((o) => o.value === value);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Pressable
        onPress={() => setVisible(true)}
        style={[styles.trigger, error && styles.triggerError]}
      >
        <Text
          style={[styles.triggerText, !selected && styles.placeholder]}
          numberOfLines={1}
        >
          {selected ? selected.label : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {error && <Text style={styles.error}>{error}</Text>}

      <Modal visible={visible} transparent animationType="slide">
        <Pressable style={styles.backdrop} onPress={() => setVisible(false)} />
        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label || 'Selecione'}</Text>
            <Pressable onPress={() => setVisible(false)}>
              <Ionicons name="close" size={24} color={colors.textMuted} />
            </Pressable>
          </View>
          <FlatList
            data={options}
            keyExtractor={(item) => String(item.value)}
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  onPress={() => {
                    onSelect(item.value);
                    setVisible(false);
                  }}
                  style={[styles.option, isSelected && styles.optionSelected]}
                >
                  <Text
                    style={[
                      styles.optionText,
                      isSelected && styles.optionTextSelected,
                    ]}
                  >
                    {item.label}
                  </Text>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={colors.accent}
                    />
                  )}
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <Text style={styles.empty}>Nenhuma opcao disponivel</Text>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

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
    trigger: {
      height: 52,
      backgroundColor: c.bgCard,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: c.border,
      paddingHorizontal: spacing.md,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    triggerError: {
      borderColor: c.danger,
    },
    triggerText: {
      fontSize: fontSize.base,
      color: c.text,
      flex: 1,
    },
    placeholder: {
      color: c.textDim,
    },
    error: {
      fontSize: fontSize.xs,
      color: c.danger,
      marginTop: spacing.xs,
    },
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    sheet: {
      backgroundColor: c.bgCard,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      maxHeight: '50%',
      paddingBottom: spacing.xl,
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    sheetTitle: {
      fontSize: fontSize.lg,
      fontWeight: '600',
      color: c.text,
    },
    option: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
    },
    optionSelected: {
      backgroundColor: c.accent + '15',
    },
    optionText: {
      fontSize: fontSize.base,
      color: c.text,
    },
    optionTextSelected: {
      color: c.accent,
      fontWeight: '600',
    },
    empty: {
      padding: spacing.xl,
      textAlign: 'center',
      color: c.textMuted,
      fontSize: fontSize.sm,
    },
  });

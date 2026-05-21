import { useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { type Colors, radius, spacing } from '../lib/theme';
import { useColors, useStyles } from '../contexts/ThemeContext';

const SWIPE_THRESHOLD = 80;
const ACTION_WIDTH = 72;

interface SwipeableRowProps {
  children: React.ReactNode;
  onDelete?: () => void;
  onEdit?: () => void;
}

export function SwipeableRow({ children, onDelete, onEdit }: SwipeableRowProps) {
  const translateX = useRef(new Animated.Value(0)).current;
  const colors = useColors();
  const styles = useStyles(createStyles);

  const actionCount = (onEdit ? 1 : 0) + (onDelete ? 1 : 0);
  const maxOffset = actionCount > 0 ? -(ACTION_WIDTH * actionCount) : 0;

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
        actionCount > 0 && Math.abs(g.dx) > 6 && Math.abs(g.dx) > Math.abs(g.dy),
      onPanResponderMove: (_, g) => {
        const x = Math.max(maxOffset - 20, Math.min(0, g.dx));
        translateX.setValue(x);
      },
      onPanResponderRelease: (_, g) => {
        const openFully = g.dx < -SWIPE_THRESHOLD;
        Animated.spring(translateX, {
          toValue: openFully ? maxOffset : 0,
          useNativeDriver: true,
          bounciness: 4,
        }).start();
      },
    }),
  ).current;

  const close = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 4,
    }).start();
  };

  return (
    <View style={styles.container}>
      <View style={styles.actions}>
        {onEdit && (
          <Pressable
            style={[styles.action, { backgroundColor: colors.accent }]}
            onPress={() => { close(); onEdit(); }}
          >
            <Ionicons name="create-outline" size={20} color="#fff" />
            <Text style={styles.actionLabel}>Editar</Text>
          </Pressable>
        )}
        {onDelete && (
          <Pressable
            style={[styles.action, { backgroundColor: colors.danger }]}
            onPress={() => { close(); onDelete(); }}
          >
            <Ionicons name="trash-outline" size={20} color="#fff" />
            <Text style={styles.actionLabel}>Excluir</Text>
          </Pressable>
        )}
      </View>

      <Animated.View
        style={{ transform: [{ translateX }] }}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    container: {
      overflow: 'hidden',
      borderRadius: radius.lg,
    },
    actions: {
      position: 'absolute',
      right: 0,
      top: 0,
      bottom: 0,
      flexDirection: 'row',
    },
    action: {
      width: ACTION_WIDTH,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    actionLabel: {
      color: '#fff',
      fontSize: 11,
      fontWeight: '600',
    },
  });

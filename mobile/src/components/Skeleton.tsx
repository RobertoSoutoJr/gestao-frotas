import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewStyle } from 'react-native';
import { type Colors, radius, spacing } from '../lib/theme';
import { useStyles } from '../contexts/ThemeContext';

// Single shimmer block
export function SkeletonBox({ width, height, style }: {
  width?: number | string;
  height?: number;
  style?: ViewStyle;
}) {
  const styles = useStyles(createStyles);
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 900, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.65] });

  return (
    <Animated.View
      style={[
        styles.box,
        { width: width as any, height: height ?? 14, opacity },
        style,
      ]}
    />
  );
}

// Skeleton for a typical card row with icon + two text lines
export function SkeletonCard({ style }: { style?: ViewStyle }) {
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.card, style]}>
      <SkeletonBox width={48} height={48} style={styles.icon} />
      <View style={styles.lines}>
        <SkeletonBox width="65%" height={14} style={{ marginBottom: spacing.xs }} />
        <SkeletonBox width="40%" height={11} />
      </View>
    </View>
  );
}

// Repeating list of skeleton cards
export function SkeletonList({ count = 5, style }: { count?: number; style?: ViewStyle }) {
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.list, style]}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} style={i > 0 ? { marginTop: spacing.sm } : undefined} />
      ))}
    </View>
  );
}

// Skeleton for the dashboard stat grid (2-column)
export function SkeletonStatGrid({ count = 4 }: { count?: number }) {
  const styles = useStyles(createStyles);
  return (
    <View style={styles.statGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <View key={i} style={styles.statCard}>
          <SkeletonBox width={32} height={32} style={{ borderRadius: 8, marginBottom: spacing.sm }} />
          <SkeletonBox width="55%" height={22} style={{ marginBottom: spacing.xs }} />
          <SkeletonBox width="70%" height={11} />
        </View>
      ))}
    </View>
  );
}

const createStyles = (c: Colors) =>
  StyleSheet.create({
    box: {
      backgroundColor: c.bgElevated,
      borderRadius: radius.sm,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
      gap: spacing.md,
    },
    icon: {
      borderRadius: radius.md,
      flexShrink: 0,
    },
    lines: {
      flex: 1,
    },
    list: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
    },
    statGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.sm,
      paddingHorizontal: spacing.lg,
    },
    statCard: {
      width: '47%',
      backgroundColor: c.bgCard,
      borderRadius: radius.lg,
      padding: spacing.md,
      borderWidth: 1,
      borderColor: c.border,
    },
  });

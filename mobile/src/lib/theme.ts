// Design tokens — dual theme support (dark default, light available)

export type Colors = typeof darkColors;

export const darkColors = {
  bg: '#0A0A0C',
  bgCard: '#141416',
  bgElevated: '#1A1A1E',
  border: '#2A2A2E',
  text: '#EDEDEF',
  textMuted: '#8A8F98',
  textDim: '#6b7280',
  accent: '#28633D',
  accentHover: '#2F7547',
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
} as const;

export const lightColors: Colors = {
  bg: '#F8F9FB',
  bgCard: '#FFFFFF',
  bgElevated: '#F0F1F5',
  border: '#E2E4E9',
  text: '#1A1D23',
  textMuted: '#6B7280',
  textDim: '#9CA3AF',
  accent: '#1E4F30',
  accentHover: '#28633D',
  success: '#16a34a',
  warning: '#d97706',
  danger: '#dc2626',
  info: '#2563eb',
} as const;

// Backwards compat — static reference (used by files not yet migrated)
export const colors = darkColors;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
} as const;

export const fontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

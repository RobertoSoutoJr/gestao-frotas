// Design tokens — dual theme support (dark default, light available)

export type Colors = typeof darkColors;

export const darkColors = {
  bg: '#0f0f23',
  bgCard: '#1a1a2e',
  bgElevated: '#252545',
  border: '#2a2a4a',
  text: '#ffffff',
  textMuted: '#9ca3af',
  textDim: '#6b7280',
  accent: '#5E6AD2',
  accentHover: '#4c56b8',
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
  accent: '#4F5BD5',
  accentHover: '#3D48B0',
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

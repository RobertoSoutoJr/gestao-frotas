// Design tokens mirrored from the web frontend (accent #5E6AD2, dark theme default)

export const colors = {
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

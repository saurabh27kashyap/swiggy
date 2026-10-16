import type { TextStyle, ViewStyle } from 'react-native';

/**
 * Single source of truth for the visual language.
 * Every screen pulls spacing/colour/type from here — no magic numbers in components.
 */
export const colors = {
  brand: '#FF5A1F',
  brandDark: '#DB410C',
  brandSoft: '#FFF1EA',

  accent: '#4B2AAD',
  accentDark: '#331C7A',
  accentSoft: '#F1ECFF',

  ink: '#101418',
  inkSoft: '#48525E',
  muted: '#8A94A0',

  line: '#ECEEF1',
  surface: '#FFFFFF',
  canvas: '#F6F7F9',

  success: '#0E8A4F',
  successSoft: '#E7F6EE',
  star: '#F5A524',
  danger: '#D92D20',
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const font = {
  display: { fontSize: 26, fontWeight: '800', letterSpacing: -0.6, color: colors.ink },
  h1: { fontSize: 20, fontWeight: '800', letterSpacing: -0.4, color: colors.ink },
  h2: { fontSize: 16, fontWeight: '700', letterSpacing: -0.2, color: colors.ink },
  body: { fontSize: 14, fontWeight: '500', color: colors.ink },
  bodySoft: { fontSize: 14, fontWeight: '500', color: colors.inkSoft },
  label: { fontSize: 12, fontWeight: '600', color: colors.inkSoft },
  caption: { fontSize: 11, fontWeight: '600', color: colors.muted },
} satisfies Record<string, TextStyle>;

export const card: ViewStyle = {
  backgroundColor: colors.surface,
  borderRadius: radius.lg,
  borderWidth: 1,
  borderColor: colors.line,
};

/** Soft lift used on cards and the floating cart bar. */
export const lift: ViewStyle = {
  shadowColor: '#0B1220',
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 3,
};

/** Instamart's promise, kept in one place so screens stay copy-consistent. */
export const PROMISE_MINUTES = 10;

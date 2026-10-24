import { tokens } from './tokens.js';

export type ColorScheme = 'dark' | 'light';

export function createTheme(scheme: ColorScheme = 'dark') {
  const colors = scheme === 'dark' ? tokens.colors.dark : tokens.colors.light;

  return {
    scheme,
    colors: {
      bg: colors.bg,
      surface: colors.surface,
      surfaceElevated: colors.surfaceElevated,
      border: colors.border,
      borderSubtle: colors.borderSubtle,
      text: colors.text,
      textSecondary: colors.textSecondary,
      textMuted: colors.textMuted,
      accent: scheme === 'dark' ? tokens.colors.accent.dark : tokens.colors.accent.light,
      accentHover: tokens.colors.accent.hover,
      accentSubtle: tokens.colors.accent.subtle,
      status: tokens.colors.status,
    },
    font: tokens.fontFamily,
    fontSize: tokens.fontSize,
    fontWeight: tokens.fontWeight,
    spacing: tokens.spacing,
    radius: tokens.radius,
    shadow: tokens.shadow,
    gradients: tokens.gradients,
  };
}

export const darkTheme = createTheme('dark');
export const lightTheme = createTheme('light');

export type Theme = ReturnType<typeof createTheme>;
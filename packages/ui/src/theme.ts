import { tokens } from './tokens.js';

export const theme = {
  colors: {
    bg: {
      primary: tokens.colors.white,
      secondary: tokens.colors.gray50,
      dark: tokens.colors.black,
      card: tokens.colors.white,
    },
    text: {
      primary: tokens.colors.black,
      secondary: tokens.colors.gray600,
      inverse: tokens.colors.white,
      muted: tokens.colors.gray400,
    },
    border: {
      default: tokens.colors.gray200,
      strong: tokens.colors.gray400,
      focus: tokens.colors.lime,
    },
    accent: {
      base: tokens.colors.lime,
      dark: tokens.colors.limeDark,
      light: tokens.colors.limeLight,
    },
    status: {
      success: tokens.colors.success,
      warning: tokens.colors.warning,
      error: tokens.colors.error,
      info: tokens.colors.info,
    },
  },
  passportState: {
    created: tokens.colors.gray500,
    in_transit: tokens.colors.info,
    recycled: tokens.colors.lime,
    reborn: tokens.colors.limeDark,
  },
  fonts: tokens.fonts,
  fontSize: tokens.fontSize,
  spacing: tokens.spacing,
  radius: tokens.radius,
  shadow: tokens.shadow,
} as const;

export type Theme = typeof theme;
export const tokens = {
  colors: {
    // ============ DARK MODE (default) ============
    dark: {
      bg: '#0D0F14',           // Obsidian
      surface: '#161A22',      // Graphite
      surfaceElevated: '#1C212B',
      border: '#262B36',       // Slate
      borderSubtle: '#1E232E',
      text: '#F3F1EC',         // Ivory
      textSecondary: '#8B8F9A', // Mist
      textMuted: '#5C6068',
    },

    // ============ LIGHT MODE ============
    light: {
      bg: '#F7F5F0',
      surface: '#FFFFFF',
      surfaceElevated: '#FAF8F3',
      border: '#E5E2DA',
      borderSubtle: '#EFECE5',
      text: '#14161C',
      textSecondary: '#4A4E58',
      textMuted: '#8B8F9A',
    },

    // ============ ACCENT ============
    accent: {
      dark: '#D4B483',         // Champagne Gold
      hover: '#E6CBA0',        // Soft Gold
      light: '#B8935A',        // Darker for light mode
      subtle: 'rgba(212, 180, 131, 0.12)',  // 12% opacity
    },

    // ============ STATUS ============
    status: {
      success: '#5FB38A',
      error: '#D9604C',
      warning: '#E0A84A',
      info: '#6C8EF5',
    },
  },

  // ============ TYPOGRAPHY ============
  fontFamily: {
    sans: 'Inter Tight',
    mono: 'JetBrains Mono',
  },

  fontSize: {
    xs: 11,
    sm: 13,
    base: 15,
    lg: 17,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 38,
    '5xl': 48,
  },

  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  // ============ SPACING (4px base) ============
  spacing: {
    xxs: 2,
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    '2xl': 32,
    '3xl': 48,
    '4xl': 64,
  },

  // ============ RADIUS ============
  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 9999,
  },

  // ============ SHADOWS (soft, premium) ============
  shadow: {
    sm: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 4,
    },
    glow: {
      shadowColor: '#D4B483',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
  },

  // ============ GRADIENTS ============
  gradients: {
    primary: ['#D4B483', '#B8935A'] as const,   // logo + primary buttons only
  },
} as const;
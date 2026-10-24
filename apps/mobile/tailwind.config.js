/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // ============ 60% BACKGROUND ============
        obsidian: '#0D0F14',      // dark mode bg
        ivory: '#F7F5F0',         // light mode bg

        // ============ 30% SURFACES ============
        graphite: '#161A22',      // dark card
        slate: '#262B36',         // dark border
        'dark-text': '#F3F1EC',   // dark mode text (Ivory)
        mist: '#8B8F9A',          // secondary text
        'light-card': '#FFFFFF',  // light mode card
        'light-text': '#14161C',  // light mode text
        lime: '#D4B483',      // eski "lime" → endi "champagne"
        'lime-dark': '#B8935A',
        ink: '#0D0F14',       // eski "ink" → endi "obsidian"
        eco: '#0D0F14',       // eski "eco" fon → endi "obsidian"
        'eco-gray': '#262B36', // eski soft bg → endi "slate"
        'txt-secondary': '#8B8F9A',
        'txt-muted': '#8B8F9A',
        'border-default': '#262B36',
        ai: '#6C8EF5',        // periwinkle (AI uchun)
        success: '#5FB38A',
        warning: '#E0A84A',
        error: '#D9604C',
        // ============ 10% ACCENT ============
        champagne: '#D4B483',     // primary (dark mode)
        'champagne-soft': '#E6CBA0', // hover
        'champagne-dark': '#B8935A', // light mode

        // ============ STATUS (muted) ============
        sage: '#5FB38A',          // success
        terracotta: '#D9604C',    // error
        amber: '#E0A84A',         // warning
        periwinkle: '#6C8EF5',    // info
      },
      fontFamily: {
        sans: ['Inter Tight', 'Manrope', 'System'],
        mono: ['JetBrains Mono', 'Courier'],
      },
    },
  },
  plugins: [],
};

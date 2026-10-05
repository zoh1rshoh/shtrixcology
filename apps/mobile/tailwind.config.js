/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        lime: '#B8FF3D',
        'lime-dark': '#9EE627',
        ink: '#111111',
        white: '#FFFFFF',
        eco: '#F6F7F4',
        'eco-gray': '#ECEFE9',
        'txt-secondary': '#4B5148',
        'txt-muted': '#8A9187',
        'border-default': '#DDE1D9',
        'border-active': '#C9D0C5',
        success: '#36B37E',
        warning: '#F4B740',
        error: '#E5484D',
        ai: '#7C5CFC',
      },
    },
  },
  plugins: [],
};
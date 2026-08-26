/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Align with Colors in src/constants/theme.ts
        background: {
          DEFAULT: '#ffffff',
          dark: '#000000',
        },
        surface: {
          DEFAULT: '#F0F0F3',
          dark: '#212225',
          selected: '#E0E1E6',
          'selected-dark': '#2E3135',
        },
        foreground: {
          DEFAULT: '#000000',
          dark: '#ffffff',
          muted: '#60646C',
          'muted-dark': '#B0B4BA',
        },
        border: {
          DEFAULT: '#E0E1E6',
          dark: '#2E3135',
        },
        primary: {
          DEFAULT: '#4458A8',
          foreground: '#ffffff',
        },
      },
      borderRadius: {
        card: '12px',
      },
      maxWidth: {
        content: '800px',
      },
    },
  },
  plugins: [],
};

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shiny Red and White Theme
        primary: {
          50: '#fef2f2',   // Very light red
          100: '#fee2e2',  // Light red
          200: '#fecaca',  // Lighter red
          300: '#fca5a5',  // Light red
          400: '#f87171',  // Medium light red
          500: '#ef4444',  // Base red
          600: '#dc2626',  // Primary red (main brand color)
          700: '#b91c1c',  // Dark red
          800: '#991b1b',  // Darker red
          900: '#7f1d1d',  // Very dark red
          DEFAULT: '#dc2626', // Primary red
        },
        secondary: {
          50: '#fafafa',   // Pure white
          100: '#f4f4f5',  // Very light gray
          200: '#e4e4e7',  // Light gray
          300: '#d4d4d8',  // Medium light gray
          400: '#a1a1aa',  // Medium gray
          500: '#71717a',  // Base gray
          600: '#52525b',  // Dark gray
          700: '#3f3f46',  // Darker gray
          800: '#27272a',  // Very dark gray
          900: '#18181b',  // Almost black
          DEFAULT: '#ffffff', // Pure white
        },
        accent: {
          50: '#fff1f2',   // Very light pink-red
          100: '#ffe4e6',  // Light pink-red
          200: '#fecdd3',  // Lighter pink-red
          300: '#fda4af',  // Light pink-red
          400: '#fb7185',  // Medium pink-red
          500: '#f43f5e',  // Base pink-red
          600: '#e11d48',  // Accent red
          700: '#be123c',  // Dark pink-red
          800: '#9f1239',  // Darker pink-red
          900: '#881337',  // Very dark pink-red
          DEFAULT: '#e11d48', // Accent red
        },
        // Success, Warning, Error colors that complement red theme
        success: {
          DEFAULT: '#10b981', // Emerald green
          light: '#d1fae5',
          dark: '#047857',
        },
        warning: {
          DEFAULT: '#f59e0b', // Amber
          light: '#fef3c7',
          dark: '#d97706',
        },
        error: {
          DEFAULT: '#ef4444', // Red (matches primary)
          light: '#fee2e2',
          dark: '#b91c1c',
        },
        // Nigerian flag inspired colors as alternatives
        nigeria: {
          green: '#008751',
          white: '#ffffff',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Poppins', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'red': '0 4px 14px 0 rgba(220, 38, 38, 0.15)',
        'red-lg': '0 10px 25px 0 rgba(220, 38, 38, 0.2)',
        'red-xl': '0 20px 40px 0 rgba(220, 38, 38, 0.25)',
        'glow': '0 0 20px rgba(220, 38, 38, 0.3)',
        'glow-lg': '0 0 40px rgba(220, 38, 38, 0.4)',
      },
      animation: {
        'pulse-red': 'pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-red': 'bounce-red 1s infinite',
        'shine': 'shine 2s linear infinite',
      },
      keyframes: {
        'pulse-red': {
          '0%, 100%': {
            opacity: '1',
            boxShadow: '0 0 0 0 rgba(220, 38, 38, 0.7)',
          },
          '50%': {
            opacity: '.8',
            boxShadow: '0 0 0 10px rgba(220, 38, 38, 0)',
          },
        },
        'bounce-red': {
          '0%, 100%': {
            transform: 'translateY(-25%)',
            animationTimingFunction: 'cubic-bezier(0.8,0,1,1)',
          },
          '50%': {
            transform: 'none',
            animationTimingFunction: 'cubic-bezier(0,0,0.2,1)',
          },
        },
        'shine': {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
}

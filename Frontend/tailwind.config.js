/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#000000',
          900: '#030303',
          850: '#080808',
          800: '#0c0c0c',
          750: '#121212',
          700: '#18181b',
          600: '#27272a',
        },
        border: {
          subtle: '#141414',
          DEFAULT: '#1a1a1a',
          hover: '#27272a',
          focus: '#3f3f46',
        },
        brand: {
          DEFAULT: '#22c55e',
          hover: '#16a34a',
          muted: 'rgba(34, 197, 94, 0.12)',
          glow: 'rgba(34, 197, 94, 0.25)',
        },
        urgency: {
          critical: '#ef4444',
          high: '#f97316',
          medium: '#eab308',
          low: '#22c55e',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'glow-sm': '0 0 15px -3px rgba(34, 197, 94, 0.15)',
        'glow-md': '0 0 25px -5px rgba(34, 197, 94, 0.2)',
        'card': '0 0 0 1px rgba(255, 255, 255, 0.05)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}

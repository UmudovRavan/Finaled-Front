/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#D946EF',
          hover: '#C026D3',
          active: '#A21CAF',
          container: '#18181B',
          'on-primary': '#FFFFFF'
        },
        fuchsia: {
          500: '#D946EF',
          600: '#C026D3',
          700: '#A21CAF'
        },
        canvas: '#121214',
        card: '#18181B',
        'card-header': '#141416',
        sidebar: '#18181B',
        input: '#121214',
        modal: '#1C1C1E',
        'modal-header': '#141416',
        border: {
          DEFAULT: '#27272A',
          subtle: '#2C2C2E',
          hover: '#3F3F46',
          focus: '#D946EF'
        },
        text: {
          main: '#F4F4F5',
          white: '#FFFFFF',
          muted: '#A1A1AA',
          dim: '#71717A'
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['IBM Plex Sans', 'Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'Consolas', 'monospace']
      },
      boxShadow: {
        fuchsia: '0 4px 14px 0 rgba(217, 70, 239, 0.25)',
        card: '0 4px 20px 0 rgba(0, 0, 0, 0.4)'
      }
    }
  },
  plugins: [],
}

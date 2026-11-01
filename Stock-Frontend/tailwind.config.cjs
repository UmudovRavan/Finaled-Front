/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        crm: {
          sidebarDark: "#18181B",
          sidebarLight: "#FFFFFF",
          borderDark: "#27272A",
          borderLight: "#E4E4E7",
          bgDark: "#0F1117",
          bgLight: "#F8F9FA",
          cardDark: "#18181B",
          cardLight: "#FFFFFF",
          textMutedDark: "#A1A1AA",
          textMutedLight: "#71717A",
        },
        stock: {
          pink: "#FF00A8",
          magenta: "#D946EF",
          blue: "#0284C7",
          purple: "#9333EA",
        },
        primary: {
          DEFAULT: "#6366F1",
          hover: "#4F46E5",
          light: "#EEF2FF",
          dark: "#4338CA",
        },
      },
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Text",
          "SF Pro Display",
          "Inter",
          "system-ui",
          "sans-serif",
        ],
      },
      boxShadow: {
        soft: '0 2px 10px -1px rgba(0, 0, 0, 0.05)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
        dropdown: '0 10px 30px -5px rgba(0, 0, 0, 0.25)',
      }
    },
  },
  plugins: [],
}

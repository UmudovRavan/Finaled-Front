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
                primary: {
                    DEFAULT: "#6366F1",
                    hover: "#4F46E5",
                    light: "#EEF2FF",
                    dark: "#4338CA",
                },
                accent: {
                    DEFAULT: "#0EA5E9",
                    hover: "#0284C7",
                },
                background: {
                    light: "#F8FAFC",
                    dark: "#0B0F19",
                },
                surface: {
                    light: "#FFFFFF",
                    dark: "#111827",
                    darker: "#0F172A",
                    card: "#161F30",
                    border: "#1F293D",
                },
                status: {
                    success: "#10B981",
                    warning: "#F59E0B",
                    danger: "#EF4444",
                    info: "#38BDF8",
                }
            },
            fontFamily: {
                sans: ["Inter", "system-ui", "sans-serif"],
            },
            boxShadow: {
                soft: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                card: '0 10px 30px -5px rgba(0, 0, 0, 0.25)',
                glow: '0 0 25px -5px rgba(99, 102, 241, 0.3)',
            }
        },
    },
    plugins: [
        require('@tailwindcss/forms'),
    ],
}

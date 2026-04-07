export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  future: {
    disableColorOpacityUtilitiesByDefault: true,
  },
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
      },
    },
  },
  corePlugins: {
    colorOpacity: false,
  },
  safelist: [
    // Explicitly safe list common Tailwind utilities to prevent OKLch generation
    { pattern: /^(bg|text|border)-(slate|teal)-(50|100|200|300|400|500|600|700|800|900)$/ },
    { pattern: /^(hover|focus|dark):.*/ },
  ],
  plugins: [],
};



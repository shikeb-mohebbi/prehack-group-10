/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        bg:     "rgb(var(--c-bg)     / <alpha-value>)",
        panel:  "rgb(var(--c-panel)  / <alpha-value>)",
        panel2: "rgb(var(--c-panel2) / <alpha-value>)",
        border: "rgb(var(--c-border) / <alpha-value>)",
        muted:  "rgb(var(--c-muted)  / <alpha-value>)",
        fg:     "rgb(var(--c-fg)     / <alpha-value>)",
        accent: {
          DEFAULT: "#e11d48",
          glow:    "#f43f5e",
        },
        primary: {
          DEFAULT: "#e11d48",
          dark:    "#9f1239",
        },
        brand: {
          DEFAULT: "#f43f5e",
          dark:    "#e11d48",
        },
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "grad-primary": "linear-gradient(135deg, #e11d48 0%, #9f1239 100%)",
        "grad-brand":   "linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)",
        "grad-dark":    "linear-gradient(160deg, #0d0d16 0%, #07070e 100%)",
        "grad-glass":   "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
      },
      boxShadow: {
        glow:    "0 10px 40px -10px rgba(225,29,72,0.55)",
        "glow-sm": "0 4px 20px -4px rgba(225,29,72,0.40)",
        "glow-xs": "0 2px 12px -2px rgba(225,29,72,0.30)",
        "inner-glow": "inset 0 1px 0 rgba(255,255,255,0.06)",
      },
      keyframes: {
        "fade-in": {
          "0%":   { opacity: 0, transform: "translateY(6px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in .3s ease-out",
      },
    },
  },
  plugins: [],
};

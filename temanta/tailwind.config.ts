import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "rgb(var(--ink) / <alpha-value>)",
        paper: "rgb(var(--paper) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        inverse: "rgb(var(--inverse) / <alpha-value>)",
        "inverse-fg": "rgb(var(--inverse-fg) / <alpha-value>)",
        ok: {
          fg: "rgb(var(--ok-fg) / <alpha-value>)",
          bg: "rgb(var(--ok-bg) / <alpha-value>)",
          fill: "rgb(var(--ok-fill) / <alpha-value>)",
        },
        danger: {
          fg: "rgb(var(--danger-fg) / <alpha-value>)",
          bg: "rgb(var(--danger-bg) / <alpha-value>)",
        },
        warn: {
          fg: "rgb(var(--warn-fg) / <alpha-value>)",
          bg: "rgb(var(--warn-bg) / <alpha-value>)",
          ink: "rgb(var(--warn-ink) / <alpha-value>)",
        },
        brand: {
          DEFAULT: "#FF6600",
          dark: "#E05500",
          deep: "#8F3300",
          light: "rgb(var(--brand-light) / <alpha-value>)",
          50: "rgb(var(--brand-50) / <alpha-value>)",
          700: "#B84200",
          ontint: "rgb(var(--brand-ontint) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-jakarta)", "Inter", "system-ui", "Segoe UI", "Arial", "sans-serif"],
      },
      borderRadius: {
        sm: "6px",
        DEFAULT: "8px",
        md: "10px",
        lg: "14px",
        xl: "18px",
      },
      container: { center: true, padding: "1rem" },
      boxShadow: {
        card: "0 1px 2px rgb(var(--shadow) / .05), 0 1px 3px rgb(var(--shadow) / .05)",
        hover: "0 12px 28px -10px rgb(var(--shadow) / .20)",
        header: "0 1px 0 rgb(var(--shadow) / .06)",
        float: "0 10px 34px rgb(var(--shadow) / .14)",
        inset: "inset 0 1px 0 rgb(var(--shadow-soft) / .06)",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        scan: {
          "0%": { transform: "translateY(-2rem)", opacity: "0" },
          "15%": { opacity: "1" },
          "85%": { opacity: "1" },
          "100%": { transform: "translateY(10rem)", opacity: "0" },
        },
      },
      animation: {
        "fade-up": "fade-up .45s cubic-bezier(.16,.84,.44,1) both",
        "fade-in": "fade-in .3s ease-out both",
        shimmer: "shimmer 1.6s infinite",
        scan: "scan 2.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
} satisfies Config;

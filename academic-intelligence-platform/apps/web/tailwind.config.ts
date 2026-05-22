import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        canvas: "#f4f6f8",
        panel: "#ffffff",
        ink: "#111827",
        muted: "#6b7280",
        accent: "#0f766e",
        warn: "#b45309",
        danger: "#b91c1c",
      },
      fontFamily: {
        sans: ["'Sora'", "ui-sans-serif", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
} satisfies Config;

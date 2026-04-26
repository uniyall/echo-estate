import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        terracotta: "#d97757",
        "terracotta-dark": "#b85f42",
        sand: "#f5efe7",
        cream: "#faf8f5",
        "beige-light": "#ebe1d4",
        beige: "#d4c4b0",
        "beige-dark": "#c4b09d",
        "beige-divider": "#e5d9c9",
        "text-primary": "#3d3028",
        "text-heading": "#2a1f15",
        "text-secondary": "#6b5d4f",
      },
      fontFamily: {
        display: ["var(--font-lora)", "serif"],
        body: ["var(--font-crimson-pro)", "serif"],
      },
      boxShadow: {
        card: "0 4px 12px rgba(61, 48, 40, 0.08)",
        "card-hover": "0 8px 24px rgba(61, 48, 40, 0.15)",
        "card-accent": "0 12px 32px rgba(217, 119, 87, 0.2)",
      },
    },
  },
  plugins: [],
};
export default config;

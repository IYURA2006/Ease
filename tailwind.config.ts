import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF8F5",
        surface: "#FFFFFF",
        "text-primary": "#1C1917",
        "text-secondary": "#78716C",
        sage: "#84A98C",
        amber: "#D4A017",
        "dusty-rose": "#C4776A",
        "deep-red": "#9B2335",
        teal: "#2D6A6A",
        "captions-bg": "#1C1917",
        "captions-text": "#FFFFFF",
      },
      fontFamily: {
        playfair: ["var(--font-playfair)", "serif"],
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;

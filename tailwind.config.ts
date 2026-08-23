import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: "#FAFAF7",
          alt: "#F2F1ED",
        },
        surface: "#FFFFFF",
        ink: {
          DEFAULT: "#1A1A1A",
          secondary: "#5C5C5C",
          tertiary: "#8A8A85",
        },
        border: {
          DEFAULT: "#E4E3DE",
          strong: "#CDCCC7",
        },
        accent: {
          DEFAULT: "#1B4332",
          light: "#2D6A4F",
          bg: "#F0F7F4",
        },
        positive: "#1B7A41",
        negative: "#B33A2A",
        "neutral-badge": "#92630D",
        mock: {
          bg: "#0C1017",
          surface: "#151A23",
          border: "#2A3040",
          text: "#E8E8E8",
          muted: "#8B95A5",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["Playfair Display", "Georgia", "Times New Roman", "serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
      fontSize: {
        "hero": ["4.5rem", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        "hero-mobile": ["2.5rem", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "section": ["2.75rem", { lineHeight: "1.15", letterSpacing: "-0.02em" }],
        "section-mobile": ["1.875rem", { lineHeight: "1.2", letterSpacing: "-0.015em" }],
      },
      maxWidth: {
        "content": "1200px",
        "narrow": "720px",
      },
      spacing: {
        "section": "7rem",
        "section-mobile": "4rem",
      },
    },
  },
  plugins: [],
};

export default config;

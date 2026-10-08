import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 三农主题色：农田绿 + 麦穗金
        farm: {
          50: "#f0f9f0",
          100: "#dcf0dc",
          200: "#bbe0bb",
          300: "#8bc88b",
          400: "#57a857",
          500: "#3a8c3a",
          600: "#2c6f2c",
          700: "#255825",
          800: "#1f461f",
          900: "#1a3a1a",
        },
        wheat: {
          50: "#fdf8ed",
          100: "#f9eecb",
          200: "#f2da93",
          300: "#ebc05b",
          400: "#e5a933",
          500: "#d48a1e",
          600: "#b96916",
          700: "#964c15",
          800: "#7b3d18",
          900: "#673318",
        },
      },
      fontFamily: {
        sans: ["system-ui", "-apple-system", "PingFang SC", "Microsoft YaHei", "sans-serif"],
      },
      backgroundImage: {
        "farm-gradient": "linear-gradient(135deg, #2c6f2c 0%, #1a3a1a 100%)",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(16px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;

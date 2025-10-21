import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#EA580C",
          light: "#FB923C",
          dark: "#C2410C"
        },
        accent: "#FDBA74",
        muted: "rgba(255, 255, 255, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;

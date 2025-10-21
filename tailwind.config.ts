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
          DEFAULT: "#1B4332",
          light: "#2D6A4F"
        },
        accent: "#40916C",
        muted: "#F1F3F5"
      }
    }
  },
  plugins: []
};

export default config;

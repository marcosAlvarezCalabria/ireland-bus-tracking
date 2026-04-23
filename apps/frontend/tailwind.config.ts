import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#78aa36",
        accent: "#486621"
      }
    }
  },
  plugins: []
} satisfies Config;

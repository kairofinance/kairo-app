import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        "garet-heavy": ["Garet-Heavy", "sans-serif"],
        garet: ["Garet-Book", "sans-serif"],
        montserrat: ["Montserrat", "sans-serif"],
      },
      colors: {
        kairo: {
          green: {
            DEFAULT: "#89f95e", // a0
            a20: "#99fa72",
            a40: "#a8fb85",
            a60: "#b6fc97",
            a80: "#c4fda9",
            a100: "#d0feba",
          },
          black: {
            DEFAULT: "#121212", // a0
            a20: "#282828",
            a40: "#3f3f3f",
            a60: "#575757",
            a80: "#717171",
            a100: "#8b8b8b",
          },
          white: "#ffffff",
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};

export default config;

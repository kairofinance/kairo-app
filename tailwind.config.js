/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./auth/**/*.{js,ts,jsx,tsx}",
    "./providers/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class", // This enables the class-based dark mode
  theme: {
    extend: {
      animation: {
        "change-text": "changeText 6s infinite",
      },
      keyframes: {
        changeText: {
          "0%, 45%": { content: '"Stream"' },
          "50%, 95%": { content: '"Invoice"' },
        },
      },
    },
  },
  plugins: [
    // Add any plugins you're using here
  ],
};

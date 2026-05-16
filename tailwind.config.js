/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        terminal: {
          green: "#39FF14",
          "green-dim": "#1FA80B",
          amber: "#FFAA00",
          "amber-dim": "#9E6A00",
          black: "#000000",
          surface: "#0A0A0A",
          border: "#1F1F1F",
          text: "#F5F5F5",
          muted: "#8A8A8A",
        },
      },
      fontFamily: {
        mono: ["SpaceMono", "Menlo", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};

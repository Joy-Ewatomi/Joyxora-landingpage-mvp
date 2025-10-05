/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        joyxora: {
          // 🔹 Core brand
          black: "#000000",
          dark: "#0A0A0A",         // main dark background
          gray: "#1F1F1F",         // section background
          green: "#00FF88",        // neon green accent
          greenSoft: "#4ADE80",    // softer success green
          greenDark: "#065F46",    // deep green for hover

          // 🔹 Text
          white: "#FFFFFF",
          textLight: "#E5E7EB",    // light text
          textMuted: "#9CA3AF",    // muted gray text

          // 🔹 Accents
          blue: "#3B82F6",         // links / info
          purple: "#8B5CF6",       // creative highlights
          red: "#EF4444",          // errors / danger
          orange: "#F97316",       // warnings
          yellow: "#FACC15",       // alerts

          // 🔹 Special Gradients
          gradientFrom: "#00FF88", // start neon green
          gradientTo: "#3B82F6",   // fade into blue
        },
      },
    },
  },
  plugins: [],
};


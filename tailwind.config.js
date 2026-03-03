/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        asuo: {
          green: "#0f4c3a",
          gold: "#FFD200",
          ink: "#0f172a",
          slate: "#334155",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Space Grotesk", "system-ui", "sans-serif"],
        serif: ["Playfair Display", "serif"],
      },
      boxShadow: {
        soft: "0 12px 30px rgba(15, 23, 42, 0.12)",
        glow: "0 0 0 1px rgba(15, 76, 58, 0.12), 0 20px 40px rgba(15, 76, 58, 0.08)",
      },
    },
  },
  plugins: [require("@tailwindcss/typography")],
};

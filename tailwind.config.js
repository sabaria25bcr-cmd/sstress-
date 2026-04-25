/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0a0c",
        surface: "rgba(255, 255, 255, 0.05)",
        primary: "#6366f1",
        secondary: "#a855f7",
        accent: "#83A6CE",
        highlight: "#C48CB3",
        lightUI: "#F5F3F7",
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}

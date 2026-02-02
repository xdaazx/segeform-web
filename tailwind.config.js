/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'segeform-green': '#4b5320', // Verde militar institucional
        'segeform-gold': '#b8860b',  // Dorado del escudo
      },
    },
  },
  plugins: [],
}
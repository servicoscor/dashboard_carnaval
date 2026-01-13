/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cor-bg-primary': '#0a0a1a',
        'cor-bg-secondary': '#1a1a3a',
        'cor-accent-orange': '#FF6B35',
        'cor-accent-pink': '#FF3D91',
        'cor-accent-purple': '#7B68EE',
        'cor-accent-green': '#00D4AA',
      },
    },
  },
  plugins: [],
}

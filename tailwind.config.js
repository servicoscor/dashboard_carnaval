/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Cores base - Pantone 7693C (#004976)
        'cor-bg-primary': '#002a45',      // Versao mais escura para fundo principal
        'cor-bg-secondary': '#004976',    // Pantone 7693C - azul COR
        'cor-bg-tertiary': '#005a8c',     // Versao mais clara para hovers
        // Cores de destaque
        'cor-accent-orange': '#FF6B35',
        'cor-accent-pink': '#FF3D91',
        'cor-accent-purple': '#7B68EE',
        'cor-accent-green': '#00D4AA',
        'cor-accent-blue': '#004976',     // Pantone 7693C
      },
    },
  },
  plugins: [],
}

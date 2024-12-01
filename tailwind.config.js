/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 15s linear infinite',
      },
      fontFamily: {
        'aurora': ['Orbitron', 'sans-serif'],
      },
      colors: {
        'aurora': {
          purple: '#8B5CF6',
          pink: '#EC4899',
          blue: '#3B82F6',
        },
      },
      backgroundImage: {
        'aurora-gradient': 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
      }
    },
  },
  plugins: [],
}
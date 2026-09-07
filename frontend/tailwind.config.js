/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fef2f2',
          100: '#ffe1e1',
          200: '#ffc8c8',
          300: '#ffa1a1',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#c92127', // Official Corporate Technologies Crimson Red
          800: '#b91c1c',
          900: '#991b1b',
          red: '#c92127',
          'red-hover': '#b91c1c',
          'red-light': '#fef2f2',
          primary: '#c92127', // Corporate Technologies signature red
          dark: '#1e293b',
          navy: '#0f172a',
          cyan: '#0ea5e9',
          amber: '#f97316',
          accent: '#c92127'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Hind Siliguri', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 2px 10px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
        'glow-red': '0 0 20px rgba(225, 29, 72, 0.35)',
        'glow-blue': '0 0 20px rgba(14, 165, 233, 0.35)',
      }
    },
  },
  plugins: [],
}

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        body: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        cream: {
          50: '#FDFBF7',
          100: '#F9F5ED',
          200: '#F2EAD8',
        },
        forest: {
          400: '#4A7C59',
          500: '#3A6147',
          600: '#2C4A36',
          700: '#1E3325',
          800: '#121F17',
          900: '#0A1410',
        },
        gold: {
          300: '#E8C97A',
          400: '#D4A843',
          500: '#B8891E',
        },
        blush: {
          100: '#F5E8E4',
          200: '#EAC9C0',
          300: '#D9A090',
        }
      },
      animation: {
        'fade-up': 'fadeUp 0.5s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}


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
        cafe: {
          50: '#FDFBF7',
          100: '#F7F3E9',
          200: '#EFE7D4',
          300: '#DFCDB0',
          400: '#C8A87C',
          500: '#B8860B', // Golden Amber
          600: '#9B6D08',
          700: '#7B5206',
          800: '#5C3C05',
          900: '#3D2703',
          950: '#1F1301',
        },
        primary: {
          DEFAULT: '#D97706', // Warm Amber
          hover: '#B45309',
          light: '#FEF3C7',
          dark: '#92400E',
        },
        surface: {
          50: '#FAF8F5',
          100: '#F5F0EB',
          200: '#EBE3DA',
          800: '#1F1B16',
          900: '#14120E',
          950: '#0C0A08',
        },
        food: {
          veg: '#16A34A',
          nonVeg: '#DC2626',
          egg: '#D97706',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Cabinet Grotesk', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 25px -5px rgba(217, 119, 6, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.3)',
        'premium': '0 10px 30px -10px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'sheet': '0 -10px 25px -5px rgba(0, 0, 0, 0.15)',
      },
      borderRadius: {
        '3xl': '1.75rem',
        '4xl': '2.25rem',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        }
      }
    },
  },
  plugins: [],
}

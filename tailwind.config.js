/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Archivo', 'sans-serif'],
        'body': ['Assistant', 'sans-serif'],
        'sans': ['Assistant', 'sans-serif'],
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
      },
      colors: {
        'dark_moss_green': {
          DEFAULT: '#606c38',
          100: '#13160b',
          200: '#262b16',
          300: '#394121',
          400: '#4c562c',
          500: '#606c38',
          600: '#88994f',
          700: '#a9b876',
          800: '#c5d0a3',
          900: '#e2e7d1'
        },
        'pakistan_green': {
          DEFAULT: '#283618',
          100: '#080b05',
          200: '#101509',
          300: '#18200e',
          400: '#1f2a13',
          500: '#283618',
          600: '#547133',
          700: '#80ac4d',
          800: '#aac987',
          900: '#d5e4c3'
        },
        'cornsilk': {
          DEFAULT: '#fefae0',
          100: '#5d5103',
          200: '#baa206',
          300: '#f8dc27',
          400: '#fbeb84',
          500: '#fefae0',
          600: '#fefbe7',
          700: '#fefced',
          800: '#fffdf3',
          900: '#fffef9'
        },
        'earth_yellow': {
          DEFAULT: '#dda15e',
          50: '#fef7ed',
          100: '#fef2e2',
          200: '#fde4c4',
          300: '#fbd5a6',
          400: '#f9c688',
          500: '#dda15e',
          600: '#c4914d',
          700: '#ab813c',
          800: '#92712b',
          900: '#79611a'
        },
        'tiger_s_eye': {
          DEFAULT: '#bc6c25',
          50: '#fef7ed',
          100: '#fef2e2',
          200: '#fde4c4',
          300: '#fbd5a6',
          400: '#f9c688',
          500: '#bc6c25',
          600: '#a85e20',
          700: '#94501b',
          800: '#804216',
          900: '#6c3411'
        }
      }
    },
  },
  plugins: [],
};
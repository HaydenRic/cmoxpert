/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  future: {
    hoverOnlyWhenSupported: true,
  },
  theme: {
    extend: {
      fontFamily: {
        'heading': ['Inter', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
        'sans': ['Inter', 'sans-serif'],
      },
      animation: {
        spotlight: "spotlight 2s ease .75s 1 forwards",
        'gradient': 'gradient 8s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in': 'fadeIn 1s ease-in',
        'slide-up': 'slideUp 0.6s ease-out',
        'scale-in': 'scaleIn 0.5s ease-out',
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
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        fadeIn: {
          'from': { opacity: '0', transform: 'translateY(20px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          'from': { opacity: '0', transform: 'translateY(30px)' },
          'to': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          'from': { opacity: '0', transform: 'scale(0.9)' },
          'to': { opacity: '1', transform: 'scale(1)' },
        },
      },
      colors: {
        // Professional B2B SaaS Color Palette
        'charcoal': {
          DEFAULT: '#0A0908',
          50: '#F8F8F8',
          100: '#F1F1F1',
          200: '#E4E4E4',
          300: '#D7D7D7',
          400: '#CACACA',
          500: '#BDBDBD',
          600: '#8A8A8A',
          700: '#575757',
          800: '#2E2E2E',
          900: '#0A0908'
        },
        'slate_blue': {
          DEFAULT: '#22333B',
          50: '#F7F8F9',
          100: '#EEF1F3',
          200: '#D5DCE1',
          300: '#BBC7CF',
          400: '#889DAB',
          500: '#557387',
          600: '#4D687A',
          700: '#405661',
          800: '#334449',
          900: '#22333B'
        },
        'cream': {
          DEFAULT: '#EAE0D5',
          50: '#FEFDFB',
          100: '#FDF9F6',
          200: '#F9F1E8',
          300: '#F5E9DA',
          400: '#EDE1D6',
          500: '#EAE0D5',
          600: '#D4C4B5',
          700: '#BEA895',
          800: '#A88C75',
          900: '#927055'
        },
        'tan': {
          DEFAULT: '#C6AC8F',
          50: '#FDFCFA',
          100: '#FAF7F3',
          200: '#F3EDE5',
          300: '#ECE3D7',
          400: '#DDD0BB',
          500: '#C6AC8F',
          600: '#B29B81',
          700: '#9E8A73',
          800: '#8A7965',
          900: '#766857'
        },
        'olive': {
          DEFAULT: '#5E503F',
          50: '#F9F8F6',
          100: '#F3F0ED',
          200: '#E1DAD2',
          300: '#CFC4B7',
          400: '#AB9E81',
          500: '#87784B',
          600: '#7A6C43',
          700: '#6B5F3B',
          800: '#5E503F',
          900: '#4A3F32'
        },
        // Keep existing colors for backward compatibility
        'dark_moss_green': {
          DEFAULT: '#22333B',
          100: '#F7F8F9',
          200: '#EEF1F3',
          300: '#D5DCE1',
          400: '#BBC7CF',
          500: '#22333B',
          600: '#1E2F36',
          700: '#1A2B31',
          800: '#16272C',
          900: '#122327'
        },
        'pakistan_green': {
          DEFAULT: '#0A0908',
          100: '#F8F8F8',
          200: '#F1F1F1',
          300: '#E4E4E4',
          400: '#D7D7D7',
          500: '#0A0908',
          600: '#090807',
          700: '#080706',
          800: '#070605',
          900: '#060504'
        },
        'cornsilk': {
          DEFAULT: '#EAE0D5',
          100: '#FDFCFA',
          200: '#FAF7F3',
          300: '#F3EDE5',
          400: '#ECE3D7',
          500: '#EAE0D5',
          600: '#D4C4B5',
          700: '#BEA895',
          800: '#A88C75',
          900: '#927055'
        },
        'earth_yellow': {
          DEFAULT: '#C6AC8F',
          50: '#FDFCFA',
          100: '#FAF7F3',
          200: '#F3EDE5',
          300: '#ECE3D7',
          400: '#DDD0BB',
          500: '#C6AC8F',
          600: '#B29B81',
          700: '#9E8A73',
          800: '#8A7965',
          900: '#766857'
        },
        'tiger_s_eye': {
          DEFAULT: '#5E503F',
          50: '#F9F8F6',
          100: '#F3F0ED',
          200: '#E1DAD2',
          300: '#CFC4B7',
          400: '#AB9E81',
          500: '#5E503F',
          600: '#554839',
          700: '#4C4033',
          800: '#43382D',
          900: '#3A3027'
        }
      }
    },
  },
  plugins: [],
};
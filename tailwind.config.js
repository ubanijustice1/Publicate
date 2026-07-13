/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5465ff',
          50: '#eef0ff',
          100: '#e0e3ff',
          200: '#c5caff',
          300: '#9ea6ff',
          400: '#7a85ff',
          500: '#5465ff',
          600: '#3d3ff5',
          700: '#3230d9',
          800: '#2b2caf',
          900: '#292c8a',
        },
        accent: {
          DEFAULT: '#f97316',
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 2px 10px 0 rgba(30, 41, 59, 0.06)',
        card: '0 6px 24px -8px rgba(30, 41, 59, 0.1)',
        float: '0 12px 40px -12px rgba(30, 41, 59, 0.18)',
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
    },
  },
  plugins: [],
}

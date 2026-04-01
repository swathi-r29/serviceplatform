module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        amber: {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
        },
        cream: '#fef3c7',
        charcoal: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        primary: {
          50: '#fdf2e9',
          100: '#fae5d3',
          200: '#f6cba6',
          300: '#f1b078',
          400: '#ed9b55',
          500: '#e67e22',
          600: '#d35400',
          700: '#a04000',
          800: '#6e2c00',
          900: '#3d1800',
        },
        'provider-brown': '#b67a29',
        'theme-bg': 'rgb(249, 244, 238)',
      },
      fontFamily: {
        'lato': ['Lato', 'sans-serif'],
        'playfair': ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};


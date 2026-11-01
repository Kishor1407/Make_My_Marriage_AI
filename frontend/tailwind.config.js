/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#C81E38',
        'primary-dark': '#9E1B32',
        'primary-container': '#C81E38',
        'on-primary': '#ffffff',
        'obsidian': '#0A0A0C',
        'surface-dark': '#121214',
        'secondary': '#2A2A2E',
        'carmine': '#C81E38',
        'carmine-deep': '#9E1B32',
        'carmine-light': '#FFDAD9',
        'surface': '#FAF9F8',
        'surface-container': '#F4F3F0',
        'surface-container-low': '#FAF9F8',
        'surface-container-lowest': '#ffffff',
        'surface-container-high': '#EAE9E5',
        'surface-container-highest': '#DFDED9',
        'on-surface': '#121214',
        'on-surface-variant': '#52525B',
        'outline': '#D4D4D8',
        'outline-variant': '#E4E4E7',
        'tertiary': '#C81E38',
        'tertiary-container': '#9E1B32',
        'error': '#BA1A1A',
        'error-container': '#FFDAD6'
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        sm: '0.25rem',
        md: '0.5rem',
        lg: '0.5rem',
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px'
      },
      spacing: {
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '1rem',
        'space-lg': '1.5rem',
        'space-xl': '2.5rem',
        gutter: '1.5rem',
        'gutter-mobile': '1rem',
        margin: '2rem',
        'margin-mobile': '1rem'
      },
      fontFamily: {
        editorial: ['Playfair Display', 'serif'],
        display: ['Plus Jakarta Sans', 'sans-serif'],
        headline: ['Playfair Display', 'serif'],
        body: ['Plus Jakarta Sans', 'sans-serif']
      }
    }
  },
  plugins: []
};

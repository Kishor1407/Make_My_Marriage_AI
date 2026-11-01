/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#FFFFFF',
        surface: '#FFFFFF',
        'surface-bright': '#FFFFFF',
        'surface-dim': '#F8F8FA',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#FAFAFA',
        'surface-container': '#F8F9FA',
        'surface-container-high': '#F1F3F5',
        'surface-container-highest': '#E9ECEF',
        'surface-variant': '#F4F4F6',
        primary: '#C81E38',
        'primary-container': '#C81E38',
        'primary-crimson': '#C81E38',
        'crimson-dark': '#9E1B32',
        'crimson-deep': '#680014',
        'primary-fixed': '#FFDAD9',
        'primary-fixed-dim': '#FFB3B3',
        secondary: '#5F5E60',
        'secondary-container': '#F3F4F6',
        outline: '#E5E7EB',
        'outline-variant': '#E5E7EB',
        'on-surface': '#0A0A0C',
        'on-surface-variant': '#52525B',
        'on-primary': '#FFFFFF',
        'on-background': '#0A0A0C',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Hanken Grotesk', 'Inter', 'sans-serif'],
        editorial: ['Bodoni Moda', 'Playfair Display', 'serif'],
        headline: ['Bodoni Moda', 'Playfair Display', 'serif'],
        display: ['Bodoni Moda', 'Playfair Display', 'serif'],
        body: ['Plus Jakarta Sans', 'Hanken Grotesk', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      }
    },
  },
  plugins: [],
};

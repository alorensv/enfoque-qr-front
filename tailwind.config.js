/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      // Alias del color primario (emerald) para acciones/estados activos.
      // Mapea a la escala emerald de Tailwind para tener todas las tonalidades.
      colors: {
        primary: {
          DEFAULT: '#059669',
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
        },
      },
      boxShadow: {
        xs: '0 1px 2px rgba(15,23,42,.04)',
        soft: '0 1px 3px rgba(15,23,42,.06), 0 1px 2px rgba(15,23,42,.04)',
        card: '0 4px 12px rgba(15,23,42,.06)',
      },
    },
  },
  plugins: [],
};

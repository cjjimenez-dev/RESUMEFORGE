/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--background) / <alpha-value>)',
        foreground: 'rgb(var(--foreground) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        surfaceHover: 'rgb(var(--surface-hover) / <alpha-value>)',
        border: 'rgb(var(--border) / <alpha-value>)',
        primary: 'rgb(var(--primary) / <alpha-value>)',
        primaryHover: 'rgb(var(--primary-hover) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        display: ['Outfit', 'sans-serif']
      }
    },
  },
  plugins: [],
}

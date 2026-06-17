/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bgStart: '#0f172a',
        bgEnd: '#020617',
        cardBg: 'rgba(30, 41, 59, 0.5)',
        borderDark: 'rgba(255, 255, 255, 0.08)',
        borderHover: 'rgba(255, 255, 255, 0.15)',
        primary: '#ea580c',
        primaryHover: '#c2410c',
        textMain: '#f8fafc',
        textMuted: '#94a3b8',
        textDim: '#64748b'
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

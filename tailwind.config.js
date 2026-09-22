/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      colors: {
        cream: '#FFFCF3',
        ink: '#2B1F26',
        muted: '#7A6A72',
        // Una tinta per categoria: riconoscibile a colpo d'occhio sul calendario
        cat: {
          agenda: '#F5B301',   // giallo  - il colore dell'app, impegni e appuntamenti
          trips: '#2E7DD1',    // blu     - viaggi
          places: '#E8833A',   // arancio - ristoranti e bar
          goals: '#E8638C',    // rosa    - achievement
          outings: '#17A398',  // turchese- uscite e avventure
          screen: '#8B5CF6',   // viola   - cinema e serie
          custom: '#A6192E',   // rosso   - categorie create da voi
        },
      },
      boxShadow: {
        soft: '0 8px 30px -12px rgba(43,31,38,0.25)',
        lift: '0 18px 40px -18px rgba(43,31,38,0.45)',
      },
      keyframes: {
        'float-up': {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0' },
          '15%': { opacity: '1' },
          '100%': { transform: 'translateY(-120px) scale(1.1)', opacity: '0' },
        },
        twinkle: {
          '0%,100%': { opacity: '0.2', transform: 'scale(0.7)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'pop-in': {
          '0%': { transform: 'scale(0.85)', opacity: '0' },
          '60%': { transform: 'scale(1.03)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'float-up': 'float-up 3s ease-out forwards',
        twinkle: 'twinkle 2.4s ease-in-out infinite',
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards',
        shimmer: 'shimmer 2.5s linear infinite',
      },
    },
  },
  plugins: [],
}

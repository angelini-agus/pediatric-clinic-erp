import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      /* ── Paleta "Consultorio Martinangelio" (única vigente) ──
         Las escalas de iteraciones anteriores (brand/primary/accent/
         surface/shell/status/landing/coral/butter) se removieron en la
         limpieza final: no tenían uso en el código activo. */
      colors: {
        paper: '#F4EEDF',
        cream: '#F4EEDF',
        mustard: '#F4C43F',
        sage: '#AEC17A',
        pink: '#F3A9C0',
        lavender: '#C9B8EA',
        teal: '#86C6CB',
        sky: '#8CD7F2',
        choco: {
          DEFAULT: '#241D15',
          heading: '#3A2A1B',
          secondary: '#6B5F52',
        },
      },

      /* ── Spacing semántico para ritmo vertical ── */
      spacing: {
        'section-xs': '3.5rem',
        'section-sm': '5rem',
        'section-md': '7rem',
        'section-lg': '9rem',
        'section-xl': '11rem',
      },

      borderRadius: {
        card: '28px',
      },

      fontFamily: {
        // `--font-heading` (Fraunces), `--font-body` (Nunito Sans),
        // `--font-script` (Pacifico) definidas en index.astro.
        display: ['var(--font-heading)', ...defaultTheme.fontFamily.serif],
        heading: ['var(--font-heading)', ...defaultTheme.fontFamily.serif],
        script: ['var(--font-script)', 'cursive'],
        sans: ['var(--font-body)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [],
};

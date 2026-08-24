import defaultTheme from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#6366f1',
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          500: '#6366f1',
          600: '#4f46e5',
          700: '#4338ca',
          800: '#3730a3',
          900: '#312e81',
        },
        status: {
          scheduled: '#6366f1',
          canceled: '#ef4444',
          inProgress: '#f59e0b',
        },
        shell: '#F4F5F8',
        primary: {
          50: 'hsl(238, 100%, 97%)',
          100: 'hsl(238, 100%, 93%)',
          200: 'hsl(238, 100%, 85%)',
          300: 'hsl(238, 100%, 73%)',
          400: 'hsl(238, 100%, 64%)',
          500: 'hsl(238, 84%, 67%)',
          600: 'hsl(243, 75%, 59%)',
          700: 'hsl(245, 58%, 51%)',
          800: 'hsl(246, 54%, 41%)',
          900: 'hsl(248, 53%, 31%)',
        },
        accent: {
          50: 'hsl(168, 80%, 96%)',
          100: 'hsl(168, 80%, 90%)',
          200: 'hsl(168, 80%, 79%)',
          300: 'hsl(168, 80%, 65%)',
          400: 'hsl(168, 80%, 48%)',
          500: 'hsl(168, 80%, 37%)',
          600: 'hsl(168, 80%, 29%)',
          700: 'hsl(168, 80%, 23%)',
          800: 'hsl(168, 80%, 18%)',
          900: 'hsl(168, 80%, 13%)',
        },
        surface: {
          DEFAULT: '#f8f9fc',
          50: '#f8f9fc',
          100: '#f1f3f9',
          200: '#e4e7f2',
          300: '#d1d6e8',
        },
        /* ── Landing page teal palette (medical trust) ── */
        landing: {
          50: '#e6f5f5',
          100: '#c2e7e8',
          200: '#8bd0d2',
          300: '#4db8bb',
          400: '#1a9da1',
          500: '#0c7075',
          600: '#0a5e62',
          700: '#084d50',
          800: '#063b3e',
          900: '#042a2c',
          950: '#0a2c2e',
        },

        /* ── Warm "paper" background token ──
           Reemplaza blanco puro (#fff) y grises fríos (#f8f9fc, #F4F5F8).
           Base cálida para fondo de documento, navbar glass, y respiración
           entre secciones. AA con ink-500, AAA con ink-700. */
        paper: '#FBF8F2',

        /* ── Coral warm accent (alternating section bg, highlights) ──
           50–100: bg de sección suave / pastel muy claro
           500:    bg de sección saturado o íconos CTA secundarios
           700:    bg de botón (texto blanco) — blanco sobre 500 no pasa AA */
        coral: {
          50:  '#FFE9DF',
          100: '#FFD4C2',
          200: '#FFB199',
          300: '#FF9A7D',
          400: '#FF8765',
          500: '#FF7A5A',
          600: '#E5684A',
          700: '#B8523A',
          800: '#8A3F2E',
          900: '#5C2B20',
        },

        /* ── Butter warm accent (alternating section bg) ──
           Mismo rol que coral pero para variar el ritmo cromático
           entre secciones. 500 = #FFD37A. */
        butter: {
          50:  '#FFF7E3',
          100: '#FFEDC2',
          200: '#FFE39B',
          300: '#FFD989',
          400: '#FFCE7C',
          500: '#FFD37A',
          600: '#E5B765',
          700: '#B8924E',
          800: '#8A6E3B',
          900: '#5C4A28',
        },

        /* ── Ink scale (navy unificado) ──
           Centraliza los 3 navy inline que ya usaba el sitio:
           - #0F1C36 (Footer, Turnos bg) → ink-900
           - #1B2A41 (texto principal)  → ink-700
           - #16192a (AboutDoctor bg)   → ink-800
           */
        ink: {
          50:  '#F4F6FB',
          100: '#E4E9F2',
          200: '#C8D2E3',
          300: '#9CACCC',
          400: '#6E7D9A',
          500: '#475573',
          600: '#2E3B57',
          700: '#1B2A41',
          800: '#16192a',
          900: '#0F1C36',
          950: '#0A1424',
        },
      },

      /* ── Spacing semántico para ritmo vertical ──
         Las secciones usan hoy py-24 lg:py-32 uniformemente (grilla clínica).
         Próximo paso: cada sección elige uno distinto para romper monotonía. */
      spacing: {
        'section-xs': '3.5rem',
        'section-sm': '5rem',
        'section-md': '7rem',
        'section-lg': '9rem',
        'section-xl': '11rem',
      },

      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card-shell': '0 20px 60px -10px rgba(99, 102, 241, 0.12), 0 8px 32px -4px rgba(0, 0, 0, 0.08)',
        'pill-active': '0 2px 8px 0 rgba(99, 102, 241, 0.20), 0 1px 3px 0 rgba(0,0,0,0.06)',
        glass: '0 4px 16px 0 rgba(99, 102, 241, 0.08)',
        'landing-badge': '0 8px 30px -4px rgba(12, 112, 117, 0.18), 0 2px 8px rgba(0,0,0,0.06)',

        /* ── Sombras tintadas cálidas ──
           Mismo recurso que card-shell/landing-badge (tinta del color del
           elemento, no negro plano), ahora en tono coral. warm-card replica
           la sombra de las tarjetas flotantes del hero. */
        'warm-sm': '0 1px 2px rgba(27,42,65,0.04), 0 2px 8px -2px rgba(255,122,90,0.10)',
        'warm-md': '0 4px 12px -2px rgba(27,42,65,0.08), 0 8px 24px -6px rgba(255,122,90,0.18)',
        'warm-lg': '0 16px 48px -12px rgba(27,42,65,0.16), 0 8px 24px -8px rgba(255,122,90,0.22)',
        'warm-card': '0 24px 64px -16px rgba(27,42,65,0.18), 0 4px 16px -4px rgba(190,227,248,0.35)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontFamily: {
        // `--font-bricolage` y `--font-jakarta` definidas en index.astro (Google Fonts).
        display: ['var(--font-bricolage)', ...defaultTheme.fontFamily.sans],
        sans: ['var(--font-jakarta)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-badge': 'floatBadge 4s ease-in-out infinite',
        'float-badge-delay': 'floatBadge 4s 2s ease-in-out infinite',
        float: 'float 5s ease-in-out infinite',
        'float-delayed': 'float 5s ease-in-out infinite 2.5s',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
        floatBadge: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-8px)' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
      },
    },
  },
  plugins: [],
};
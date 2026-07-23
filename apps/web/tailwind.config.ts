import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
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
        shell: '#DFE2EE',
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
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        'card-shell': '0 20px 60px -10px rgba(99, 102, 241, 0.12), 0 8px 32px -4px rgba(0, 0, 0, 0.08)',
        'pill-active': '0 2px 8px 0 rgba(99, 102, 241, 0.20), 0 1px 3px 0 rgba(0,0,0,0.06)',
        glass: '0 4px 16px 0 rgba(99, 102, 241, 0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { transform: 'translateY(8px)', opacity: '0' }, '100%': { transform: 'translateY(0)', opacity: '1' } },
      },
    },
  },
  plugins: [],
};

export default config;

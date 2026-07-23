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
          DEFAULT: '#2563eb',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
        status: {
          scheduled: '#0284c7',
          canceled: '#ef4444',
          inProgress: '#f59e0b',
        },
        primary: {
          50: 'hsl(210, 100%, 97%)',
          100: 'hsl(210, 100%, 93%)',
          200: 'hsl(210, 100%, 85%)',
          300: 'hsl(210, 100%, 73%)',
          400: 'hsl(210, 100%, 60%)',
          500: 'hsl(210, 100%, 50%)',
          600: 'hsl(210, 100%, 42%)',
          700: 'hsl(210, 100%, 34%)',
          800: 'hsl(210, 100%, 18%)',
          950: 'hsl(210, 100%, 10%)',
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
          DEFAULT: 'hsl(220, 20%, 98%)',
          50: 'hsl(220, 20%, 98%)',
          100: 'hsl(220, 20%, 95%)',
          200: 'hsl(220, 15%, 91%)',
          300: 'hsl(220, 12%, 85%)',
        },
      },
      boxShadow: {
        soft: '0 2px 15px -3px rgba(0, 0, 0, 0.07), 0 10px 20px -2px rgba(0, 0, 0, 0.04)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'pill-active': '0 2px 8px 0 rgba(37, 99, 235, 0.12), 0 1px 3px 0 rgba(0,0,0,0.08)',
      },
      borderRadius: {
        '4xl': '2rem',
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
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
};

export default config;

import type { Config } from 'tailwindcss';

const config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      colors: {
        orange: {
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'orb-float': 'orb-float 3s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.3), inset 0 0 20px rgba(249, 115, 22, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(249, 115, 22, 0.6), inset 0 0 30px rgba(249, 115, 22, 0.2)',
          },
        },
        'orb-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      backdropFilter: {
        'frosted-sm': 'blur(8px)',
        'frosted-md': 'blur(12px)',
        'frosted-lg': 'blur(16px)',
      },
    },
  },
  plugins: [],
} satisfies Config;

export default config;

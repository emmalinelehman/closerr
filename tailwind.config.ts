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
          50: '#fef5ef',
          100: '#fed8c5',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
        },
        cyan: {
          400: '#22d3ee',
          500: '#00d9f9',
          600: '#00bcd4',
        },
        emerald: {
          400: '#34d399',
          500: '#00d97a',
          600: '#059669',
        },
        pink: {
          500: '#ff006e',
          600: '#db0a5c',
        },
        amber: {
          500: '#ffa500',
          600: '#f59e0b',
        },
        neutral: {
          0: '#ffffff',
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
          950: '#0f0f0f',
        },
        // Dark theme colors
        dark: {
          bg: '#1a1a1a',
          'bg-secondary': '#262626',
          'bg-tertiary': '#333333',
          text: '#f5f5f5',
          'text-secondary': '#d0d0d0',
          'text-tertiary': '#a0a0a0',
          border: '#333333',
          'border-light': '#4a4a4a',
        },
      },
      animation: {
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-gentle': 'pulse-gentle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
        'glow-cyan': 'glow-cyan 3s ease-in-out infinite',
        'orb-float': 'orb-float 3s ease-in-out infinite',
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 200ms ease-out',
        'bounce-light': 'bounce-light 0.6s ease-in-out',
        'spin-slow': 'spin-slow 8s linear infinite',
      },
      keyframes: {
        'pulse-gentle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        'glow-pulse': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(249, 115, 22, 0.3), inset 0 0 20px rgba(249, 115, 22, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(249, 115, 22, 0.6), inset 0 0 30px rgba(249, 115, 22, 0.2)',
          },
        },
        'glow-cyan': {
          '0%, 100%': {
            boxShadow: '0 0 20px rgba(0, 217, 249, 0.3), inset 0 0 20px rgba(0, 217, 249, 0.1)',
          },
          '50%': {
            boxShadow: '0 0 40px rgba(0, 217, 249, 0.6), inset 0 0 30px rgba(0, 217, 249, 0.2)',
          },
        },
        'orb-float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(8px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'bounce-light': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' },
        },
        'spin-slow': {
          'from': { transform: 'rotate(0deg)' },
          'to': { transform: 'rotate(360deg)' },
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

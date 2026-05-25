/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'reflect-bg': 'var(--reflect-bg)',
        'reflect-surface': 'var(--reflect-surface)',
        'reflect-card': 'var(--reflect-card)',
        'reflect-border': 'var(--reflect-border)',
        'reflect-accent': 'var(--reflect-accent)',
        'reflect-text': 'var(--reflect-text)',
        'reflect-muted': 'var(--reflect-muted)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        reflect: '12px',
      },
      transitionDuration: {
        reflect: '200ms',
      },
      transitionTimingFunction: {
        reflect: 'ease',
      },
      keyframes: {
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'slide-up': 'slide-up 200ms ease forwards',
        'fade-in': 'fade-in 300ms ease forwards',
      },
    },
  },
  plugins: [],
};

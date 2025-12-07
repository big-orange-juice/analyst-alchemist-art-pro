import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
    './store/**/*.{js,ts,jsx,tsx,mdx}',
    './contexts/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        'cp-black': 'var(--cp-black)',
        'cp-dark': 'var(--cp-dark)',
        'cp-dim': 'var(--cp-dim)',
        'cp-deep': 'var(--cp-deep)',
        'cp-gray': 'var(--cp-gray)',
        'cp-text': 'var(--cp-text)',
        'cp-text-muted': 'var(--cp-text-muted)',
        'cp-yellow': 'var(--cp-yellow)',
        'cp-cyan': 'var(--cp-cyan)',
        'cp-red': 'var(--cp-red)',
        'cp-border': 'var(--cp-border)'
      },
      fontFamily: {
        sans: ['Space Grotesk', 'Noto Sans SC', 'Inter', 'sans-serif'],
        serif: ['Noto Serif SC', 'Space Grotesk', 'Noto Sans SC', 'serif'],
        mono: ['JetBrains Mono', 'Space Grotesk', 'monospace'],
        display: ['Noto Serif SC', 'Space Grotesk', 'Noto Sans SC', 'serif'],
        oxanium: ['Space Grotesk', 'Noto Sans SC', 'Inter', 'sans-serif']
      },
      animation: {
        'pulse-fast': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' }
        }
      }
    }
  },
  plugins: []
};

export default config;

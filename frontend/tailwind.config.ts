import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'cobalt-signal': '#002fff',
        'pure-white': '#ffffff',
        graphite: '#171717',
        carbon: '#070707',
        ink: '#000000',
        fog: '#ededed',
        mist: '#b9b9b9',
        dove: '#c3c3c3',
        iron: '#696969',
        parchment: '#ebe3d6',
        'cobalt-mist': '#00368c',
      },
      fontFamily: {
        vipnagorgialla: ['Vipnagorgialla', 'sans-serif'],
        retro: ['Fraunces', 'Recife', 'Ogg', '"Cooper Black"', 'serif'],
        serif: ['"EB Garamond"', '"Cormorant Garamond"', 'Fraunces', 'Georgia', 'serif'],
        sans: ['Inter', '"Graphik Medium"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      fontSize: {
        caption: ['11px', { lineHeight: '1.2', letterSpacing: '0px' }],
        body: ['15px', { lineHeight: '1.5', letterSpacing: '-0.26px' }],
        'heading-sm': ['22px', { lineHeight: '1.2', letterSpacing: '-0.46px' }],
        heading: ['34px', { lineHeight: '1.0', letterSpacing: '-1.02px' }],
        'heading-lg': ['40px', { lineHeight: '1.0', letterSpacing: '-0.88px' }],
        display: ['64px', { lineHeight: '0.9', letterSpacing: '-1.15px' }],
        'display-massive': ['150px', { lineHeight: '0.85', letterSpacing: '-0.067em' }],
      },
      borderRadius: {
        cards: '20px',
        pills: '100px',
        images: '30px',
        inputs: '15px',
        buttons: '10px',
      },
      boxShadow: {
        subtle: 'rgba(255, 255, 255, 0.15) 0px 0px 0px 1px inset',
      },
      maxWidth: {
        editorial: '1200px',
      },
      spacing: {
        'section-gap': '50px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'steam-rise': {
          '0%': { opacity: '0', transform: 'translateY(0) scaleX(1)' },
          '50%': { opacity: '0.6', transform: 'translateY(-30px) scaleX(1.1)' },
          '100%': { opacity: '0', transform: 'translateY(-60px) scaleX(0.8)' },
        },
        'pulse-soft': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.7s ease-out forwards',
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'steam-1': 'steam-rise 3s ease-in-out infinite',
        'steam-2': 'steam-rise 3.5s ease-in-out 0.5s infinite',
        'steam-3': 'steam-rise 4s ease-in-out 1s infinite',
        'pulse-soft': 'pulse-soft 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;

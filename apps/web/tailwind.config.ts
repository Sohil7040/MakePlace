import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['var(--font-space-grotesk)', 'Space Grotesk', 'sans-serif'],
        body: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
        sans: ['var(--font-plus-jakarta)', 'Plus Jakarta Sans', 'sans-serif'],
      },
      colors: {
        obsidian: {
          DEFAULT: '#121214',
          deep: '#121214',
          surface: '#1A1A1E',
        },
        cream: {
          DEFAULT: '#FBF9F6',
          offset: '#F4F0E6',
        },
        vermillion: {
          DEFAULT: '#FF4500',
          dark: '#E63900',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      boxShadow: {
        'accent-glow': '0 0 24px rgba(255, 69, 0, 0.18), 0 0 48px rgba(255, 69, 0, 0.08)',
        'accent-glow-sm': '0 0 12px rgba(255, 69, 0, 0.14)',
        'card-elevated': '0 1px 0 rgba(255, 255, 255, 0.04) inset, 0 8px 32px rgba(0, 0, 0, 0.35)',
        'portfolio-card': '0 1px 0 rgba(0, 0, 0, 0.04), 0 4px 24px rgba(26, 26, 30, 0.06)',
      },
      backgroundImage: {
        'dashboard-grid':
          'linear-gradient(rgba(255, 69, 0, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 69, 0, 0.03) 1px, transparent 1px)',
        'dashboard-radial':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255, 69, 0, 0.08), transparent)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

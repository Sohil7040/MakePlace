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
        'label-md': ['var(--font-plus-jakarta)', 'sans-serif'],
        'body-md': ['var(--font-plus-jakarta)', 'sans-serif'],
        'headline-md': ['var(--font-space-grotesk)', 'sans-serif'],
        'headline-lg': ['var(--font-space-grotesk)', 'sans-serif'],
        'display-lg': ['var(--font-space-grotesk)', 'sans-serif'],
      },
      fontSize: {
        'label-sm': ['12px', { lineHeight: '1.4', letterSpacing: '0.04em', fontWeight: '500' }],
        'label-md': ['14px', { lineHeight: '1.4', letterSpacing: '0.02em', fontWeight: '600' }],
        'body-sm': ['14px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
        'body-lg': ['18px', { lineHeight: '1.6', fontWeight: '400' }],
        'title-lg': ['20px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-md': ['24px', { lineHeight: '1.3', fontWeight: '600' }],
        'headline-lg': ['40px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-lg-mobile': ['32px', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '600' }],
        'display-lg': ['64px', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '700' }],
      },
      spacing: {
        'container-margin': '40px',
        'sidebar-width': '280px',
      },
      colors: {
        // Core charcoal/white palette (Obsidian and Architectural Cream aligned)
        charcoal: {
          DEFAULT: '#121214',
          50: '#F5F5F7',
          100: '#E8E8ED',
          200: '#D1D1D6',
          300: '#AEAEB2',
          400: '#86868B',
          500: '#636366',
          600: '#48484A',
          700: '#3A3A3C',
          800: '#2C2C2E',
          900: '#121214',
        },
        // Accent orange — used sparingly
        accent: {
          DEFAULT: '#FF4500',
          light: '#FF6B33',
          dark: '#E63E00',
          muted: '#FFF0EB',
        },
        // Legacy aliases for backward compatibility
        obsidian: {
          DEFAULT: '#121214',
          deep: '#0E0E10',
          surface: '#18181B',
        },
        cream: {
          DEFAULT: '#F9F6F0',
          offset: '#F2EEE5',
        },
        vermillion: {
          DEFAULT: '#FF4500',
          dark: '#E63E00',
        },
        // Stitch Design System Colors — updated to charcoal
        'primary-container': '#1C1C1E',
        surface: '#FFFFFF',
        'surface-dim': '#F5F5F7',
        'surface-container-lowest': '#FFFFFF',
        'surface-container-low': '#FAFAFA',
        'surface-container': '#F5F5F7',
        'surface-container-high': '#E8E8ED',
        'on-surface': '#1C1C1E',
        'on-surface-variant': '#636366',
        'outline-variant': '#D1D1D6',
        'secondary-container': '#F5F5F7',
        'on-secondary-container': '#1C1C1E',
        'surface-variant': '#E8E8ED',
        tertiary: '#005daa',
        // Shadcn variables
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
        'accent-glow': '0 0 24px rgba(255, 69, 0, 0.12), 0 0 40px rgba(255, 69, 0, 0.04)',
        'accent-glow-sm': '0 0 10px rgba(255, 69, 0, 0.10)',
        'card-elevated': '0 2px 10px rgba(0, 0, 0, 0.03), 0 8px 30px rgba(0, 0, 0, 0.02)',
        'card-hover': '0 6px 30px rgba(0, 0, 0, 0.06), 0 2px 4px rgba(0, 0, 0, 0.03)',
        'portfolio-card': '0 2px 8px rgba(0, 0, 0, 0.02), 0 6px 24px rgba(0, 0, 0, 0.02)',
        'soft': '0 2px 8px rgba(0, 0, 0, 0.03)',
        'medium': '0 4px 16px rgba(0, 0, 0, 0.05)',
      },
      backgroundImage: {
        'dashboard-grid':
          'linear-gradient(rgba(0, 0, 0, 0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.01) 1px, transparent 1px)',
        'dashboard-radial':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0, 0, 0, 0.02), transparent)',
      },
      backgroundSize: {
        grid: '48px 48px',
      },
      keyframes: {
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in-up': 'fade-in-up 0.5s ease-out',
        'pulse-dot': 'pulse-dot 1.5s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;

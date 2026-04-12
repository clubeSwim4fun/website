import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
    'bg-gray-100',
    'py-16',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '86rem',
        lg: '64rem',
        md: '48rem',
        sm: '40rem',
        xl: '80rem',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
        blueSwim: 'hsl(var(--blue-swim))',
        // ── Brand design system tokens ──
        deep: 'hsl(var(--deep))',
        mid: 'hsl(var(--mid))',
        light: 'hsl(var(--light))',
        pale: 'hsl(var(--pale))',
        foam: 'hsl(var(--foam))',
        sand: 'hsl(var(--sand))',
        coral: {
          DEFAULT: 'hsl(var(--coral))',
          light: 'hsl(var(--coral-light))',
        },
        amber: {
          DEFAULT: 'hsl(var(--amber))',
          light: 'hsl(var(--amber-light))',
        },
        green: {
          DEFAULT: 'hsl(var(--green))',
          light: 'hsl(var(--green-light))',
          dark: 'hsl(var(--green-dark))',
        },
        ink: {
          DEFAULT: 'hsl(var(--ink))',
          mid: 'hsl(var(--ink-mid))',
          light: 'hsl(var(--ink-light))',
        },
        'swim-border': 'hsl(var(--swim-border))',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
        sans: ['var(--font-dm-sans)', 'DM Sans', 'sans-serif'],
        syne: ['var(--font-syne)', 'Syne', 'sans-serif'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: '800',
                marginTop: 'unset',
                marginBottom: '0.25em',
                fontSize: '2.5rem',
              },
              h2: {
                marginTop: 'unset',
                marginBottom: 'unset',
                fontSize: '1.75rem',
                fontWeight: '700',
              },
              h3: {
                marginBottom: 'unset',
                marginTop: 'unset',
                fontSize: '1.375rem',
                fontWeight: '700',
              },
              h4: {
                marginTop: 'unset',
                marginBottom: 'unset',
                fontSize: '1.125rem',
                fontWeight: '600',
              },
              p: {},
            },
          ],
        },
        base: {
          css: [
            {
              h1: { fontSize: '2.5rem' },
              h2: { fontSize: '1.75rem' },
              h3: { fontSize: '1.375rem' },
              h4: { fontSize: '1.125rem' },
            },
          ],
        },
        md: {
          css: [
            {
              h1: { fontSize: '3.5rem' },
              h2: { fontSize: '2rem' },
              h3: { fontSize: '1.5rem' },
              h4: { fontSize: '1.25rem' },
            },
          ],
        },
      }),
    },
  },
}

export default config

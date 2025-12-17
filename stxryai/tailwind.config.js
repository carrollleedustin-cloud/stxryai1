/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'var(--color-border)' /* white-10 */,
        input: 'var(--color-input)' /* white-10 */,
        ring: 'var(--color-ring)' /* purple-500 */,
        background: 'var(--color-background)' /* custom-dark */,
        foreground: 'var(--color-foreground)' /* slate-50 */,
        primary: {
          DEFAULT: 'var(--color-primary)' /* purple-800 */,
          foreground: 'var(--color-primary-foreground)' /* slate-50 */,
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)' /* purple-500 */,
          foreground: 'var(--color-secondary-foreground)' /* custom-dark */,
        },
        accent: {
          DEFAULT: 'var(--color-accent)' /* amber-500 */,
          foreground: 'var(--color-accent-foreground)' /* custom-dark */,
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)' /* red-500 */,
          foreground: 'var(--color-destructive-foreground)' /* slate-50 */,
        },
        success: {
          DEFAULT: 'var(--color-success)' /* emerald-500 */,
          foreground: 'var(--color-success-foreground)' /* slate-50 */,
        },
        warning: {
          DEFAULT: 'var(--color-warning)' /* amber-500 */,
          foreground: 'var(--color-warning-foreground)' /* custom-dark */,
        },
        error: {
          DEFAULT: 'var(--color-error)' /* red-500 */,
          foreground: 'var(--color-error-foreground)' /* slate-50 */,
        },
        muted: {
          DEFAULT: 'var(--color-muted)' /* custom-surface */,
          foreground: 'var(--color-muted-foreground)' /* slate-400 */,
        },
        card: {
          DEFAULT: 'var(--color-card)' /* custom-surface */,
          foreground: 'var(--color-card-foreground)' /* slate-50 */,
        },
        popover: {
          DEFAULT: 'var(--color-popover)' /* custom-surface */,
          foreground: 'var(--color-popover-foreground)' /* slate-50 */,
        },
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Inter', 'sans-serif'],
        caption: ['Source Sans Pro', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'elevation-1': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
      },
      backdropBlur: {
        glass: '12px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      transitionDuration: {
        smooth: '300ms',
        micro: '150ms',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};

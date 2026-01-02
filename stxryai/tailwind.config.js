/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '475px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
      // T-shirt sizes for better semantic naming
      'mobile': '475px',
      'tablet': '768px',
      'laptop': '1024px',
      'desktop': '1280px',
      'wide': '1536px',
      'ultra-wide': '1920px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '1.5rem',
        md: '2rem',
        lg: '2.5rem',
        xl: '3rem',
        '2xl': '4rem',
      },
      screens: {
        'xs': '475px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1400px',
        '3xl': '1600px',
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
      fontSize: {
        // Fluid typography scale
        'fluid-xs': 'clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)',
        'fluid-sm': 'clamp(0.875rem, 0.8rem + 0.375vw, 1rem)',
        'fluid-base': 'clamp(1rem, 0.9rem + 0.5vw, 1.125rem)',
        'fluid-lg': 'clamp(1.125rem, 1rem + 0.625vw, 1.25rem)',
        'fluid-xl': 'clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem)',
        'fluid-2xl': 'clamp(1.5rem, 1.3rem + 1vw, 2rem)',
        'fluid-3xl': 'clamp(2rem, 1.7rem + 1.5vw, 2.5rem)',
        'fluid-4xl': 'clamp(2.5rem, 2rem + 2vw, 3rem)',
        'fluid-5xl': 'clamp(3rem, 2.3rem + 2.5vw, 4rem)',
        'fluid-6xl': 'clamp(4rem, 3rem + 3vw, 5rem)',
      },
      spacing: {
        // Fluid spacing scale
        'fluid-1': 'clamp(0.25rem, 0.2rem + 0.25vw, 0.5rem)',
        'fluid-2': 'clamp(0.5rem, 0.4rem + 0.5vw, 0.75rem)',
        'fluid-3': 'clamp(0.75rem, 0.6rem + 0.75vw, 1rem)',
        'fluid-4': 'clamp(1rem, 0.8rem + 1vw, 1.5rem)',
        'fluid-5': 'clamp(1.5rem, 1.2rem + 1.5vw, 2rem)',
        'fluid-6': 'clamp(2rem, 1.6rem + 2vw, 3rem)',
        'fluid-8': 'clamp(3rem, 2.4rem + 3vw, 4rem)',
        'fluid-10': 'clamp(4rem, 3.2rem + 4vw, 5rem)',
        'fluid-12': 'clamp(5rem, 4rem + 5vw, 6rem)',
      },
      boxShadow: {
        'elevation-1': '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        'elevation-2': '0 20px 25px -5px rgba(0, 0, 0, 0.4)',
        'elevation-3': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        'glow-sm': '0 0 10px rgba(0, 245, 212, 0.3)',
        'glow-md': '0 0 20px rgba(0, 245, 212, 0.4)',
        'glow-lg': '0 0 30px rgba(0, 245, 212, 0.5)',
        'glow-xl': '0 0 40px rgba(0, 245, 212, 0.6)',
      },
      backdropBlur: {
        glass: '12px',
        'glass-heavy': '20px',
      },
      transitionTimingFunction: {
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
        elastic: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      },
      transitionDuration: {
        smooth: '300ms',
        micro: '150ms',
        macro: '500ms',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 3s infinite',
        'spin-slow': 'spin 8s linear infinite',
        'ping-slow': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};

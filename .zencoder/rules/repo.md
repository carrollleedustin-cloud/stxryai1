---
description: Repository Information Overview
alwaysApply: true
---

# StxryAI Information

## Summary
StxryAI is a modern Next.js 14 application built with TypeScript and Tailwind CSS. It's a comprehensive story creation and reading platform with social features, gamification, premium monetization, and AI-powered enhancements. The application includes user authentication, Supabase database integration, Stripe payment processing, and is deployed on Netlify.

## Structure

### Main Directories
- **`src/app/`** - Next.js App Router pages and layouts (landing page, authentication, story-library, story-reader, story-creation-studio, user-dashboard, community-hub, etc.)
- **`src/components/`** - Reusable React components organized by feature (auth, story, social, ads, ui, gamification, etc.)
- **`src/services/`** - Business logic services (storyService, authService, userActivityService, analyticsService, etc.)
- **`src/lib/`** - Utility libraries and helper functions (auth, api, storage, supabase, stripe, etc.)
- **`src/contexts/`** - React Context providers (AuthContext, ThemeContext)
- **`src/hooks/`** - Custom React hooks
- **`src/types/`** - TypeScript type definitions and database schemas
- **`src/styles/`** - Global CSS and Tailwind configuration
- **`public/`** - Static assets
- **`supabase/`** - Database migrations and configuration

## Language & Runtime
**Language**: TypeScript  
**Node Version**: 20 (specified in netlify.toml)  
**Runtime**: Node.js  
**Target**: ES2017  
**Build System**: Next.js 14 with custom webpack configuration  
**Package Manager**: npm

## Dependencies

### Main Dependencies
- **next** (^14.2.33) - React framework for production
- **react** (18.2.0) - UI library
- **react-dom** (18.2.0) - React DOM bindings
- **tailwindcss** (3.4.6) - CSS framework
- **@supabase/supabase-js** (^2.39.0) - Supabase client library
- **@supabase/auth-helpers-nextjs** (^0.15.0) - NextAuth integration
- **@stripe/stripe-js** (^4.9.0) - Stripe payment processing
- **recharts** (^2.15.2) - Data visualization library
- **framer-motion** (^12.23.25) - Animation library
- **lucide-react** (^0.268.0) - Icon library
- **date-fns** (^4.1.0) - Date utilities
- **posthog-js** (^1.217.0) - Analytics
- **resend** (^4.0.1) - Email service

### Development Dependencies
- **@typescript-eslint/eslint-plugin** (^8.29.0) - TypeScript linting
- **eslint** (^9) - Code linting
- **prettier** (^3.5.3) - Code formatting
- **jest** (^29.7.0) - Testing framework
- **@testing-library/react** (^16.1.0) - React testing utilities
- **@storybook/react** (^8.5.2) - Component documentation
- **tailwindcss-animate** (^1.0.7) - Tailwind animation utilities

## Build & Installation

```bash
npm install

npm run dev          # Start development server on port 4028
npm run build        # Build for production (includes type-check & lint)
npm run build:netlify # Build for Netlify deployment
npm run start        # Start development server
npm run serve        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
npm run format       # Format code with Prettier
npm run type-check   # Run TypeScript type checking
npm run populate-db  # Populate database with initial stories
```

## Deployment & Configuration

**Hosting**: Netlify  
**Configuration File**: `netlify.toml`  
**Build Command**: `npm run build:netlify`  
**Publish Directory**: `.next`  
**Node Version**: 20

**Environment Variables** (see `.env.example`):
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Database: `DATABASE_URL`
- Authentication: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- OAuth: Google, GitHub, Discord credentials
- Payments: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`
- Analytics: `NEXT_PUBLIC_GA_MEASUREMENT_ID`, `NEXT_PUBLIC_POSTHOG_KEY`
- Ads: `NEXT_PUBLIC_ADSENSE_CLIENT`
- Email: `RESEND_API_KEY`, `EMAIL_FROM`
- AI Services: OpenAI, Anthropic API keys

## Testing

**Framework**: Jest  
**Test Environment**: jsdom  
**Configuration**: `jest.config.ts`  
**Setup File**: `jest.setup.ts`  
**Coverage**: v8 provider

**Commands**:
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Generate coverage report
```

**Note**: Test infrastructure is configured but no test files currently exist in the codebase.

## Other Features

**Code Quality**:
- ESLint with TypeScript support
- Prettier code formatting
- Type checking with TypeScript (strict: false)

**Documentation**:
- Storybook component library (port 6006)
- Multiple feature documentation files

**Key Services**:
- Story creation and management
- User authentication with Supabase
- Payment processing with Stripe
- Analytics tracking (PostHog, Google Analytics)
- Email notifications (Resend)
- AI enhancements (story continuation, narrative generation)
- Content moderation
- Social features (friends, leaderboards, activity feed)
- Gamification system (achievements, badges, challenges)
- Performance monitoring and error tracking

## Performance Optimizations
- Image optimization with next/image (AVIF, WebP formats)
- Code splitting with custom webpack configuration
- Component lazy loading
- Netlify caching for static assets
- Disabled production source maps
- Optimized CSS with PostCSS and Autoprefixer

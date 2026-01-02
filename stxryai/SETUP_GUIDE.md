# StxryAI Platform Setup Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [Running Migrations](#running-migrations)
6. [Seeding Data](#seeding-data)
7. [Development Workflow](#development-workflow)
8. [Testing](#testing)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

- **Node.js** (v18 or higher)
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** (v14 or higher)
- **Git**

### Recommended Tools

- **VS Code** with extensions:
  - Svelte for VS Code
  - Prisma
  - ESLint
  - Prettier
- **Postman** or **Insomnia** for API testing
- **pgAdmin** or **TablePlus** for database management

---

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd stxryai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Create Environment File

```bash
cp .env.example .env
```

---

## Database Configuration

### 1. Create PostgreSQL Database

```sql
CREATE DATABASE stxryai_dev;
CREATE USER stxryai_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE stxryai_dev TO stxryai_user;
```

### 2. Configure Database URL

Update your `.env` file:

```env
DATABASE_URL="postgresql://stxryai_user:your_secure_password@localhost:5432/stxryai_dev"
```

---

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/stxryai_dev"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
SESSION_SECRET="your-session-secret-key"

# OpenAI API
OPENAI_API_KEY="sk-..."

# Application
NODE_ENV="development"
PORT=5173
PUBLIC_APP_URL="http://localhost:5173"

# Email (Optional for development)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"

# Storage (Optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="stxryai-assets"
AWS_REGION="us-east-1"
```

### Optional Variables

```env
# Analytics
GOOGLE_ANALYTICS_ID="G-XXXXXXXXXX"

# Feature Flags
ENABLE_FAMILY_FEATURES=true
ENABLE_CULTURAL_CONTENT=true
ENABLE_EARLY_LEARNING=true

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

---

## Running Migrations

### 1. Generate Prisma Client

```bash
npx prisma generate
```

### 2. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 3. Verify Database Schema

```bash
npx prisma studio
```

This opens a browser-based database GUI at `http://localhost:5555`

---

## Seeding Data

### 1. Run Seed Script

```bash
npm run seed
# or
npx prisma db seed
```

### 2. Verify Seeded Data

The seed script creates:
- Sample users (parent, child, educator)
- Cultural heritage data (Black, African, Caribbean)
- Age-appropriate content templates
- Sample stories and activities
- Family collaboration examples

### 3. Test Accounts

After seeding, you can log in with:

**Parent Account:**
- Email: `parent@example.com`
- Password: `password123`

**Educator Account:**
- Email: `educator@example.com`
- Password: `password123`

**Child Account:**
- Username: `child_user`
- PIN: `1234`

---

## Development Workflow

### 1. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### 2. Watch for Changes

The dev server automatically:
- Hot-reloads on file changes
- Compiles TypeScript
- Processes Svelte components
- Updates Tailwind CSS

### 3. Database Changes

When modifying the schema:

```bash
# 1. Update schema.prisma
# 2. Create migration
npx prisma migrate dev --name your_migration_name

# 3. Regenerate client
npx prisma generate
```

### 4. Code Quality

```bash
# Lint code
npm run lint

# Format code
npm run format

# Type check
npm run check
```

---

## Testing

### 1. Run All Tests

```bash
npm test
```

### 2. Run Specific Test Suites

```bash
# Unit tests
npm run test:unit

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e
```

### 3. Test Coverage

```bash
npm run test:coverage
```

### 4. Watch Mode

```bash
npm run test:watch
```

---

## Deployment

### Production Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Environment-Specific Builds

```bash
# Staging
NODE_ENV=staging npm run build

# Production
NODE_ENV=production npm run build
```

### Database Migration (Production)

```bash
# Deploy migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### Deployment Checklist

- [ ] Update environment variables
- [ ] Run database migrations
- [ ] Build application
- [ ] Run smoke tests
- [ ] Monitor error logs
- [ ] Verify critical features
- [ ] Check performance metrics

---

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors

**Problem:** `Can't reach database server`

**Solutions:**
- Verify PostgreSQL is running: `pg_isready`
- Check DATABASE_URL in `.env`
- Ensure database exists
- Verify user permissions

```bash
# Test connection
psql -U stxryai_user -d stxryai_dev -h localhost
```

#### 2. Migration Errors

**Problem:** `Migration failed to apply`

**Solutions:**
```bash
# Reset database (development only!)
npx prisma migrate reset

# Or manually fix
npx prisma migrate resolve --applied "migration_name"
```

#### 3. Prisma Client Out of Sync

**Problem:** `Type errors after schema changes`

**Solution:**
```bash
npx prisma generate
npm run check
```

#### 4. Port Already in Use

**Problem:** `Port 5173 is already in use`

**Solutions:**
```bash
# Find and kill process
lsof -ti:5173 | xargs kill -9

# Or use different port
PORT=3000 npm run dev
```

#### 5. OpenAI API Errors

**Problem:** `Invalid API key` or `Rate limit exceeded`

**Solutions:**
- Verify OPENAI_API_KEY in `.env`
- Check API quota and billing
- Implement rate limiting
- Use fallback content

#### 6. Build Errors

**Problem:** `Build failed` or `Type errors`

**Solutions:**
```bash
# Clear cache
rm -rf .svelte-kit node_modules
npm install

# Type check
npm run check

# Rebuild
npm run build
```

### Debug Mode

Enable detailed logging:

```env
DEBUG=true
LOG_LEVEL=debug
```

### Getting Help

1. Check documentation: `FAMILY_ENGAGEMENT_AND_CULTURAL_EMPOWERMENT.md`
2. Review code comments in source files
3. Search existing issues
4. Create detailed bug report with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details
   - Error messages and logs

---

## Additional Resources

### Documentation

- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

### Project Documentation

- `FAMILY_ENGAGEMENT_AND_CULTURAL_EMPOWERMENT.md` - Feature documentation
- `src/lib/family/familyCollaboration.ts` - Family features
- `src/lib/family/parentDashboard.ts` - Parent dashboard
- `src/lib/learning/earlyLearning.ts` - Early learning system
- `src/lib/cultural/empowerment.ts` - Cultural content

### Development Tools

```bash
# Database GUI
npx prisma studio

# API testing
npm run test:api

# Performance profiling
npm run profile

# Bundle analysis
npm run analyze
```

---

## Quick Reference

### Essential Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview build

# Database
npx prisma studio        # Database GUI
npx prisma migrate dev   # Run migrations
npx prisma generate      # Generate client
npm run seed             # Seed database

# Code Quality
npm run lint             # Lint code
npm run format           # Format code
npm run check            # Type check
npm test                 # Run tests

# Utilities
npm run clean            # Clean build artifacts
npm run reset            # Reset everything
```

### File Structure

```
stxryai/
├── src/
│   ├── lib/
│   │   ├── family/          # Family engagement features
│   │   ├── learning/        # Early learning system
│   │   ├── cultural/        # Cultural empowerment
│   │   └── components/      # Reusable components
│   ├── routes/              # SvelteKit routes
│   └── app.html             # HTML template
├── prisma/
│   ├── schema.prisma        # Database schema
│   ├── migrations/          # Migration files
│   └── seed.ts              # Seed script
├── static/                  # Static assets
├── tests/                   # Test files
└── docs/                    # Documentation
```

---

## Support

For additional help:
- Review inline code documentation
- Check troubleshooting section
- Consult feature documentation
- Contact development team

---

**Last Updated:** 2025
**Version:** 1.0.0

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
11. [Additional Resources](#additional-resources)

---

## Prerequisites

### Required Software

#### 1. Node.js (v18 or higher)
- **Download:** [https://nodejs.org/](https://nodejs.org/)
- **Verify Installation:**
  ```bash
  node --version  # Should show v18.x.x or higher
  npm --version   # Should show 9.x.x or higher
  ```
- **Recommended:** Use [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager) for easy version switching
  ```bash
  # Install nvm (macOS/Linux)
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
  
  # Install nvm (Windows)
  # Download from: https://github.com/coreybutler/nvm-windows/releases
  
  # Install Node.js v18
  nvm install 18
  nvm use 18
  ```

#### 2. Package Manager
Choose one of the following:
- **npm** (comes with Node.js) - [Documentation](https://docs.npmjs.com/)
- **yarn** - [Install Guide](https://yarnpkg.com/getting-started/install)
  ```bash
  npm install -g yarn
  ```
- **pnpm** (recommended for faster installs) - [Install Guide](https://pnpm.io/installation)
  ```bash
  npm install -g pnpm
  ```

#### 3. PostgreSQL (v14 or higher)
- **Download:** [https://www.postgresql.org/download/](https://www.postgresql.org/download/)
- **macOS (Homebrew):**
  ```bash
  brew install postgresql@14
  brew services start postgresql@14
  ```
- **Windows:** Download installer from [PostgreSQL Downloads](https://www.postgresql.org/download/windows/)
- **Linux (Ubuntu/Debian):**
  ```bash
  sudo apt update
  sudo apt install postgresql postgresql-contrib
  sudo systemctl start postgresql
  ```
- **Verify Installation:**
  ```bash
  psql --version  # Should show 14.x or higher
  ```
- **Alternative:** Use [Supabase](https://supabase.com/) for hosted PostgreSQL (free tier available)

#### 4. Git
- **Download:** [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **Verify Installation:**
  ```bash
  git --version
  ```
- **Configure Git:**
  ```bash
  git config --global user.name "Your Name"
  git config --global user.email "your.email@example.com"
  ```

### Recommended Tools

#### VS Code Extensions
Install [Visual Studio Code](https://code.visualstudio.com/) and these extensions:
- **Svelte for VS Code** - [Install](https://marketplace.visualstudio.com/items?itemName=svelte.svelte-vscode)
- **Prisma** - [Install](https://marketplace.visualstudio.com/items?itemName=Prisma.prisma)
- **ESLint** - [Install](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- **Prettier** - [Install](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- **Tailwind CSS IntelliSense** - [Install](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)
- **GitLens** - [Install](https://marketplace.visualstudio.com/items?itemName=eamodio.gitlens)

#### API Testing Tools
- **Postman** - [Download](https://www.postman.com/downloads/)
- **Insomnia** - [Download](https://insomnia.rest/download)
- **Thunder Client** (VS Code Extension) - [Install](https://marketplace.visualstudio.com/items?itemName=rangav.vscode-thunder-client)

#### Database Management
- **pgAdmin** - [Download](https://www.pgadmin.org/download/)
- **TablePlus** - [Download](https://tableplus.com/)
- **DBeaver** (Free) - [Download](https://dbeaver.io/download/)
- **Prisma Studio** (Built-in) - Included with Prisma

---

## Initial Setup

### 1. Clone the Repository

```bash
# Clone the repository
git clone <repository-url>
cd stxryai

# Or if using SSH
git clone git@github.com:username/stxryai.git
cd stxryai
```

**Troubleshooting:**
- If you get permission errors, ensure your SSH keys are set up: [GitHub SSH Guide](https://docs.github.com/en/authentication/connecting-to-github-with-ssh)
- For HTTPS authentication issues: [GitHub Token Guide](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

### 2. Install Dependencies

```bash
# Using npm (default)
npm install

# Using yarn
yarn install

# Using pnpm (faster, recommended)
pnpm install
```

**What gets installed:**
- SvelteKit framework
- Prisma ORM
- Tailwind CSS
- TypeScript
- Testing libraries (Jest, Playwright)
- AI/ML libraries (OpenAI SDK)
- Authentication libraries
- And 100+ other dependencies

**Expected time:** 2-5 minutes depending on your internet speed

**Troubleshooting:**
- If you get `EACCES` errors, don't use `sudo`. Fix npm permissions: [npm permissions guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
- For network errors, try: `npm config set registry https://registry.npmjs.org/`
- Clear cache if needed: `npm cache clean --force`

### 3. Create Environment File

```bash
# Copy the example file
cp .env.example .env

# On Windows (Command Prompt)
copy .env.example .env

# On Windows (PowerShell)
Copy-Item .env.example .env
```

**Next step:** Edit the `.env` file with your actual configuration values (see [Environment Variables](#environment-variables) section)

---

## Database Configuration

### Option 1: Local PostgreSQL Setup

#### Step 1: Access PostgreSQL

```bash
# macOS/Linux
sudo -u postgres psql

# Windows (if installed with default settings)
psql -U postgres

# Or use pgAdmin GUI
```

#### Step 2: Create Database and User

```sql
-- Create the database
CREATE DATABASE stxryai_dev;

-- Create a user with a secure password
CREATE USER stxryai_user WITH ENCRYPTED PASSWORD 'your_secure_password';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE stxryai_dev TO stxryai_user;

-- Grant schema privileges (PostgreSQL 15+)
\c stxryai_dev
GRANT ALL ON SCHEMA public TO stxryai_user;

-- Exit psql
\q
```

#### Step 3: Configure Database URL

Update your `.env` file:

```env
DATABASE_URL="postgresql://stxryai_user:your_secure_password@localhost:5432/stxryai_dev"
```

**Connection String Format:**
```
postgresql://[user]:[password]@[host]:[port]/[database]?[parameters]
```

### Option 2: Supabase (Hosted PostgreSQL)

1. **Create Account:** [https://supabase.com/](https://supabase.com/)
2. **Create New Project**
3. **Get Connection String:**
   - Go to Project Settings → Database
   - Copy the "Connection string" (URI format)
   - Use the "Connection pooling" string for better performance

```env
# Supabase connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

**Benefits of Supabase:**
- Free tier available (500MB database, 2GB bandwidth)
- Automatic backups
- Built-in authentication
- Real-time subscriptions
- No local PostgreSQL installation needed

### Option 3: Other Hosted Options

#### Neon
- **Website:** [https://neon.tech/](https://neon.tech/)
- **Free Tier:** 3GB storage, serverless PostgreSQL
- **Setup Guide:** [Neon Quickstart](https://neon.tech/docs/get-started-with-neon/signing-up)

#### Railway
- **Website:** [https://railway.app/](https://railway.app/)
- **Free Tier:** $5 credit/month
- **Setup Guide:** [Railway PostgreSQL](https://docs.railway.app/databases/postgresql)

#### Heroku Postgres
- **Website:** [https://www.heroku.com/postgres](https://www.heroku.com/postgres)
- **Free Tier:** 10,000 rows limit
- **Setup Guide:** [Heroku Postgres Guide](https://devcenter.heroku.com/articles/heroku-postgresql)

### Verify Database Connection

```bash
# Test connection with psql
psql "postgresql://stxryai_user:your_secure_password@localhost:5432/stxryai_dev"

# Or use Prisma
npx prisma db pull
```

---

## Environment Variables

### Required Variables

```env
# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://user:password@localhost:5432/stxryai_dev"
# Get from: Local PostgreSQL or Supabase/Neon/Railway

# ============================================
# AUTHENTICATION
# ============================================
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

SESSION_SECRET="your-session-secret-key"
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# ============================================
# OPENAI API
# ============================================
OPENAI_API_KEY="sk-..."
# Get from: https://platform.openai.com/api-keys
# Pricing: https://openai.com/pricing
# Free trial: $5 credit for new accounts

# ============================================
# APPLICATION
# ============================================
NODE_ENV="development"
PORT=5173
PUBLIC_APP_URL="http://localhost:5173"

# ============================================
# EMAIL (Optional for development)
# ============================================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
# Gmail setup: https://support.google.com/accounts/answer/185833
# Alternative services:
# - SendGrid: https://sendgrid.com/
# - Mailgun: https://www.mailgun.com/
# - AWS SES: https://aws.amazon.com/ses/

# ============================================
# STORAGE (Optional)
# ============================================
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="stxryai-assets"
AWS_REGION="us-east-1"
# AWS S3 setup: https://docs.aws.amazon.com/AmazonS3/latest/userguide/GetStartedWithS3.html
# Alternative: Cloudflare R2 (S3-compatible, cheaper)
```

### How to Get API Keys

#### OpenAI API Key
1. Visit [https://platform.openai.com/](https://platform.openai.com/)
2. Sign up or log in
3. Go to [API Keys](https://platform.openai.com/api-keys)
4. Click "Create new secret key"
5. Copy the key (you won't see it again!)
6. Add to `.env`: `OPENAI_API_KEY="sk-..."`

**Cost Management:**
- Set usage limits: [Usage Limits](https://platform.openai.com/account/billing/limits)
- Monitor usage: [Usage Dashboard](https://platform.openai.com/usage)
- Free tier: $5 credit for 3 months (new accounts)

#### Generate Secure Secrets

```bash
# Generate JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Generate SESSION_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or use online generator (less secure)
# https://www.uuidgenerator.net/
```

#### Gmail SMTP Setup
1. Enable 2-Factor Authentication: [Google 2FA](https://myaccount.google.com/security)
2. Generate App Password: [App Passwords](https://myaccount.google.com/apppasswords)
3. Use the 16-character password in `SMTP_PASSWORD`

**Alternative Email Services:**
- **SendGrid:** [Free tier 100 emails/day](https://sendgrid.com/pricing/)
- **Mailgun:** [Free tier 5,000 emails/month](https://www.mailgun.com/pricing/)
- **Resend:** [Free tier 3,000 emails/month](https://resend.com/pricing)

#### AWS S3 Setup (Optional)
1. Create AWS Account: [https://aws.amazon.com/](https://aws.amazon.com/)
2. Create S3 Bucket: [S3 Console](https://s3.console.aws.amazon.com/)
3. Create IAM User: [IAM Console](https://console.aws.amazon.com/iam/)
4. Attach policy: `AmazonS3FullAccess` (or create custom policy)
5. Generate Access Keys
6. Add to `.env`

**Alternative Storage:**
- **Cloudflare R2:** [Cheaper than S3](https://www.cloudflare.com/products/r2/)
- **Supabase Storage:** [Built-in with Supabase](https://supabase.com/docs/guides/storage)
- **Vercel Blob:** [Simple file storage](https://vercel.com/docs/storage/vercel-blob)

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

### Understanding Prisma Migrations

Prisma migrations track changes to your database schema over time. Learn more: [Prisma Migrations Guide](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### 1. Generate Prisma Client

```bash
npx prisma generate
```

**What this does:**
- Reads your `prisma/schema.prisma` file
- Generates TypeScript types and database client
- Creates type-safe database queries
- Must be run after any schema changes

**Documentation:** [Prisma Client](https://www.prisma.io/docs/concepts/components/prisma-client)

### 2. Run Migrations

```bash
# Create and apply migration
npx prisma migrate dev --name init

# For subsequent migrations, use descriptive names
npx prisma migrate dev --name add_user_profiles
npx prisma migrate dev --name add_story_categories
```

**What this does:**
- Creates SQL migration files in `prisma/migrations/`
- Applies migrations to your database
- Updates Prisma Client
- Creates migration history

**Migration workflow:**
1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name your_change`
3. Prisma generates SQL and applies it
4. Review the generated SQL in `prisma/migrations/`

**Documentation:** [Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)

### 3. Verify Database Schema

```bash
# Open Prisma Studio (visual database editor)
npx prisma studio
```

**Prisma Studio features:**
- Visual database browser at `http://localhost:5555`
- View and edit data
- Test relationships
- No SQL required

**Alternative tools:**
- [pgAdmin](https://www.pgadmin.org/) - Full-featured PostgreSQL GUI
- [TablePlus](https://tableplus.com/) - Modern database GUI
- [DBeaver](https://dbeaver.io/) - Free universal database tool

### Common Migration Commands

```bash
# View migration status
npx prisma migrate status

# Reset database (⚠️ deletes all data!)
npx prisma migrate reset

# Deploy migrations (production)
npx prisma migrate deploy

# Create migration without applying
npx prisma migrate dev --create-only

# Resolve migration issues
npx prisma migrate resolve --applied "migration_name"
```

**Learn more:** [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference)

---

## Seeding Data

### What is Database Seeding?

Seeding populates your database with initial data for development and testing. Learn more: [Prisma Seeding Guide](https://www.prisma.io/docs/guides/database/seed-database)

### 1. Run Seed Script

```bash
# Using npm script
npm run seed

# Or directly with Prisma
npx prisma db seed

# Reset database and seed (⚠️ deletes all data!)
npx prisma migrate reset
```

**What gets seeded:**
- ✅ Sample users (parent, child, educator)
- ✅ Cultural heritage data (Black, African, Caribbean)
- ✅ Age-appropriate content templates
- ✅ Sample stories and activities
- ✅ Family collaboration examples
- ✅ Achievement badges and rewards
- ✅ Learning milestones

**Expected time:** 30-60 seconds

### 2. Verify Seeded Data

```bash
# Open Prisma Studio to view data
npx prisma studio

# Or query with psql
psql "postgresql://stxryai_user:your_secure_password@localhost:5432/stxryai_dev" -c "SELECT COUNT(*) FROM users;"
```

### 3. Test Accounts

After seeding, you can log in with these accounts:

#### Parent Account
- **Email:** `parent@example.com`
- **Password:** `password123`
- **Features:** Full dashboard, child management, progress tracking

#### Educator Account
- **Email:** `educator@example.com`
- **Password:** `password123`
- **Features:** Classroom management, student analytics, curriculum tools

#### Child Account
- **Username:** `child_user`
- **PIN:** `1234`
- **Features:** Age-appropriate interface, story creation, games

**⚠️ Security Note:** Change these passwords before deploying to production!

### 4. Custom Seeding

Edit `prisma/seed.ts` to customize seed data:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Add your custom seed data here
  await prisma.user.create({
    data: {
      email: 'custom@example.com',
      name: 'Custom User',
      // ...
    }
  })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
```

**Learn more:** [Prisma Seeding Documentation](https://www.prisma.io/docs/guides/database/seed-database)

---

## Development Workflow

### 1. Start Development Server

```bash
# Start the dev server
npm run dev

# Or with specific port
PORT=3000 npm run dev

# Or with host binding (for network access)
npm run dev -- --host
```

**What happens:**
- ✅ SvelteKit dev server starts
- ✅ Available at `http://localhost:5173`
- ✅ Hot Module Replacement (HMR) enabled
- ✅ TypeScript compilation
- ✅ Tailwind CSS processing
- ✅ API routes available

**Access from other devices:**
```bash
# Start with host flag
npm run dev -- --host

# Then access from phone/tablet using your computer's IP
# Example: http://192.168.1.100:5173
```

**Documentation:** [SvelteKit CLI](https://kit.svelte.dev/docs/cli)

### 2. Watch for Changes

The dev server automatically:
- 🔥 **Hot-reloads** on file changes (no page refresh needed)
- 📝 **Compiles TypeScript** with type checking
- 🎨 **Processes Svelte components** with reactive updates
- 💅 **Updates Tailwind CSS** with JIT compilation
- 🔄 **Restarts API routes** when server code changes

**Supported file types:**
- `.svelte` - Svelte components
- `.ts`, `.js` - TypeScript/JavaScript
- `.css` - Stylesheets
- `.json` - Configuration files

### 3. Database Changes Workflow

When modifying the database schema:

```bash
# Step 1: Edit prisma/schema.prisma
# Example: Add a new field to User model

# Step 2: Create and apply migration
npx prisma migrate dev --name add_user_avatar

# Step 3: Regenerate Prisma Client (usually automatic)
npx prisma generate

# Step 4: Restart dev server if needed
# Press Ctrl+C and run: npm run dev
```

**Best practices:**
- Use descriptive migration names
- Review generated SQL before committing
- Test migrations on a copy of production data
- Keep migrations small and focused

**Learn more:** [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

### 4. Code Quality Tools

```bash
# Lint code (find problems)
npm run lint

# Fix linting issues automatically
npm run lint -- --fix

# Format code with Prettier
npm run format

# Type check without building
npm run check

# Type check in watch mode
npm run check -- --watch
```

**VS Code Integration:**
- Install recommended extensions
- Enable "Format on Save" in settings
- Enable "ESLint: Auto Fix On Save"

**Configuration files:**
- `eslint.config.js` - ESLint rules
- `.prettierrc` - Prettier formatting
- `tsconfig.json` - TypeScript settings

### 5. Development Tips

#### View Server Logs
```bash
# Enable debug mode
DEBUG=* npm run dev

# Or set in .env
DEBUG=true
LOG_LEVEL=debug
```

#### Clear Cache
```bash
# Clear SvelteKit cache
rm -rf .svelte-kit

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Database GUI
```bash
# Open Prisma Studio
npx prisma studio

# Runs at http://localhost:5555
```

#### API Testing
```bash
# Test API endpoint with curl
curl http://localhost:5173/api/stories

# Or use Thunder Client extension in VS Code
```

**Helpful resources:**
- [SvelteKit Documentation](https://kit.svelte.dev/docs)
- [Svelte Tutorial](https://svelte.dev/tutorial)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

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

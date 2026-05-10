# 🚀 Production Deployment Guide

## Issue: Localhost Redirect in Production

If your app redirects to `localhost` in production, it means `NEXTAUTH_URL` is not set correctly.

## Quick Fix

Set the `NEXTAUTH_URL` environment variable in your Vercel dashboard:

```
NEXTAUTH_URL=https://your-actual-domain.vercel.app
```

Then redeploy your application.

---

## Complete Deployment Steps

### Step 1: Prepare Database

1. **Create Neon Database**
   - Go to [neon.tech](https://neon.tech)
   - Create a new project
   - Copy the connection string

2. **Connection String Format**
   ```
   postgresql://user:password@host.region.neon.tech:5432/database?sslmode=require
   ```

### Step 2: Configure Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to production"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. **Add Environment Variables**
   
   In Vercel Dashboard → Settings → Environment Variables:

   | Variable | Value | Example |
   |----------|-------|---------|
   | `DATABASE_URL` | Your Neon connection string | `postgresql://user:pass@...` |
   | `NEXTAUTH_URL` | Your Vercel app URL | `https://traveloop.vercel.app` |
   | `NEXTAUTH_SECRET` | Random 32-char string | Generate with command below |
   | `GEODB_API_KEY` | Optional API key | Leave empty if not using |

4. **Generate NEXTAUTH_SECRET**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output and paste as `NEXTAUTH_SECRET`

### Step 3: Deploy

1. Click "Deploy" in Vercel
2. Wait for build to complete
3. Note your deployment URL (e.g., `https://traveloop.vercel.app`)

### Step 4: Run Database Migrations

**Option A: Using Vercel CLI**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy
```

**Option B: Using Vercel Dashboard**

1. Go to your project in Vercel
2. Click on "Settings" → "Functions"
3. Open the terminal
4. Run:
   ```bash
   npx prisma migrate deploy
   ```

### Step 5: Verify Deployment

1. Visit your production URL
2. Try to login
3. Check that redirects work correctly
4. Test AI recommendations feature

---

## Common Issues & Solutions

### Issue 1: Redirects to localhost

**Problem**: App redirects to `http://localhost:3000` in production

**Solution**: 
```bash
# In Vercel dashboard, set:
NEXTAUTH_URL=https://your-app.vercel.app

# Then redeploy
```

### Issue 2: Database connection fails

**Problem**: Can't connect to database

**Solution**:
- Verify `DATABASE_URL` is correct
- Check Neon database is active
- Ensure connection string includes `?sslmode=require`

### Issue 3: Authentication doesn't work

**Problem**: Can't login in production

**Solution**:
- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Clear browser cookies and try again

### Issue 4: Recommendations page error

**Problem**: "Page couldn't load" on `/recommendations`

**Solution**:
```bash
# Run migrations
npx prisma migrate deploy

# Or reset and migrate
npx prisma migrate reset --force
npx prisma migrate deploy
```

---

## Environment Variables Reference

### Required Variables

```env
# Database connection
DATABASE_URL="postgresql://user:pass@host.neon.tech:5432/db?sslmode=require"

# NextAuth configuration
NEXTAUTH_URL="https://your-app.vercel.app"
NEXTAUTH_SECRET="your-32-character-random-string"
```

### Optional Variables

```env
# GeoDB Cities API (for enhanced city search)
GEODB_API_KEY="your-api-key"
```

---

## Vercel Configuration

### Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Environment Variables

Set these in: **Project Settings → Environment Variables**

Make sure to set them for:
- ✅ Production
- ✅ Preview
- ✅ Development

---

## Post-Deployment Checklist

- [ ] Database migrations completed
- [ ] `NEXTAUTH_URL` set to production URL
- [ ] `NEXTAUTH_SECRET` is secure and random
- [ ] Login/logout works correctly
- [ ] No localhost redirects
- [ ] AI recommendations page loads
- [ ] Preferences can be saved
- [ ] All features tested

---

## Updating Production

### Code Changes

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Vercel will automatically deploy.

### Database Changes

```bash
# Create migration locally
npx prisma migrate dev --name your_migration_name

# Push to git
git add .
git commit -m "Add migration"
git push

# After Vercel deploys, run:
vercel env pull .env.local
npx prisma migrate deploy
```

---

## Monitoring

### Check Logs

1. Go to Vercel Dashboard
2. Click on your project
3. Go to "Deployments"
4. Click on latest deployment
5. View "Functions" logs

### Common Log Errors

**"NEXTAUTH_URL not set"**
- Add `NEXTAUTH_URL` environment variable

**"Database connection failed"**
- Check `DATABASE_URL` is correct
- Verify Neon database is running

**"Prisma Client not generated"**
- Ensure `postinstall` script runs: `"postinstall": "prisma generate"`

---

## Rollback

If something goes wrong:

1. Go to Vercel Dashboard
2. Click "Deployments"
3. Find previous working deployment
4. Click "..." → "Promote to Production"

---

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Verify all environment variables
3. Test locally with production env vars
4. Check database connection
5. Review migration status

---

## Security Best Practices

1. **Never commit `.env` file**
   - Add to `.gitignore`
   - Use `.env.example` for reference

2. **Rotate secrets regularly**
   - Generate new `NEXTAUTH_SECRET` periodically
   - Update in Vercel dashboard

3. **Use strong database passwords**
   - Let Neon generate secure passwords
   - Don't use simple passwords

4. **Enable HTTPS only**
   - Vercel handles this automatically
   - Never use `http://` in production

---

**Last Updated**: 2024  
**Status**: ✅ Production Ready

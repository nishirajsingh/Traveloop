# 🔧 Quick Fix: Production Localhost Redirect

## Problem
Your app redirects to `http://localhost:3000` when deployed to production.

## Solution (2 minutes)

### Step 1: Set Environment Variable in Vercel

1. Go to [vercel.com](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add or update:

```
Name: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
```

Replace `your-app-name.vercel.app` with your actual Vercel URL.

### Step 2: Redeploy

Click **Deployments** → **Redeploy** (or push a new commit)

### Step 3: Verify

Visit your production URL and test login/logout.

---

## Why This Happens

NextAuth uses `NEXTAUTH_URL` to generate callback URLs. If not set, it defaults to `localhost`.

## Code Fix (Already Applied)

The code now includes `trustHost: true` in auth config:

```typescript
// src/lib/auth.ts
export const { handlers, auth, signIn, signOut } = NextAuth({
  // ... other config
  trustHost: true, // ✅ This allows dynamic host detection
});
```

---

## Complete Environment Variables

For production, you need:

```env
DATABASE_URL=postgresql://user:pass@host.neon.tech:5432/db
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=your-random-32-char-string
```

Generate secret:
```bash
openssl rand -base64 32
```

---

## Still Having Issues?

1. **Clear browser cache and cookies**
2. **Check Vercel logs** for errors
3. **Verify all 3 environment variables** are set
4. **Try incognito mode** to test fresh session

---

## Need More Help?

See `PRODUCTION_DEPLOYMENT.md` for complete deployment guide.

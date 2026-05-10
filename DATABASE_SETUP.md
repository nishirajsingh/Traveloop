# ⚠️ IMPORTANT: Database Setup Required

If you're seeing errors when accessing `/recommendations` or `/preferences`, you need to run the database migration first.

## Quick Fix

Run this command in your terminal:

```bash
npx prisma migrate dev --name add_user_preferences
```

Then restart your development server:

```bash
npm run dev
```

## What This Does

This command:
1. Creates the `UserPreference` table in your database
2. Adds the relationship between `User` and `UserPreference`
3. Updates your Prisma client with the new schema

## Alternative: Reset Database (Development Only)

If you encounter issues, you can reset the entire database:

```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma db seed
```

⚠️ **Warning**: This will delete all existing data!

## Verify Setup

After running the migration, check that it worked:

```bash
npx prisma studio
```

This opens a GUI where you can see all your database tables, including the new `UserPreference` table.

## Still Having Issues?

1. Check your `DATABASE_URL` in `.env`
2. Make sure PostgreSQL is running
3. Check the console for specific error messages
4. Ensure you have the latest Prisma client: `npx prisma generate`

---

Once the migration is complete, the AI recommendations feature will work perfectly! 🎉

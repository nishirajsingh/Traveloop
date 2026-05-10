# Traveloop 🌍✈️

A production-grade travel itinerary planning platform built with Next.js 15, TypeScript, Prisma, and PostgreSQL.

## Features

- **Authentication** – Signup/Login with NextAuth + bcrypt password hashing
- **Trip Management** – Create, edit, delete multi-city trips with public/private toggle
- **Itinerary Builder** – Drag-and-drop city stops with activity management
- **Dynamic City Search** – Teleport API / GeoDB Cities API integration
- **AI Recommendations** – Personalized destination, activity, and travel tips based on trip history
- **Budget Analytics** – Recharts pie & bar charts with category breakdowns
- **Packing Checklist** – Categorized items with packed/unpacked tracking
- **Notes & Journal** – Trip notes with inline editing
- **Public Sharing** – Read-only public trip pages with copy-to-plan CTA

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS v4, shadcn/ui, Framer Motion
- **State**: Zustand with localStorage persistence
- **Forms**: React Hook Form + Zod validation
- **Charts**: Recharts
- **DnD**: @dnd-kit
- **Backend**: Next.js API Routes, Prisma ORM, PostgreSQL (Neon)
- **Auth**: NextAuth v5 (beta) with JWT sessions

## Setup

### 1. Clone & Install

```bash
git clone <repo>
cd traveloop
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and fill in:

```env
DATABASE_URL="postgresql://user:password@host:5432/traveloop"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GEODB_API_KEY=""   # Optional – falls back to Teleport API
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations (includes AI recommendations table)
npx prisma migrate dev --name init

# Seed database with demo data
npx prisma db seed
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

**Demo credentials**: `demo@traveloop.com` / `Demo1234`

### 5. Access AI Recommendations

After logging in:
1. Create a few trips with destinations and activities
2. Navigate to "AI Recommendations" in the sidebar
3. View personalized travel suggestions based on your history
4. (Optional) Set your preferences at `/preferences` for better recommendations

## Deployment (Vercel + Neon)

1. Create a [Neon](https://neon.tech) PostgreSQL database
2. Copy the connection string to `DATABASE_URL`
3. Deploy to [Vercel](https://vercel.com) with environment variables set
4. Run `npx prisma migrate deploy` after first deploy

## Troubleshooting

### "Page couldn't load" error on /recommendations

This means the database migration hasn't been run yet. Fix:

```bash
npx prisma generate
npx prisma migrate dev --name add_user_preferences
npm run dev
```

### Hydration errors in console

These are usually caused by browser extensions (Grammarly, etc.). The app has `suppressHydrationWarning` to handle this, but you can also:
- Disable browser extensions temporarily
- Use incognito mode for testing

### TypeScript build errors

Make sure all dependencies are installed:

```bash
npm install
npx prisma generate
npm run build
```

### Database connection issues

Verify your `DATABASE_URL` in `.env` is correct and PostgreSQL is running.

## Project Structure

```
src/
├── app/
│   ├── (auth)/          # Login, Signup pages
│   ├── (dashboard)/     # Protected dashboard pages
│   │   ├── dashboard/   # Main dashboard
│   │   ├── trips/       # Trip list, create, detail
│   │   ├── recommendations/ # AI-powered recommendations
│   │   ├── budget/      # Budget analytics
│   │   ├── packing/     # Packing checklist
│   │   └── notes/       # Notes & journal
│   ├── api/             # API routes
│   └── trip/public/     # Public trip pages
├── components/
│   ├── layout/          # Sidebar, Navbar
│   ├── shared/          # Reusable components
│   └── ui/              # shadcn/ui components
├── lib/                 # Prisma client, Auth config
├── store/               # Zustand stores
├── types/               # TypeScript types
├── utils/               # Helper functions
└── validations/         # Zod schemas
```

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register new user |
| GET/POST | `/api/trips` | List / create trips |
| GET/PUT/DELETE | `/api/trips/:id` | Trip CRUD |
| POST | `/api/stops` | Add stop to trip |
| PUT/DELETE | `/api/stops/:id` | Update / delete stop |
| GET | `/api/activities/search` | City search |
| POST/DELETE | `/api/activities` | Activity CRUD |
| POST | `/api/recommendations` | AI-powered travel recommendations |
| GET/POST | `/api/preferences` | User travel preferences |
| GET | `/api/budget/:tripId` | Budget analytics |
| GET/POST/PATCH/DELETE | `/api/packing` | Packing items |
| GET/POST/PUT/DELETE | `/api/notes` | Trip notes |

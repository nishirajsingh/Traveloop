# AI Recommendation System Architecture

## System Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Dashboard   │  │Recommendations│  │ Preferences  │         │
│  │              │  │     Page      │  │     Page     │         │
│  │ - Quick      │  │ - Destinations│  │ - Travel     │         │
│  │   Actions    │  │ - Activities  │  │   Style      │         │
│  │ - AI Button  │  │ - Tips        │  │ - Interests  │         │
│  │              │  │ - Insights    │  │ - Budget     │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                  │                  │                 │
└─────────┼──────────────────┼──────────────────┼─────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API LAYER                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────┐    ┌────────────────────────┐     │
│  │ POST /api/             │    │ GET/POST /api/         │     │
│  │ recommendations        │    │ preferences            │     │
│  │                        │    │                        │     │
│  │ 1. Authenticate user   │    │ 1. Authenticate user   │     │
│  │ 2. Fetch trip history  │    │ 2. Fetch/save prefs    │     │
│  │ 3. Analyze patterns    │    │ 3. Return data         │     │
│  │ 4. Generate suggestions│    │                        │     │
│  │ 5. Return JSON         │    │                        │     │
│  └───────────┬────────────┘    └───────────┬────────────┘     │
│              │                              │                  │
└──────────────┼──────────────────────────────┼──────────────────┘
               │                              │
               ▼                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │   User   │  │   Trip   │  │   Stop   │  │UserPreference│  │
│  │          │  │          │  │          │  │              │  │
│  │ - id     │  │ - id     │  │ - id     │  │ - travelStyle│  │
│  │ - email  │  │ - title  │  │ - city   │  │ - interests  │  │
│  │ - name   │  │ - budget │  │ - country│  │ - budgetRange│  │
│  │          │  │ - dates  │  │          │  │ - climate    │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └──────┬───────┘  │
│       │             │             │                │           │
│       └─────────────┴─────────────┴────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Recommendation Generation Flow

```
User clicks "AI Recommendations"
         │
         ▼
Frontend sends POST to /api/recommendations
         │
         ▼
API authenticates user via NextAuth
         │
         ▼
Fetch user data with Prisma:
  - Last 5 trips
  - All stops & activities
  - Budget entries
  - User preferences
         │
         ▼
Analyze data:
  - Extract visited cities/countries
  - Count activity categories
  - Calculate average budget
         │
         ▼
Generate recommendations:
  - Filter destinations (exclude visited)
  - Rank activities (by preference)
  - Create tips (budget-aware)
  - Calculate insights
         │
         ▼
Return JSON response
         │
         ▼
Frontend displays recommendations
```

### 2. Preference Management Flow

```
User visits /preferences page
         │
         ▼
Frontend fetches GET /api/preferences
         │
         ▼
Display current preferences (or defaults)
         │
         ▼
User selects preferences
         │
         ▼
User clicks "Save"
         │
         ▼
Frontend sends POST /api/preferences
         │
         ▼
API upserts UserPreference record
         │
         ▼
Return success response
         │
         ▼
Show success toast
```

## Component Architecture

```
src/
├── app/
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx ──────────┐
│   │   │                          │
│   │   ├── recommendations/       │
│   │   │   └── page.tsx ──────┐  │
│   │   │                       │  │
│   │   └── preferences/        │  │
│   │       └── page.tsx ────┐  │  │
│   │                         │  │  │
│   └── api/                  │  │  │
│       ├── recommendations/  │  │  │
│       │   └── route.ts ◄────┘  │  │
│       │                         │  │
│       └── preferences/          │  │
│           └── route.ts ◄────────┘  │
│                                    │
├── components/                      │
│   └── layout/                      │
│       └── Sidebar.tsx ◄────────────┘
│
└── prisma/
    └── schema.prisma
        ├── User
        ├── Trip
        ├── Stop
        ├── Activity
        └── UserPreference
```

## Database Schema Relationships

```
┌──────────────┐
│     User     │
│              │
│ - id         │
│ - email      │
│ - name       │
└──────┬───────┘
       │
       │ 1:N
       │
       ├─────────────────────────────┐
       │                             │
       │                             │ 1:1
       ▼                             ▼
┌──────────────┐            ┌──────────────────┐
│     Trip     │            │ UserPreference   │
│              │            │                  │
│ - id         │            │ - travelStyle[]  │
│ - title      │            │ - interests[]    │
│ - budget     │            │ - budgetRange    │
│ - dates      │            │ - climate[]      │
└──────┬───────┘            └──────────────────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐
│     Stop     │
│              │
│ - id         │
│ - city       │
│ - country    │
│ - dates      │
└──────┬───────┘
       │
       │ 1:N
       │
       ▼
┌──────────────┐
│   Activity   │
│              │
│ - id         │
│ - title      │
│ - category   │
│ - cost       │
└──────────────┘
```

## Recommendation Algorithm Logic

```
┌─────────────────────────────────────────┐
│     INPUT: User ID                      │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 1: Data Collection                │
│  ────────────────────────                │
│  • Fetch last 5 trips                   │
│  • Include stops, activities, budget    │
│  • Load user preferences                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 2: Pattern Analysis               │
│  ────────────────────────                │
│  • Extract visited cities/countries     │
│  • Count activity category frequency    │
│  • Calculate average budget             │
│  • Identify travel patterns             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 3: Destination Filtering          │
│  ────────────────────────────            │
│  • Load destination database            │
│  • Filter out visited countries         │
│  • Apply preference matching            │
│  • Select top 4 destinations            │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 4: Activity Ranking               │
│  ────────────────────────                │
│  • Load activity database               │
│  • Score by category frequency          │
│  • Apply interest matching              │
│  • Select top 4 activities              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 5: Tip Generation                 │
│  ────────────────────────                │
│  • Analyze budget patterns              │
│  • Select relevant tips                 │
│  • Customize for user profile           │
│  • Return top 4 tips                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│  STEP 6: Insights Calculation           │
│  ────────────────────────────            │
│  • Total trips count                    │
│  • Unique cities visited                │
│  • Unique countries visited             │
│  • Average budget per trip              │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│     OUTPUT: JSON Response               │
│     {                                   │
│       destinations: [...],              │
│       activities: [...],                │
│       tips: [...],                      │
│       insights: {...}                   │
│     }                                   │
└─────────────────────────────────────────┘
```

## Security Architecture

```
┌─────────────────────────────────────────┐
│         Client Request                  │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    NextAuth Middleware                  │
│    • Verify session token               │
│    • Check authentication               │
│    • Extract user ID                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    API Route Handler                    │
│    • Validate user exists               │
│    • Check authorization                │
│    • Sanitize inputs                    │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    Prisma ORM                           │
│    • Parameterized queries              │
│    • SQL injection prevention           │
│    • User data isolation                │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│    PostgreSQL Database                  │
│    • Encrypted connections              │
│    • Row-level security                 │
│    • Cascade deletes                    │
└─────────────────────────────────────────┘
```

## Performance Optimization

```
┌─────────────────────────────────────────┐
│  Frontend Optimizations                 │
│  • React Server Components              │
│  • Image lazy loading                   │
│  • Code splitting                       │
│  • Caching strategies                   │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  API Optimizations                      │
│  • Prisma query optimization            │
│  • Include relations efficiently        │
│  • Limit result sets                    │
│  • Response compression                 │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  Database Optimizations                 │
│  • Indexed foreign keys                 │
│  • Efficient joins                      │
│  • Connection pooling                   │
│  • Query result caching                 │
└─────────────────────────────────────────┘
```

---

This architecture provides a scalable, secure, and performant AI recommendation system fully integrated with Traveloop.

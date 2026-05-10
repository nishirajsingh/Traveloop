# AI Recommendations Setup Guide

## Overview

The AI-based recommendation system analyzes user trip history, preferences, and behavior to provide personalized travel suggestions including:

- **Destination Recommendations** - Suggests new cities/countries based on past trips
- **Activity Suggestions** - Recommends activities based on user interests
- **Travel Tips** - Provides budget-friendly and practical travel advice
- **Travel Insights** - Shows statistics about travel patterns

## Features

### 1. Smart Destination Recommendations
- Filters out already visited countries
- Suggests destinations with relevant tags (Culture, Beach, Adventure, etc.)
- Includes high-quality images and reasons to visit

### 2. Personalized Activity Suggestions
- Analyzes past activity categories
- Ranks activities based on user preferences
- Shows estimated costs for budgeting

### 3. Travel Tips
- Budget-specific recommendations
- Practical travel advice
- Seasonal suggestions

### 4. Travel Insights Dashboard
- Total trips taken
- Cities and countries visited
- Average budget per trip

## Database Schema

The system uses a `UserPreference` model to store user preferences:

```prisma
model UserPreference {
  id              String   @id @default(cuid())
  travelStyle     String[] @default([])
  interests       String[] @default([])
  budgetRange     String   @default("medium")
  preferredClimate String[] @default([])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  userId          String   @unique
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Setup Instructions

### 1. Run Database Migration

```bash
npx prisma migrate dev --name add_user_preferences
```

Or manually run the SQL migration:

```bash
psql $DATABASE_URL < prisma/migrations/add_user_preferences.sql
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Access the Feature

Navigate to `/recommendations` in your dashboard or click "AI Recommendations" in the sidebar.

## API Endpoints

### POST /api/recommendations
Generates personalized recommendations based on user trip history.

**Response:**
```json
{
  "destinations": [
    {
      "city": "Tokyo",
      "country": "Japan",
      "reason": "Perfect blend of tradition and technology",
      "image": "https://...",
      "tags": ["Culture", "Food", "Technology"]
    }
  ],
  "activities": [
    {
      "title": "Food Tour",
      "description": "Explore local cuisine",
      "category": "Food",
      "estimatedCost": 80
    }
  ],
  "tips": [
    {
      "title": "Book Flights Early",
      "description": "Save up to 30%",
      "icon": "✈️"
    }
  ],
  "insights": {
    "totalTrips": 5,
    "citiesVisited": 12,
    "countriesVisited": 8,
    "avgBudget": 1500
  }
}
```

### GET/POST /api/preferences
Manage user travel preferences.

**POST Body:**
```json
{
  "travelStyle": ["Adventure", "Luxury"],
  "interests": ["Food", "Culture", "Nature"],
  "budgetRange": "medium",
  "preferredClimate": ["Tropical", "Temperate"]
}
```

## How It Works

1. **Data Collection**: System analyzes user's trip history including:
   - Visited cities and countries
   - Activity categories and preferences
   - Budget patterns
   - Trip frequency

2. **Recommendation Engine**: 
   - Filters destinations to avoid duplicates
   - Ranks activities based on past preferences
   - Generates budget-specific tips
   - Calculates travel insights

3. **Personalization**: 
   - Uses UserPreference data when available
   - Falls back to trip history analysis
   - Adapts recommendations over time

## Future Enhancements

- Integration with OpenAI/Anthropic for advanced AI recommendations
- Weather-based destination suggestions
- Collaborative filtering (similar users)
- Real-time pricing data integration
- Seasonal trend analysis
- Social features (friend recommendations)

## Customization

To customize recommendations, edit:
- `/src/app/api/recommendations/route.ts` - Recommendation logic
- `/src/app/(dashboard)/recommendations/page.tsx` - UI components

## Troubleshooting

**No recommendations showing:**
- Ensure user has at least one trip created
- Check database connection
- Verify Prisma schema is up to date

**Preferences not saving:**
- Run `npx prisma generate` after schema changes
- Check API route permissions
- Verify user authentication

## Support

For issues or feature requests, please open an issue on GitHub.

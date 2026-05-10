# 🚀 Quick Start: AI Recommendation System

## Installation Steps

### ⚠️ CRITICAL: Run Database Migration First

Before accessing the recommendations feature, you MUST run this command:

```bash
npx prisma migrate dev --name add_user_preferences
```

If you see an error, try:

```bash
npx prisma generate
npx prisma migrate dev --name add_user_preferences
```

### 1. Update Database Schema

Run the Prisma migration to add the UserPreference table:

```bash
npx prisma migrate dev --name add_user_preferences
```

This will create the necessary database tables for storing user preferences.

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Restart Development Server

```bash
npm run dev
```

## 🎯 Features Overview

### 1. AI Recommendations Page (`/recommendations`)
- **Destination Suggestions**: Personalized city recommendations based on travel history
- **Activity Ideas**: Curated activities matching your interests
- **Travel Tips**: Budget-friendly and practical advice
- **Travel Insights**: Statistics dashboard showing your travel patterns

### 2. Preferences Page (`/preferences`)
- Set your travel style (Adventure, Luxury, Budget, etc.)
- Choose interests (Food, Culture, Nature, etc.)
- Define budget range (Low, Medium, High)
- Select preferred climates (Tropical, Temperate, etc.)

### 3. Dashboard Integration
- Quick access via sidebar "AI Recommendations" menu
- "AI Suggestions" quick action card on dashboard
- "Preferences" menu item to customize recommendations

## 📱 User Flow

1. **Login** to your Traveloop account
2. **Create trips** with destinations and activities
3. **Set preferences** (optional) at `/preferences`
4. **View recommendations** at `/recommendations`
5. **Get personalized suggestions** based on your travel history

## 🔧 API Endpoints

### POST `/api/recommendations`
Generates AI-powered recommendations

**Authentication**: Required  
**Response**: Destinations, activities, tips, and insights

### GET/POST `/api/preferences`
Manage user travel preferences

**GET**: Fetch current preferences  
**POST**: Save/update preferences

## 🎨 UI Components

### Recommendations Page
- **Insights Cards**: 4 gradient cards showing travel statistics
- **Destination Grid**: 4 destination cards with images and tags
- **Activity Cards**: 4 activity suggestions with cost estimates
- **Tips Section**: 4 travel tips with emoji icons

### Preferences Page
- **Interactive Tags**: Click to select/deselect preferences
- **Budget Selector**: Choose from Low, Medium, High
- **Save Button**: Persist preferences to database

## 🧠 How the AI Works

The recommendation engine analyzes:

1. **Trip History**: Last 5 trips with stops and activities
2. **Visited Locations**: Cities and countries you've been to
3. **Activity Preferences**: Categories you engage with most
4. **Budget Patterns**: Average spending across trips

Then generates:

- **Smart Destinations**: Excludes visited countries, suggests new places
- **Ranked Activities**: Sorted by your past category preferences
- **Budget Tips**: Customized based on your spending patterns
- **Insights**: Aggregated statistics about your travels

## 📊 Example Recommendation Output

```json
{
  "destinations": [
    {
      "city": "Tokyo",
      "country": "Japan",
      "reason": "Perfect blend of tradition and technology",
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

## 🔮 Future AI Integration

To integrate with OpenAI or Anthropic Claude:

### Option 1: OpenAI

```bash
npm install openai
```

Add to `.env`:
```env
OPENAI_API_KEY=sk-...
```

Update `src/app/api/recommendations/route.ts`:
```typescript
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const prompt = `Based on these trips: ${JSON.stringify(trips)}, 
suggest 4 unique destinations the user hasn't visited.`;

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }]
});
```

### Option 2: Anthropic Claude

```bash
npm install @anthropic-ai/sdk
```

Add to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-...
```

Update recommendation route:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const message = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 1024,
  messages: [{ role: "user", content: prompt }]
});
```

## 🐛 Troubleshooting

### No recommendations showing
- Ensure you have at least one trip created
- Check that trips have stops and activities
- Verify database connection

### Preferences not saving
- Check browser console for errors
- Verify API route is accessible
- Ensure user is authenticated

### Migration errors
```bash
# Reset database (development only)
npx prisma migrate reset

# Then run migration again
npx prisma migrate dev --name add_user_preferences
```

## 📁 File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── recommendations/
│   │   │   └── route.ts          # AI recommendation logic
│   │   └── preferences/
│   │       └── route.ts          # Preferences CRUD
│   └── (dashboard)/
│       ├── recommendations/
│       │   └── page.tsx          # Recommendations UI
│       └── preferences/
│           └── page.tsx          # Preferences form
├── components/
│   └── layout/
│       └── Sidebar.tsx           # Updated navigation
└── prisma/
    ├── schema.prisma             # Updated schema
    └── migrations/
        └── add_user_preferences.sql
```

## ✅ Checklist

- [ ] Run database migration
- [ ] Generate Prisma client
- [ ] Restart dev server
- [ ] Create at least one trip
- [ ] Visit `/recommendations` page
- [ ] Set preferences at `/preferences`
- [ ] View personalized suggestions

## 🎉 You're All Set!

The AI recommendation system is now fully integrated into Traveloop. Start creating trips and watch as the system learns your preferences to provide increasingly personalized travel suggestions!

---

**Need Help?** Check `AI_RECOMMENDATIONS.md` for detailed documentation.

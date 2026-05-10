import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        trips: {
          include: {
            stops: { include: { activities: true } },
            budgetEntries: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Try to fetch preferences separately to avoid relation errors
    let preferences = null;
    try {
      preferences = await prisma.userPreference.findUnique({
        where: { userId: user.id },
      });
    } catch (e) {
      console.log("Preferences not available yet");
    }

    const recommendations = generateRecommendations({ ...user, preferences });

    return NextResponse.json(recommendations);
  } catch (error: any) {
    console.error("Recommendation error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate recommendations" },
      { status: 500 }
    );
  }
}

function generateRecommendations(user: any) {
  const visitedCities = new Set(
    user.trips.flatMap((trip: any) => trip.stops.map((stop: any) => stop.city))
  );
  const visitedCountries = new Set(
    user.trips.flatMap((trip: any) =>
      trip.stops.map((stop: any) => stop.country)
    )
  );

  const activityCategories = user.trips.flatMap((trip: any) =>
    trip.stops.flatMap((stop: any) =>
      stop.activities.map((act: any) => act.category)
    )
  );

  const avgBudget =
    user.trips.length > 0
      ? user.trips.reduce((sum: number, trip: any) => sum + trip.totalBudget, 0) /
        user.trips.length
      : 1000;

  const destinations = getDestinationRecommendations(
    visitedCountries,
    user.preferences
  );
  const activities = getActivityRecommendations(
    activityCategories,
    user.preferences
  );
  const tips = getTravelTips(user.trips, avgBudget);

  return {
    destinations,
    activities,
    tips,
    insights: {
      totalTrips: user.trips.length,
      citiesVisited: visitedCities.size,
      countriesVisited: visitedCountries.size,
      avgBudget: Math.round(avgBudget),
    },
  };
}

function getDestinationRecommendations(
  visitedCountries: Set<string>,
  preferences: any
) {
  const allDestinations = [
    {
      city: "Tokyo",
      country: "Japan",
      reason: "Perfect blend of tradition and technology",
      image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400",
      tags: ["Culture", "Food", "Technology"],
    },
    {
      city: "Barcelona",
      country: "Spain",
      reason: "Stunning architecture and Mediterranean vibes",
      image: "https://images.unsplash.com/photo-1583422409516-2895a77efded?w=400",
      tags: ["Architecture", "Beach", "Culture"],
    },
    {
      city: "Bali",
      country: "Indonesia",
      reason: "Tropical paradise with rich culture",
      image: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=400",
      tags: ["Beach", "Nature", "Wellness"],
    },
    {
      city: "Dubai",
      country: "UAE",
      reason: "Luxury and modern marvels",
      image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400",
      tags: ["Luxury", "Shopping", "Architecture"],
    },
    {
      city: "Reykjavik",
      country: "Iceland",
      reason: "Natural wonders and Northern Lights",
      image: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=400",
      tags: ["Nature", "Adventure", "Photography"],
    },
    {
      city: "New York",
      country: "USA",
      reason: "The city that never sleeps",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400",
      tags: ["Culture", "Food", "Entertainment"],
    },
  ];

  return allDestinations
    .filter((dest) => !visitedCountries.has(dest.country))
    .slice(0, 4);
}

function getActivityRecommendations(categories: string[], preferences: any) {
  const activities = [
    {
      title: "Food Tour",
      description: "Explore local cuisine with expert guides",
      category: "Food",
      estimatedCost: 80,
    },
    {
      title: "Hiking Adventure",
      description: "Discover scenic trails and nature",
      category: "Adventure",
      estimatedCost: 50,
    },
    {
      title: "Museum Visit",
      description: "Immerse in art and history",
      category: "Culture",
      estimatedCost: 25,
    },
    {
      title: "Scuba Diving",
      description: "Explore underwater wonders",
      category: "Adventure",
      estimatedCost: 120,
    },
    {
      title: "Cooking Class",
      description: "Learn to cook authentic local dishes",
      category: "Food",
      estimatedCost: 70,
    },
    {
      title: "City Walking Tour",
      description: "Discover hidden gems with locals",
      category: "Sightseeing",
      estimatedCost: 30,
    },
  ];

  const categoryCount = categories.reduce((acc: any, cat: string) => {
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {});

  return activities
    .sort((a, b) => {
      const aScore = categoryCount[a.category] || 0;
      const bScore = categoryCount[b.category] || 0;
      return bScore - aScore;
    })
    .slice(0, 4);
}

function getTravelTips(trips: any[], avgBudget: number) {
  const tips = [
    {
      title: "Book Flights Early",
      description: "Save up to 30% by booking 2-3 months in advance",
      icon: "✈️",
    },
    {
      title: "Travel Off-Season",
      description: "Avoid crowds and get better deals",
      icon: "📅",
    },
    {
      title: "Use Local Transport",
      description: "Experience the city like a local and save money",
      icon: "🚇",
    },
    {
      title: "Pack Light",
      description: "Avoid baggage fees and travel more freely",
      icon: "🎒",
    },
  ];

  if (avgBudget < 1000) {
    tips.unshift({
      title: "Budget-Friendly Destinations",
      description: "Consider Southeast Asia or Eastern Europe",
      icon: "💰",
    });
  }

  return tips.slice(0, 4);
}

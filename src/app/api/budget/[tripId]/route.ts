import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ tripId: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { tripId } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: {
      stops: { include: { activities: true } },
    },
  });

  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const breakdown: Record<string, number> = {
    Hotel: 0,
    Transport: 0,
    Food: 0,
    Activities: 0,
  };

  let totalSpent = 0;
  for (const stop of trip.stops) {
    for (const activity of stop.activities) {
      const cat = breakdown[activity.category] !== undefined ? activity.category : "Activities";
      breakdown[cat] = (breakdown[cat] || 0) + activity.cost;
      totalSpent += activity.cost;
    }
  }

  const categories = Object.entries(breakdown).map(([category, amount]) => ({
    category,
    amount,
    percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
  }));

  return NextResponse.json({
    totalBudget: trip.totalBudget,
    totalSpent,
    remaining: trip.totalBudget - totalSpent,
    categories,
    stops: trip.stops.map((s) => ({
      city: s.city,
      total: s.activities.reduce((sum, a) => sum + a.cost, 0),
    })),
  });
}

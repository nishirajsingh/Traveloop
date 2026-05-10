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
      budgetEntries: { orderBy: { date: "desc" } },
    },
  });

  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const CATEGORIES = ["Hotel", "Transport", "Food", "Activities"];
  const breakdown: Record<string, number> = Object.fromEntries(CATEGORIES.map((c) => [c, 0]));

  // Sum from activity costs on stops
  for (const stop of trip.stops) {
    for (const activity of stop.activities) {
      const cat = breakdown[activity.category] !== undefined ? activity.category : "Activities";
      breakdown[cat] += activity.cost;
    }
  }

  // Sum from manual budget entries
  for (const entry of trip.budgetEntries) {
    const cat = breakdown[entry.category] !== undefined ? entry.category : "Activities";
    breakdown[cat] += entry.amount;
  }

  const totalSpent = Object.values(breakdown).reduce((a, b) => a + b, 0);

  const categories = CATEGORIES.map((category) => ({
    category,
    amount: breakdown[category],
    percentage: totalSpent > 0 ? Math.round((breakdown[category] / totalSpent) * 100) : 0,
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
    entries: trip.budgetEntries,
  });
}

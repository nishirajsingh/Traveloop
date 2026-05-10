import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/validations";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { _count: { select: { stops: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(trips);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const parsed = tripSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues.map((i) => i.message).join(", ");
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { coverImage, description, ...rest } = parsed.data;
    const trip = await prisma.trip.create({
      data: {
        ...rest,
        startDate: new Date(rest.startDate),
        endDate: new Date(rest.endDate),
        coverImage: coverImage || null,
        description: description || null,
        userId: session.user.id,
      },
    });
    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    console.error("POST /api/trips error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

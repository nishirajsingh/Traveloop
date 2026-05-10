import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stopSchema } from "@/validations";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = stopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const trip = await prisma.trip.findUnique({ where: { id: parsed.data.tripId } });
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const count = await prisma.stop.count({ where: { tripId: parsed.data.tripId } });
  const stop = await prisma.stop.create({
    data: {
      ...parsed.data,
      arrivalDate: new Date(parsed.data.arrivalDate),
      departureDate: new Date(parsed.data.departureDate),
      order: count,
    },
    include: { activities: true },
  });
  return NextResponse.json(stop, { status: 201 });
}

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/validations";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      stops: {
        include: { activities: true },
        orderBy: { order: "asc" },
      },
      packingItems: { orderBy: { createdAt: "asc" } },
      notes: { orderBy: { date: "desc" } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!trip) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (!trip.isPublic && trip.userId !== session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json(trip);
}

export async function PUT(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await req.json();
  const parsed = tripSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
  }

  const { coverImage, description, ...rest } = parsed.data;
  const updated = await prisma.trip.update({
    where: { id },
    data: {
      ...rest,
      startDate: new Date(rest.startDate),
      endDate: new Date(rest.endDate),
      coverImage: coverImage || null,
      description: description || null,
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const trip = await prisma.trip.findUnique({ where: { id } });
  if (!trip || trip.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.trip.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

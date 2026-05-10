import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tripSchema } from "@/validations";
import { makeSlug } from "@/utils";

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
      return NextResponse.json({ error: parsed.error.issues.map((i) => i.message).join(", ") }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { name: true } });
    const userName = user?.name ?? "user";

    // Generate unique slug
    const baseSlug = makeSlug(userName, parsed.data.title);
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.trip.findUnique({ where: { slug } })) {
      attempt++;
      slug = makeSlug(userName, parsed.data.title, String(attempt));
    }

    const { coverImage, description, ...rest } = parsed.data;
    const trip = await prisma.trip.create({
      data: {
        ...rest,
        slug,
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

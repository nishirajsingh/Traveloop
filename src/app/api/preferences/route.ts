import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    try {
      const preferences = await prisma.userPreference.findUnique({
        where: { userId: user.id },
      });
      return NextResponse.json(preferences || null);
    } catch (e) {
      // Table might not exist yet
      return NextResponse.json(null);
    }
  } catch (error: any) {
    console.error("Preferences fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const body = await req.json();
    const { travelStyle, interests, budgetRange, preferredClimate } = body;

    try {
      const preferences = await prisma.userPreference.upsert({
        where: { userId: user.id },
        update: {
          travelStyle,
          interests,
          budgetRange,
          preferredClimate,
        },
        create: {
          userId: user.id,
          travelStyle,
          interests,
          budgetRange,
          preferredClimate,
        },
      });

      return NextResponse.json(preferences);
    } catch (e: any) {
      console.error("Preferences save error:", e);
      return NextResponse.json(
        { error: "Database table not ready. Please run: npx prisma migrate dev" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Preferences error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

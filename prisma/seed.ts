import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash("Demo1234", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@traveloop.com" },
    update: {},
    create: { name: "Demo User", email: "demo@traveloop.com", password },
  });

  const trip = await prisma.trip.upsert({
    where: { id: "seed-trip-1" },
    update: {},
    create: {
      id: "seed-trip-1",
      title: "Summer Europe Adventure",
      description: "A 3-week journey through Western Europe",
      startDate: new Date("2025-07-01"),
      endDate: new Date("2025-07-21"),
      totalBudget: 5000,
      isPublic: true,
      userId: user.id,
    },
  });

  const paris = await prisma.stop.upsert({
    where: { id: "seed-stop-1" },
    update: {},
    create: {
      id: "seed-stop-1",
      city: "Paris",
      country: "France",
      arrivalDate: new Date("2025-07-01"),
      departureDate: new Date("2025-07-07"),
      order: 0,
      tripId: trip.id,
    },
  });

  await prisma.activity.createMany({
    skipDuplicates: true,
    data: [
      { id: "seed-act-1", title: "Eiffel Tower Visit", cost: 30, category: "Activities", duration: "3 hours", stopId: paris.id },
      { id: "seed-act-2", title: "Hotel Lumiere", cost: 800, category: "Hotel", duration: "6 nights", stopId: paris.id },
      { id: "seed-act-3", title: "Louvre Museum", cost: 20, category: "Activities", duration: "4 hours", stopId: paris.id },
    ],
  });

  console.log("✅ Seed complete. Demo login: demo@traveloop.com / Demo1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());

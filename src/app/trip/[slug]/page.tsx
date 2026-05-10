import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Globe, Calendar, MapPin, DollarSign, Plane, ArrowRight } from "lucide-react";
import { formatDate, getDaysBetween, formatCurrency } from "@/utils";
import { TripStatusBadge } from "@/components/shared/TripStatusBadge";
import { CopyLinkButton } from "@/components/shared/CopyLinkButton";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const trip = await prisma.trip.findUnique({ where: { slug, isPublic: true }, select: { title: true, description: true } });
  if (!trip) return { title: "Trip not found" };
  return { title: `${trip.title} – Traveloop`, description: trip.description ?? undefined };
}

export default async function PublicTripPage({ params }: Props) {
  const { slug } = await params;

  const trip = await prisma.trip.findUnique({
    where: { slug, isPublic: true },
    include: {
      stops: { include: { activities: true }, orderBy: { order: "asc" } },
      user: { select: { name: true } },
    },
  });

  if (!trip) notFound();

  const totalSpent = trip.stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, a) => s + a.cost, 0),
    0
  );

  const publicUrl = `${process.env.NEXTAUTH_URL}/trip/${trip.slug}`;

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
              <Plane className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm tracking-tight text-[var(--color-text)]">Traveloop</span>
          </Link>
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs text-[var(--color-muted)]">Public Itinerary</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-5">
        {/* Hero card */}
        <div className="surface rounded-2xl overflow-hidden">
          {/* Cover image */}
          {trip.coverImage && (
            <div className="relative h-48 overflow-hidden">
              <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 photo-overlay" />
              <div className="absolute bottom-4 left-5">
                <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
              </div>
            </div>
          )}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-[var(--color-text)] mb-1">{trip.title}</h1>
                {trip.description && <p className="text-[var(--color-muted)] text-sm leading-relaxed">{trip.description}</p>}
                <p className="text-xs mono text-[var(--color-muted)]/60 mt-2">by {trip.user.name}</p>
              </div>
              {!trip.coverImage && <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Duration", value: `${getDaysBetween(trip.startDate, trip.endDate)} days`, icon: Calendar },
                { label: "Start", value: formatDate(trip.startDate), icon: Calendar },
                { label: "Cities", value: `${trip.stops.length} stops`, icon: MapPin },
                { label: "Est. Cost", value: formatCurrency(totalSpent), icon: DollarSign },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="surface-2 rounded-xl p-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className="w-3 h-3 text-[var(--color-muted)]" />
                    <p className="section-label">{label}</p>
                  </div>
                  <p className="text-sm font-bold text-[var(--color-text)] mono">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Copy-to-plan CTA */}
        <div className="surface rounded-2xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-[var(--color-text)]">Like this itinerary?</p>
            <p className="text-xs text-[var(--color-muted)]">Sign up to copy and customize it for yourself</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <CopyLinkButton url={publicUrl} />
            <Link href="/signup" className="btn-primary text-xs py-2 px-4">
              Copy Trip <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Itinerary Timeline */}
        <div className="space-y-4">
          <h2 className="text-xl font-black tracking-tight text-[var(--color-text)]">Itinerary</h2>
          {trip.stops.length === 0 && (
            <div className="surface rounded-2xl p-10 text-center text-[var(--color-muted)] text-sm">
              No stops added yet.
            </div>
          )}
          {trip.stops.map((stop, index) => (
            <div key={stop.id} className="surface rounded-2xl overflow-hidden card-lift">
              <div className="flex items-center gap-4 p-5 border-b border-[var(--color-border)]">
                <div className="w-9 h-9 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-sm font-black flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-[var(--color-text)] truncate">{stop.city}, {stop.country}</h3>
                  <p className="text-xs mono text-[var(--color-muted)]">
                    {formatDate(stop.arrivalDate)} → {formatDate(stop.departureDate)}
                  </p>
                </div>
                <span className="text-sm font-bold mono text-emerald-500 flex-shrink-0">
                  {formatCurrency(stop.activities.reduce((s, a) => s + a.cost, 0))}
                </span>
              </div>

              {stop.activities.length > 0 && (
                <div className="p-4 space-y-2">
                  {stop.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 surface-2 rounded-xl">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs px-2 py-0.5 bg-[var(--color-primary)]/10 text-[var(--color-primary)] rounded-full flex-shrink-0">
                          {activity.category}
                        </span>
                        <span className="text-sm font-medium text-[var(--color-text)] truncate">{activity.title}</span>
                        {activity.duration && (
                          <span className="text-xs text-[var(--color-muted)] flex-shrink-0">· {activity.duration}</span>
                        )}
                      </div>
                      <span className="text-sm font-bold mono text-emerald-500 flex-shrink-0 ml-3">
                        {formatCurrency(activity.cost)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer CTA */}
        <div className="surface rounded-2xl p-8 text-center">
          <div className="w-12 h-12 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Plane className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-xl font-black tracking-tight text-[var(--color-text)] mb-2">Plan your own trip</h3>
          <p className="text-[var(--color-muted)] text-sm mb-5">Build multi-city itineraries, track budgets, and share with the world.</p>
          <Link href="/signup" className="btn-primary inline-flex">
            Start Planning for Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

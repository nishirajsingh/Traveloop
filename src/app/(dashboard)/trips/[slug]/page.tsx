import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  ArrowLeft, Globe, Lock, Calendar, DollarSign,
  MapPin, Package, BookOpen, BarChart2,
} from "lucide-react";
import { formatDate, getDaysBetween, formatCurrency } from "@/utils";
import { TripStatusBadge } from "@/components/shared/TripStatusBadge";
import { ItineraryBuilder } from "@/components/shared/ItineraryBuilder";
import { ShareTripButton } from "@/components/shared/ShareTripButton";

type Props = { params: Promise<{ slug: string }> };

export default async function TripDetailPage({ params }: Props) {
  const { slug } = await params;
  const session = await auth();

  const trip = await prisma.trip.findUnique({
    where: { slug },
    include: {
      stops: { include: { activities: true }, orderBy: { order: "asc" } },
      user: { select: { name: true } },
    },
  });

  if (!trip) notFound();
  if (!trip.isPublic && trip.userId !== session?.user?.id) notFound();

  const totalSpent = trip.stops.reduce(
    (sum, stop) => sum + stop.activities.reduce((s, a) => s + a.cost, 0),
    0
  );
  const totalDays = getDaysBetween(trip.startDate, trip.endDate);
  const budgetPct = trip.totalBudget > 0 ? Math.min((totalSpent / trip.totalBudget) * 100, 100) : 0;
  const publicUrl = `${process.env.NEXTAUTH_URL}/trip/${trip.slug}`;

  return (
    <div className="max-w-5xl mx-auto space-y-0 pb-10">

      {/* ── Cover Hero ── */}
      <div className="relative rounded-2xl overflow-hidden mb-5">
        {trip.coverImage ? (
          <>
            <div className="h-52 sm:h-64">
              <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover" />
            </div>
            <div className="absolute inset-0 photo-overlay" />
          </>
        ) : (
          <div className="h-28 bg-gradient-to-r from-[var(--color-primary)] to-blue-400 opacity-20 rounded-2xl" />
        )}

        {/* Back button */}
        <div className="absolute top-4 left-4">
          <Link
            href="/trips"
            className="w-9 h-9 bg-black/30 backdrop-blur-sm rounded-xl flex items-center justify-center text-white hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
        </div>

        {/* Top-right actions */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
          {trip.isPublic && <ShareTripButton publicUrl={publicUrl} slug={trip.slug ?? slug} />}
        </div>

        {/* Title overlay (only when cover image exists) */}
        {trip.coverImage && (
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  {trip.isPublic
                    ? <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    : <Lock className="w-3.5 h-3.5 text-white/60" />}
                  <span className="text-xs text-white/60 mono">/trip/{trip.slug}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
                  {trip.title}
                </h1>
                {trip.description && (
                  <p className="text-white/70 text-sm mt-1 line-clamp-1">{trip.description}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Title block (when no cover image) */}
      {!trip.coverImage && (
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/trips"
              className="w-9 h-9 surface rounded-xl flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors card-lift flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-2xl font-black tracking-tight text-[var(--color-text)]">{trip.title}</h1>
                {trip.isPublic
                  ? <Globe className="w-4 h-4 text-emerald-500" />
                  : <Lock className="w-4 h-4 text-[var(--color-muted)]" />}
              </div>
              {trip.description && <p className="text-[var(--color-muted)] text-sm">{trip.description}</p>}
              <p className="text-xs mono text-[var(--color-muted)]/60 mt-0.5">/trip/{trip.slug}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <TripStatusBadge startDate={trip.startDate} endDate={trip.endDate} />
            {trip.isPublic && <ShareTripButton publicUrl={publicUrl} slug={trip.slug ?? slug} />}
          </div>
        </div>
      )}

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Duration",   value: `${totalDays} days`,              icon: Calendar,   color: "text-blue-500",    bg: "bg-blue-500/10" },
          { label: "Start Date", value: formatDate(trip.startDate),        icon: Calendar,   color: "text-violet-500",  bg: "bg-violet-500/10" },
          { label: "Budget",     value: formatCurrency(trip.totalBudget),  icon: DollarSign, color: "text-amber-500",   bg: "bg-amber-500/10" },
          { label: "Spent",      value: formatCurrency(totalSpent),        icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="surface rounded-2xl p-4 card-lift">
            <div className="flex items-center justify-between mb-2">
              <p className="section-label">{label}</p>
              <div className={`w-7 h-7 ${bg} rounded-lg flex items-center justify-center`}>
                <Icon className={`w-3.5 h-3.5 ${color}`} />
              </div>
            </div>
            <p className="text-sm font-bold text-[var(--color-text)] mono leading-tight">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Budget Progress ── */}
      {trip.totalBudget > 0 && (
        <div className="surface rounded-2xl p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[var(--color-primary)]" />
              <p className="text-sm font-bold text-[var(--color-text)]">Budget Usage</p>
            </div>
            <div className="flex items-center gap-3 text-xs mono">
              <span className="text-[var(--color-muted)]">Spent: <span className="font-bold text-[var(--color-text)]">{formatCurrency(totalSpent)}</span></span>
              <span className="text-[var(--color-border-strong)]">/</span>
              <span className="text-[var(--color-muted)]">Budget: <span className="font-bold text-[var(--color-text)]">{formatCurrency(trip.totalBudget)}</span></span>
            </div>
          </div>
          <div className="h-3 bg-[var(--color-surface-2)] rounded-full overflow-hidden border border-[var(--color-border)]">
            <div
              className={`h-full rounded-full transition-all duration-700 ${totalSpent > trip.totalBudget ? "bg-red-500" : "bg-[var(--color-primary)]"}`}
              style={{ width: `${budgetPct}%` }}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className={`text-xs mono font-semibold ${totalSpent > trip.totalBudget ? "text-red-500" : "text-emerald-500"}`}>
              {totalSpent > trip.totalBudget
                ? `⚠ Over budget by ${formatCurrency(totalSpent - trip.totalBudget)}`
                : `✓ ${formatCurrency(trip.totalBudget - totalSpent)} remaining`}
            </p>
            <p className="text-xs mono text-[var(--color-muted)]">{Math.round(budgetPct)}%</p>
          </div>
        </div>
      )}

      {/* ── Stops summary strip ── */}
      {trip.stops.length > 0 && (
        <div className="surface rounded-2xl p-4 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
            <p className="text-sm font-bold text-[var(--color-text)]">Route</p>
            <span className="text-xs mono text-[var(--color-muted)]">{trip.stops.length} cities</span>
          </div>
          <div className="flex items-center gap-0 overflow-x-auto pb-1">
            {trip.stops.map((stop, i) => (
              <div key={stop.id} className="flex items-center gap-0 flex-shrink-0">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-8 h-8 bg-[var(--color-primary)]/10 border border-[var(--color-primary)]/30 rounded-xl flex items-center justify-center">
                    <span className="text-xs font-black text-[var(--color-primary)]">{i + 1}</span>
                  </div>
                  <p className="text-xs font-semibold text-[var(--color-text)] whitespace-nowrap">{stop.city}</p>
                  <p className="text-xs mono text-[var(--color-muted)] whitespace-nowrap">
                    {getDaysBetween(stop.arrivalDate, stop.departureDate)}d
                  </p>
                </div>
                {i < trip.stops.length - 1 && (
                  <div className="w-8 h-px bg-[var(--color-border)] mx-1 mb-5 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Itinerary Builder ── */}
      <div className="surface rounded-2xl p-5 mb-5">
        <ItineraryBuilder tripId={trip.id} initialStops={trip.stops} />
      </div>

      {/* ── Quick nav ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { href: `/budget?tripId=${trip.id}`,  label: "Budget",  sub: "Analytics",  icon: BarChart2, color: "text-amber-500",   bg: "bg-amber-500/10" },
          { href: `/packing?tripId=${trip.id}`, label: "Packing", sub: "Checklist",  icon: Package,   color: "text-violet-500",  bg: "bg-violet-500/10" },
          { href: `/notes?tripId=${trip.id}`,   label: "Notes",   sub: "& Journal",  icon: BookOpen,  color: "text-blue-500",    bg: "bg-blue-500/10" },
        ].map(({ href, label, sub, icon: Icon, color, bg }) => (
          <Link
            key={href}
            href={href}
            className="surface rounded-2xl p-4 card-lift hover:border-[var(--color-primary)]/30 transition-all group"
          >
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
              <Icon className={`w-4 h-4 ${color}`} />
            </div>
            <p className="text-sm font-bold text-[var(--color-text)]">{label}</p>
            <p className="text-xs text-[var(--color-muted)]">{sub}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}

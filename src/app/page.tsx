"use client";

import Link from "next/link";
import { useTheme } from "@/app/providers";
import { useEffect, useState } from "react";
import {
  Plane, Map, DollarSign, Package, BookOpen, Globe,
  ArrowRight, Star, Users, Zap, Shield, Sun, Moon,
  CheckCircle, ChevronRight, MapPin,
} from "lucide-react";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-all"
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-icon" style={{ transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}>
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </span>
    </button>
  );
}

const features = [
  { icon: Map, title: "Multi-City Itinerary", desc: "Drag-and-drop stop reordering with a live route map across unlimited cities.", tag: "Planner" },
  { icon: DollarSign, title: "Budget Analytics", desc: "Real-time pie & bar charts. Track spending by category with manual entries.", tag: "Finance" },
  { icon: Package, title: "Packing Checklist", desc: "Categorized lists with progress tracking so you never forget essentials.", tag: "Utility" },
  { icon: BookOpen, title: "Notes & Journal", desc: "Day-wise reminders and travel journal entries with inline editing.", tag: "Journal" },
  { icon: Globe, title: "Public Sharing", desc: "Share read-only itineraries via a public link. Let others copy your trip.", tag: "Social" },
  { icon: Zap, title: "Dynamic City Search", desc: "Search 100k+ cities powered by GeoDB & Teleport APIs.", tag: "Data" },
];

const destinations = [
  { city: "Tokyo", country: "Japan", img: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600&q=80", days: "7 days" },
  { city: "Santorini", country: "Greece", img: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600&q=80", days: "5 days" },
  { city: "New York", country: "USA", img: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&q=80", days: "6 days" },
  { city: "Bali", country: "Indonesia", img: "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&q=80", days: "8 days" },
];

const stats = [
  { value: "100K+", label: "Cities Available" },
  { value: "4", label: "Budget Categories" },
  { value: "∞", label: "Trips & Stops" },
  { value: "100%", label: "Free to Use" },
];

const contributors = [
  { name: "Nishiraj Singh Panwar", role: "Leader", github: "nishirajsingh", avatar: "N" },
  { name: "Kunal Solanki", role: "Member", github: "kunalsolanki01", avatar: "K" },
  { name: "Shankar Soni", role: "Member", github: "Shankar-soni-2006", avatar: "S" },
];

const steps = [
  { step: "01", title: "Create an Account", desc: "Sign up in seconds — no credit card required." },
  { step: "02", title: "Plan Your Trip", desc: "Add cities, dates, and activities to your itinerary." },
  { step: "03", title: "Track Your Budget", desc: "Log expenses by category and watch analytics update live." },
  { step: "04", title: "Share & Explore", desc: "Share your itinerary publicly or keep it private." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--color-surface)]/90 backdrop-blur-md border-b border-[var(--color-border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Traveloop</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[var(--color-muted)]">
            <a href="#features" className="hover:text-[var(--color-text)] transition-colors">Features</a>
            <a href="#destinations" className="hover:text-[var(--color-text)] transition-colors">Destinations</a>
            <a href="#how-it-works" className="hover:text-[var(--color-text)] transition-colors">How it works</a>
            <a href="#team" className="hover:text-[var(--color-text)] transition-colors">Team</a>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login" className="btn-ghost hidden sm:inline-flex">Sign in</Link>
            <Link href="/signup" className="btn-primary">Get Started <ArrowRight className="w-3.5 h-3.5" /></Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1800&q=85"
            alt="Travel hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 hero-video-overlay" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-16 w-full">
          <div className="max-w-2xl">
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-xs text-white/80 font-medium mb-6">
              <Star className="w-3 h-3 text-[#FBBF24]" />
              Production-grade travel planning platform
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-6">
              Your journey,<br />
              <span className="text-[#FBBF24]">full circle.</span>
            </h1>

            <p className="text-lg text-white/70 max-w-lg mb-10 leading-relaxed">
              Build multi-city itineraries, track budgets, manage packing lists,
              and share beautiful public trips — all in one place.
            </p>

            {/* Travel Loop Search Bar */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-2 flex flex-col sm:flex-row gap-2 max-w-xl mb-8">
              <div className="flex items-center gap-2 flex-1 bg-white/10 rounded-xl px-4 py-3">
                <MapPin className="w-4 h-4 text-[#FBBF24] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Where are you going?"
                  className="bg-transparent text-white placeholder:text-white/50 text-sm outline-none w-full"
                />
              </div>
              <Link
                href="/signup"
                className="flex items-center justify-center gap-2 bg-[#FBBF24] hover:bg-[#F59E0B] text-[#1E293B] font-bold text-sm px-6 py-3 rounded-xl transition-colors whitespace-nowrap"
              >
                Start Planning <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <p className="text-xs text-white/40">
              No credit card required · Demo: demo@traveloop.com / Demo1234
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2">
          <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
          <span className="text-xs text-white/40 tracking-widest uppercase">Scroll</span>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <section className="py-12 px-4 sm:px-6 border-b border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="stat-number text-[var(--color-primary)]">{value}</p>
              <p className="text-xs text-[var(--color-muted)] mt-1.5 section-label">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Destinations Bento ── */}
      <section id="destinations" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-label mb-2">Destinations</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Where will you go next?
              </h2>
            </div>
            <Link href="/signup" className="btn-ghost hidden sm:inline-flex">
              Explore all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {destinations.map(({ city, country, img, days }, i) => (
              <div
                key={city}
                className={`dest-card relative overflow-hidden rounded-2xl cursor-pointer card-lift border border-[var(--color-border)] ${i === 0 ? "lg:col-span-2 lg:row-span-2 h-80 lg:h-auto" : "h-48"}`}
              >
                <img src={img} alt={city} className="dest-card-img absolute inset-0" />
                <div className="absolute inset-0 photo-overlay" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-bold text-lg leading-tight">{city}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-white/60 text-xs">{country}</p>
                    <span className="text-xs mono bg-black/30 text-white/80 px-2 py-0.5 rounded-full">{days}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4 sm:px-6 bg-[var(--color-surface)]">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <p className="section-label mb-2">Features</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight max-w-lg">
              Everything you need to travel smarter
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map(({ icon: Icon, title, desc, tag }) => (
              <div key={title} className="surface-2 rounded-2xl p-6 card-lift group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 bg-[var(--color-primary)]/10 rounded-xl flex items-center justify-center">
                    <Icon className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <span className="section-label text-[var(--color-primary)]">{tag}</span>
                </div>
                <h3 className="font-bold text-[var(--color-text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12">
            <p className="section-label mb-2">Process</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Up and running in minutes</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="surface rounded-2xl p-6 card-lift">
                <p className="mono text-4xl font-black text-[var(--color-primary)]/20 mb-4">{step}</p>
                <h3 className="font-bold text-[var(--color-text)] mb-2">{title}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-14 px-4 sm:px-6 border-y border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="section-label mb-6">Built with</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {["Next.js 15", "TypeScript", "Tailwind CSS v4", "Prisma", "PostgreSQL", "NextAuth v5", "Recharts", "dnd-kit", "Zustand", "Zod", "Leaflet", "Framer Motion"].map((tech) => (
              <span key={tech} className="px-3 py-1.5 surface-2 rounded-lg text-xs text-[var(--color-muted)] mono hover:text-[var(--color-text)] transition-colors">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section id="team" className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="section-label mb-2">Contributors</p>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight">Meet the team</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            {contributors.map(({ name, role, github, avatar }) => (
              <div key={github} className="surface rounded-2xl p-6 card-lift text-center">
                <div className="w-16 h-16 bg-[var(--color-primary)] rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto mb-4">
                  {avatar}
                </div>
                <div className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] mb-3">
                  {role === "Leader" ? <Star className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {role}
                </div>
                <h3 className="font-bold text-[var(--color-text)] mb-1 text-sm">{name}</h3>
                <p className="text-xs text-[var(--color-muted)] mb-4 mono">@{github}</p>
                <a
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost text-xs w-full justify-center"
                >
                  <GithubIcon /> View Profile
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6 bg-[var(--color-surface)]">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-[var(--color-primary)] p-12 text-center">
            <div className="absolute inset-0 opacity-10">
              <img
                src="https://images.unsplash.com/photo-1488085061387-422e29b40080?w=1200&q=60"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Plane className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 tracking-tight">
                Ready for your next adventure?
              </h2>
              <p className="text-white/70 mb-8 max-w-md mx-auto">
                Join Traveloop today and start building itineraries that make every trip unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-white text-[var(--color-primary)] font-bold px-8 py-3.5 rounded-xl transition-all hover:bg-white/90 w-full sm:w-auto justify-center"
                >
                  Get Started Free <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium px-8 py-3.5 rounded-xl transition-colors border border-white/20 w-full sm:w-auto justify-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[var(--color-border)] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-[var(--color-primary)] rounded-lg flex items-center justify-center">
                <Plane className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold">Traveloop</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-[var(--color-muted)]">
              <a href="#features" className="hover:text-[var(--color-text)] transition-colors">Features</a>
              <a href="#team" className="hover:text-[var(--color-text)] transition-colors">Team</a>
              <Link href="/login" className="hover:text-[var(--color-text)] transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-[var(--color-text)] transition-colors">Sign Up</Link>
            </div>
            <div className="flex items-center gap-2">
              {contributors.map(({ github, avatar }) => (
                <a
                  key={github}
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`@${github}`}
                  className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform"
                >
                  {avatar}
                </a>
              ))}
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-[var(--color-border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--color-muted)]">
            <p>© {new Date().getFullYear()} Traveloop. Built with ❤️ by the team.</p>
            <div className="flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Secure · Private · Open Source</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

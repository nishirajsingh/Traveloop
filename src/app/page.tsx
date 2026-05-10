import Link from "next/link";
import {
  Plane, Map, DollarSign, Package, BookOpen, Globe,
  ArrowRight, Star, Users, Zap, Shield,
  CheckCircle, ChevronRight,
} from "lucide-react";

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const features = [
  { icon: Map, title: "Multi-City Itinerary", desc: "Plan trips across multiple cities with drag-and-drop stop reordering and a live route map.", color: "text-blue-400", bg: "bg-blue-500/10" },
  { icon: DollarSign, title: "Budget Analytics", desc: "Track spending by category with real-time pie & bar charts. Add manual spend entries instantly.", color: "text-teal-400", bg: "bg-teal-500/10" },
  { icon: Package, title: "Packing Checklist", desc: "Categorized packing lists with progress tracking so you never forget essentials again.", color: "text-purple-400", bg: "bg-purple-500/10" },
  { icon: BookOpen, title: "Notes & Journal", desc: "Keep day-wise reminders and travel journal entries with inline editing.", color: "text-orange-400", bg: "bg-orange-500/10" },
  { icon: Globe, title: "Public Sharing", desc: "Share read-only itineraries via a public link. Let others copy and customize your trip.", color: "text-pink-400", bg: "bg-pink-500/10" },
  { icon: Zap, title: "Dynamic City Search", desc: "Search 100k+ cities powered by GeoDB & Teleport APIs with population data.", color: "text-yellow-400", bg: "bg-yellow-500/10" },
];

const stats = [
  { value: "100K+", label: "Cities Available" },
  { value: "4", label: "Budget Categories" },
  { value: "∞", label: "Trips & Stops" },
  { value: "100%", label: "Free to Use" },
];

const contributors = [
  {
    name: "Nishiraj Singh Panwar",
    role: "Leader",
    github: "nishirajsingh",
    avatar: "N",
    gradient: "from-blue-500 to-teal-500",
    badge: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  {
    name: "Kunal Solanki",
    role: "Member",
    github: "kunalsolanki01",
    avatar: "K",
    gradient: "from-purple-500 to-pink-500",
    badge: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    name: "Shankar Soni",
    role: "Member",
    github: "Shankar-soni-2006",
    avatar: "S",
    gradient: "from-orange-500 to-red-500",
    badge: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
];

const steps = [
  { step: "01", title: "Create an Account", desc: "Sign up in seconds — no credit card required." },
  { step: "02", title: "Plan Your Trip", desc: "Add cities, dates, and activities to your itinerary." },
  { step: "03", title: "Track Your Budget", desc: "Log expenses by category and watch analytics update live." },
  { step: "04", title: "Share & Explore", desc: "Share your itinerary publicly or keep it private." },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-[#334155]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-white">Traveloop</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#94A3B8]">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#team" className="hover:text-white transition-colors">Team</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-[#94A3B8] hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-xl transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-64 h-64 bg-purple-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-blue-500/30 text-xs text-blue-400 font-medium mb-8">
            <Star className="w-3 h-3" />
            Production-grade travel planning platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Plan trips that{" "}
            <span className="bg-gradient-to-r from-blue-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
              actually happen
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-[#94A3B8] max-w-2xl mx-auto mb-10 leading-relaxed">
            Traveloop is a modern travel itinerary platform. Build multi-city trips, track budgets,
            manage packing lists, and share beautiful public itineraries — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-500/25"
            >
              Start Planning Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="flex items-center gap-2 glass hover:bg-[#334155]/50 text-white font-medium px-8 py-3.5 rounded-xl transition-colors border border-[#334155]"
            >
              Sign In
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <p className="text-xs text-[#475569] mt-5">
            No credit card required · Demo: demo@traveloop.com / Demo1234
          </p>
        </div>

        {/* Hero mockup card */}
        <div className="max-w-4xl mx-auto mt-16 relative z-10">
          <div className="glass rounded-2xl p-1 shadow-2xl shadow-black/40 border border-[#334155]">
            <div className="bg-[#0F172A] rounded-xl p-6 space-y-4">
              {/* Fake browser bar */}
              <div className="flex items-center gap-2 pb-4 border-b border-[#1E293B]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <div className="flex-1 mx-4 h-6 bg-[#1E293B] rounded-lg flex items-center px-3">
                  <span className="text-xs text-[#475569]">traveloop.app/trips/summer-europe</span>
                </div>
              </div>
              {/* Fake trip UI */}
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { city: "Paris", country: "France", days: "6 days", cost: "$1,240", emoji: "🗼" },
                  { city: "Rome", country: "Italy", days: "5 days", cost: "$980", emoji: "🏛️" },
                  { city: "Barcelona", country: "Spain", days: "4 days", cost: "$860", emoji: "🌊" },
                ].map((stop) => (
                  <div key={stop.city} className="glass rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl">{stop.emoji}</span>
                      <div>
                        <p className="text-sm font-semibold text-white">{stop.city}</p>
                        <p className="text-xs text-[#94A3B8]">{stop.country}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#94A3B8]">{stop.days}</span>
                      <span className="text-xs font-medium text-teal-400">{stop.cost}</span>
                    </div>
                    <div className="mt-2 h-1 bg-[#334155] rounded-full">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: "65%" }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-4 text-xs text-[#94A3B8]">
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-teal-400" /> 15 days total</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-teal-400" /> 3 cities</span>
                  <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-teal-400" /> $3,080 budget</span>
                </div>
                <span className="text-xs px-2 py-1 bg-teal-500/20 text-teal-400 rounded-full border border-teal-500/30">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-12 px-4 sm:px-6 border-y border-[#1E293B]">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
          {stats.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-teal-400 bg-clip-text text-transparent">
                {value}
              </p>
              <p className="text-sm text-[#94A3B8] mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-blue-400 font-medium mb-3 uppercase tracking-widest">Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to travel smarter
            </h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              From itinerary building to budget tracking — Traveloop has every tool a modern traveller needs.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc, color, bg }) => (
              <div
                key={title}
                className="glass rounded-2xl p-6 hover:border-blue-500/30 border border-transparent transition-all group"
              >
                <div className={`w-11 h-11 ${bg} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-[#94A3B8] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 bg-[#0A1120]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-teal-400 font-medium mb-3 uppercase tracking-widest">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Up and running in minutes</h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">Four simple steps to your perfect trip.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map(({ step, title, desc }) => (
              <div key={step} className="relative">
                <div className="glass rounded-2xl p-6 h-full">
                  <p className="text-4xl font-black bg-gradient-to-br from-blue-500/30 to-teal-500/30 bg-clip-text text-transparent mb-4">
                    {step}
                  </p>
                  <h3 className="font-semibold text-white mb-2">{title}</h3>
                  <p className="text-sm text-[#94A3B8] leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="py-16 px-4 sm:px-6 border-y border-[#1E293B]">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-xs text-[#475569] uppercase tracking-widest mb-6">Built with</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {["Next.js 15", "TypeScript", "Tailwind CSS", "Prisma", "PostgreSQL", "NextAuth", "Recharts", "dnd-kit", "Zustand", "Zod", "Leaflet"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 glass rounded-lg text-xs text-[#94A3B8] border border-[#334155] hover:text-white hover:border-blue-500/40 transition-colors"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team / Contributors ── */}
      <section id="team" className="py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm text-purple-400 font-medium mb-3 uppercase tracking-widest">Contributors</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Meet the team</h2>
            <p className="text-[#94A3B8] max-w-xl mx-auto">
              Built with passion by a dedicated team of developers.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {contributors.map(({ name, role, github, avatar, gradient, badge }) => (
              <div
                key={github}
                className="glass rounded-2xl p-6 text-center hover:border-blue-500/30 border border-transparent transition-all group"
              >
                {/* Avatar */}
                <div className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4 group-hover:scale-105 transition-transform shadow-lg`}>
                  {avatar}
                </div>

                {/* Badge */}
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full border ${badge} mb-3`}>
                  {role === "Leader" ? <Star className="w-3 h-3" /> : <Users className="w-3 h-3" />}
                  {role}
                </span>

                <h3 className="font-semibold text-white mb-1">{name}</h3>
                <p className="text-xs text-[#94A3B8] mb-4">@{github}</p>

                <a
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-xs text-[#94A3B8] hover:text-white glass px-4 py-2 rounded-xl transition-all hover:border-[#475569] border border-[#334155]"
                >
                  <GithubIcon />
                  View Profile
                </a>
              </div>
            ))}
          </div>

          {/* Repo link */}
          <div className="mt-10 text-center">
            <a
              href="https://github.com/nishirajsingh"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 glass px-6 py-3 rounded-xl text-sm text-[#94A3B8] hover:text-white border border-[#334155] hover:border-blue-500/40 transition-all"
            >
              <GithubIcon />
              View on GitHub
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden border border-blue-500/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-teal-500/5 pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/30">
                <Plane className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Ready to plan your next adventure?
              </h2>
              <p className="text-[#94A3B8] mb-8 max-w-md mx-auto">
                Join Traveloop today and start building itineraries that make every trip unforgettable.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3.5 rounded-xl transition-all hover:scale-105 shadow-lg shadow-blue-500/25 w-full sm:w-auto justify-center"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/login"
                  className="flex items-center gap-2 glass hover:bg-[#334155]/50 text-white font-medium px-8 py-3.5 rounded-xl transition-colors border border-[#334155] w-full sm:w-auto justify-center"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#1E293B] py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-500 rounded-lg flex items-center justify-center">
                <Plane className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white">Traveloop</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-[#94A3B8]">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#team" className="hover:text-white transition-colors">Team</a>
              <Link href="/login" className="hover:text-white transition-colors">Sign In</Link>
              <Link href="/signup" className="hover:text-white transition-colors">Sign Up</Link>
            </div>

            <div className="flex items-center gap-3">
              {contributors.map(({ github, avatar, gradient }) => (
                <a
                  key={github}
                  href={`https://github.com/${github}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`@${github}`}
                  className={`w-8 h-8 bg-gradient-to-br ${gradient} rounded-full flex items-center justify-center text-white text-xs font-bold hover:scale-110 transition-transform`}
                >
                  {avatar}
                </a>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#475569]">
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

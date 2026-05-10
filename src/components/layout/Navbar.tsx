"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { Menu, Plus, Sun, Moon, ChevronRight } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/utils";

interface NavbarProps {
  onMenuClick: () => void;
}

const BREADCRUMB_STEPS = [
  { href: "/dashboard", label: "Overview" },
  { href: "/trips", label: "Trips" },
  { href: "/budget", label: "Budget" },
  { href: "/packing", label: "Packing" },
  { href: "/notes", label: "Notes" },
];

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;
  const isDark = theme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="w-9 h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border-strong)] transition-all"
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-icon" style={{ transform: isDark ? "rotate(0deg)" : "rotate(180deg)" }}>
        {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </span>
    </button>
  );
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  const activeIndex = BREADCRUMB_STEPS.findIndex(
    (s) => pathname === s.href || pathname.startsWith(s.href + "/")
  );

  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-6 flex-shrink-0">
      {/* Left: hamburger + breadcrumb loop */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Breadcrumb Loop Timeline */}
        <div className="hidden md:flex items-center gap-1.5">
          {BREADCRUMB_STEPS.map((step, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            return (
              <div key={step.href} className="flex items-center gap-1.5">
                <Link
                  href={step.href}
                  className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                    isActive
                      ? "text-[var(--color-primary)]"
                      : isPast
                      ? "text-[var(--color-text)]"
                      : "text-[var(--color-muted)]"
                  }`}
                >
                  <span className={`timeline-dot ${isActive || isPast ? "active" : ""}`} />
                  {step.label}
                </Link>
                {i < BREADCRUMB_STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-[var(--color-border-strong)]" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        <Link
          href="/trips/create"
          className="hidden sm:flex items-center gap-1.5 btn-primary py-2 px-3 text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          New Trip
        </Link>

        <ThemeToggle />

        {/* Avatar dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-xs font-bold hover:opacity-90 transition-opacity"
          >
            {session?.user?.name ? getInitials(session.user.name) : "U"}
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-11 surface rounded-xl p-2 min-w-[180px] z-50 shadow-lg">
              <p className="px-3 py-1.5 text-xs text-[var(--color-muted)] truncate mono">{session?.user?.email}</p>
              <div className="border-t border-[var(--color-border)] my-1" />
              <Link
                href="/trips/create"
                className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
                onClick={() => setShowDropdown(false)}
              >
                <Plus className="w-4 h-4" />
                New Trip
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

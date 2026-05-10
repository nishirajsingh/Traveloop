"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useTheme } from "@/app/providers";
import {
  LayoutDashboard, Map, DollarSign, Package, BookOpen,
  LogOut, Plane, X, Menu, Plus, Sun, Moon, ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getInitials } from "@/utils";

import { Sparkles, Settings } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Map },
  { href: "/recommendations", label: "AI Recommendations", icon: Sparkles },
  { href: "/budget", label: "Budget", icon: DollarSign },
  { href: "/packing", label: "Packing", icon: Package },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/preferences", label: "Preferences", icon: Settings },
];

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

function DesktopSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col h-full bg-[var(--color-surface)] border-r border-[var(--color-border)] transition-all duration-300 flex-shrink-0",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 border-b border-[var(--color-border)] flex-shrink-0 px-3", collapsed ? "justify-center" : "justify-between px-4")}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center flex-shrink-0">
              <Plane className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-base tracking-tight text-[var(--color-text)]">Traveloop</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={cn(
            "w-7 h-7 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-all flex-shrink-0",
            collapsed && "hidden"
          )}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {!collapsed && <p className="section-label px-3 py-2 mt-1">Navigation</p>}
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl text-sm font-medium transition-all",
                collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5",
                active
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && label}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle (when collapsed) + Sign out */}
      <div className="p-2 border-t border-[var(--color-border)] space-y-1">
        {collapsed && (
          <button
            onClick={onToggle}
            className="flex items-center justify-center w-10 h-10 mx-auto rounded-xl text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] transition-all"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "flex items-center gap-3 rounded-xl text-sm font-medium text-[var(--color-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all w-full",
            collapsed ? "justify-center w-10 h-10 mx-auto" : "px-3 py-2.5"
          )}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && "Sign Out"}
        </button>
      </div>
    </aside>
  );
}

function MobileSidebar({ onClose }: { onClose: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex flex-col h-full w-64 bg-[var(--color-surface)] border-r border-[var(--color-border)]">
      <div className="flex items-center justify-between px-4 h-16 border-b border-[var(--color-border)] flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-base tracking-tight text-[var(--color-text)]">Traveloop</span>
        </Link>
        <button onClick={onClose} className="text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <p className="section-label px-3 py-2 mt-1">Navigation</p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                active
                  ? "bg-[var(--color-primary)] text-white"
                  : "text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
              )}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-[var(--color-border)]">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[var(--color-muted)] hover:text-red-500 hover:bg-red-500/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}

function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [showDropdown, setShowDropdown] = useState(false);

  const activeIndex = BREADCRUMB_STEPS.findIndex(
    (s) => pathname === s.href || pathname.startsWith(s.href + "/")
  );

  return (
    <header className="h-16 bg-[var(--color-surface)] border-b border-[var(--color-border)] flex items-center justify-between px-4 lg:px-5 flex-shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-2)] flex items-center justify-center text-[var(--color-muted)] hover:text-[var(--color-text)] transition-all"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Breadcrumb Loop */}
        <div className="hidden md:flex items-center gap-1">
          {BREADCRUMB_STEPS.map((step, i) => {
            const isActive = i === activeIndex;
            const isPast = i < activeIndex;
            return (
              <div key={step.href} className="flex items-center gap-1">
                <Link
                  href={step.href}
                  className={cn(
                    "flex items-center gap-1.5 text-xs font-medium transition-colors px-2 py-1 rounded-lg",
                    isActive
                      ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10"
                      : isPast
                      ? "text-[var(--color-text)] hover:bg-[var(--color-surface-2)]"
                      : "text-[var(--color-muted)] hover:bg-[var(--color-surface-2)]"
                  )}
                >
                  <span className={cn("timeline-dot", (isActive || isPast) && "active")} />
                  {step.label}
                </Link>
                {i < BREADCRUMB_STEPS.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-[var(--color-border-strong)] flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href="/trips/create" className="hidden sm:flex items-center gap-1.5 btn-primary py-2 px-3 text-xs">
          <Plus className="w-3.5 h-3.5" /> New Trip
        </Link>
        <ThemeToggle />
        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 bg-[var(--color-primary)] rounded-xl flex items-center justify-center text-white text-xs font-black hover:opacity-90 transition-opacity"
          >
            {session?.user?.name ? getInitials(session.user.name) : "U"}
          </button>
          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-11 surface rounded-xl p-2 min-w-[200px] z-50 shadow-xl">
                <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                  <p className="text-xs font-semibold text-[var(--color-text)] truncate">{session?.user?.name}</p>
                  <p className="text-xs mono text-[var(--color-muted)] truncate">{session?.user?.email}</p>
                </div>
                <Link
                  href="/trips/create"
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-surface-2)] rounded-lg transition-colors"
                  onClick={() => setShowDropdown(false)}
                >
                  <Plus className="w-4 h-4" /> New Trip
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/login" })}
                  className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors w-full"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-bg)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-bg)]">
      {/* Desktop Sidebar */}
      <DesktopSidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full">
            <MobileSidebar onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Topbar onMenuClick={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}

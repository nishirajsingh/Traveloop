"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard, Map, DollarSign, Package,
  BookOpen, LogOut, Plane, X, Sparkles, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/trips", label: "My Trips", icon: Map },
  { href: "/recommendations", label: "AI Recommendations", icon: Sparkles },
  { href: "/budget", label: "Budget", icon: DollarSign },
  { href: "/packing", label: "Packing", icon: Package },
  { href: "/notes", label: "Notes", icon: BookOpen },
  { href: "/preferences", label: "Preferences", icon: Settings },
];

interface SidebarProps { onClose?: () => void; }

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex flex-col h-full bg-[var(--color-surface)] border-r border-[var(--color-border)]">
      {/* Logo */}
      <div className="flex items-center justify-between px-5 h-16 border-b border-[var(--color-border)] flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2.5" onClick={onClose}>
          <div className="w-8 h-8 bg-[var(--color-primary)] rounded-xl flex items-center justify-center">
            <Plane className="w-4 h-4 text-white" />
          </div>
          <span className="font-black text-base tracking-tight text-[var(--color-text)]">Traveloop</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-[var(--color-muted)] hover:text-[var(--color-text)] transition-colors">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Nav */}
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

      {/* Sign out */}
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

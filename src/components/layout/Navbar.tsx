"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Menu, Bell, Plus } from "lucide-react";
import Link from "next/link";
import { getInitials } from "@/utils";

interface NavbarProps {
  onMenuClick: () => void;
  title?: string;
}

export function Navbar({ onMenuClick, title }: NavbarProps) {
  const { data: session } = useSession();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <header className="h-16 glass border-b border-[#334155] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="lg:hidden text-[#94A3B8] hover:text-white transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && <h1 className="text-lg font-semibold text-white hidden sm:block">{title}</h1>}
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/trips/create"
          className="hidden sm:flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Trip
        </Link>

        <button className="relative text-[#94A3B8] hover:text-white transition-colors p-2">
          <Bell className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold"
          >
            {session?.user?.name ? getInitials(session.user.name) : "U"}
          </button>
          {showDropdown && (
            <div className="absolute right-0 top-10 glass rounded-xl p-2 min-w-[160px] z-50 shadow-xl">
              <p className="px-3 py-1.5 text-xs text-[#94A3B8] truncate">{session?.user?.email}</p>
              <div className="border-t border-[#334155] my-1" />
              <Link
                href="/trips/create"
                className="flex items-center gap-2 px-3 py-2 text-sm text-[#94A3B8] hover:text-white hover:bg-[#334155]/50 rounded-lg transition-colors"
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

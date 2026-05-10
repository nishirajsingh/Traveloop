"use client";

import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Loader2, X } from "lucide-react";
import type { CitySearchResult } from "@/types";

interface CitySearchProps {
  onSelect: (city: CitySearchResult) => void;
  placeholder?: string;
  value?: string;
}

export function CitySearch({ onSelect, placeholder = "Search cities...", value }: CitySearchProps) {
  const [query, setQuery] = useState(value || "");
  const [results, setResults] = useState<CitySearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) { setQuery(value); setSelected(!!value); }
  }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (selected || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/activities/search?q=${encodeURIComponent(query)}`);
        if (res.ok) { const data = await res.json(); setResults(data); setOpen(data.length > 0); }
      } finally { setLoading(false); }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, selected]);

  const handleSelect = (city: CitySearchResult) => {
    onSelect(city);
    // Show "City, State, Country" or "City, Country"
    const label = city.region
      ? `${city.name}, ${city.region}, ${city.country}`
      : `${city.name}, ${city.country}`;
    setQuery(label);
    setSelected(true);
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => { setQuery(""); setSelected(false); setResults([]); setOpen(false); };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)]" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(false); setOpen(true); }}
          onFocus={() => { if (!selected && query.length >= 2) setOpen(true); }}
          placeholder={placeholder}
          className={`input-base pl-9 pr-8 ${selected ? "border-emerald-500" : ""}`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-muted)] animate-spin" />
        )}
        {selected && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-muted)] hover:text-[var(--color-text)]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 surface rounded-xl overflow-hidden z-50 shadow-xl max-h-64 overflow-y-auto">
          {results.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--color-surface-2)] transition-colors text-left border-b border-[var(--color-border)] last:border-0"
            >
              <MapPin className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[var(--color-text)]">{city.name}</p>
                <p className="text-xs text-[var(--color-muted)]">
                  {city.region ? `${city.region}, ${city.country}` : city.country}
                </p>
              </div>
              {city.population && (
                <span className="text-xs mono text-[var(--color-muted)] flex-shrink-0 bg-[var(--color-surface-2)] px-1.5 py-0.5 rounded-md">
                  {city.population >= 1_000_000
                    ? `${(city.population / 1_000_000).toFixed(1)}M`
                    : `${(city.population / 1_000).toFixed(0)}K`}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.length >= 2 && results.length === 0 && !selected && (
        <div className="absolute top-full left-0 right-0 mt-1 surface rounded-xl px-4 py-3 z-50 shadow-xl">
          <p className="text-sm text-[var(--color-muted)]">No cities found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

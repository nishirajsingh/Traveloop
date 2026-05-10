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

  // sync external value
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
        if (res.ok) {
          const data = await res.json();
          setResults(data);
          setOpen(data.length > 0);
        }
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, selected]);

  const handleSelect = (city: CitySearchResult) => {
    onSelect(city);
    setQuery(`${city.name}, ${city.country}`);
    setSelected(true);
    setOpen(false);
    setResults([]);
  };

  const handleClear = () => {
    setQuery("");
    setSelected(false);
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setSelected(false); setOpen(true); }}
          onFocus={() => { if (!selected && query.length >= 2) setOpen(true); }}
          placeholder={placeholder}
          className={`w-full pl-9 pr-8 py-2.5 bg-[#0F172A]/60 border rounded-xl text-sm text-white placeholder:text-[#94A3B8] focus:outline-none transition-colors ${
            selected ? "border-teal-500" : "border-[#334155] focus:border-blue-500"
          }`}
        />
        {loading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] animate-spin" />
        )}
        {selected && !loading && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl overflow-hidden z-50 shadow-xl max-h-56 overflow-y-auto">
          {results.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => handleSelect(city)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#334155]/50 transition-colors text-left"
            >
              <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{city.name}</p>
                <p className="text-xs text-[#94A3B8]">{city.country}</p>
              </div>
              {city.population && (
                <span className="text-xs text-[#94A3B8] flex-shrink-0">
                  {(city.population / 1_000_000).toFixed(1)}M
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {open && !loading && query.length >= 2 && results.length === 0 && !selected && (
        <div className="absolute top-full left-0 right-0 mt-1 glass rounded-xl px-4 py-3 z-50 shadow-xl">
          <p className="text-sm text-[#94A3B8]">No cities found for &quot;{query}&quot;</p>
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import type { Stop } from "@/types";

interface TripMapProps {
  stops: Stop[];
}

async function geocodeCity(city: string, country: string): Promise<[number, number] | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(`${city}, ${country}`)}&format=json&limit=1`,
      { headers: { "Accept-Language": "en" } }
    );
    const data = await res.json();
    if (data[0]) return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
  } catch {}
  return null;
}

export function TripMap({ stops }: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || stops.length === 0) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!isMounted || !mapRef.current) return;

      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }

      const map = L.map(mapRef.current, { zoomControl: true, scrollWheelZoom: false });
      mapInstanceRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);

      const coords: [number, number][] = [];
      for (const stop of stops) {
        const coord = await geocodeCity(stop.city, stop.country);
        if (coord && isMounted) {
          coords.push(coord);
          L.marker(coord).addTo(map).bindPopup(`
            <div style="font-family:sans-serif;min-width:120px">
              <strong style="color:#1e293b">${stop.city}</strong><br/>
              <span style="color:#64748b;font-size:12px">${stop.country}</span><br/>
              <span style="color:#64748b;font-size:11px">${stop.activities?.length ?? 0} activities</span>
            </div>
          `);
        }
      }

      if (!isMounted) return;

      if (coords.length > 1) {
        L.polyline(coords, { color: "#3B82F6", weight: 2, dashArray: "6 4", opacity: 0.8 }).addTo(map);
      }

      if (coords.length > 0) {
        map.fitBounds(L.latLngBounds(coords), { padding: [40, 40] });
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [stops]);

  if (stops.length === 0) {
    return (
      <div className="h-64 glass rounded-xl flex items-center justify-center">
        <p className="text-sm text-[#94A3B8]">Add stops to see them on the map</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden border border-[#334155]" style={{ height: "320px" }}>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
}

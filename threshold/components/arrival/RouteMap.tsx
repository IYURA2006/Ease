"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap, TileLayer, Polyline, Marker } from "leaflet";
import type { RouteSegment } from "@/lib/routing/types";
import "leaflet/dist/leaflet.css";

// Edinburgh city centre — shown before any route is planned
const EDINBURGH: [number, number] = [55.9533, -3.1883];
const DEFAULT_ZOOM = 13;

const TILES = {
  standard: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, USGS, NOAA",
  },
};

const DIFFICULTY_COLOUR = {
  easy:   "#84A98C", // sage green
  medium: "#D4A017", // amber
  hard:   "#C4776A", // dusty rose
};

interface RouteMapProps {
  routeSegments?: RouteSegment[];
  startLat?: number;
  startLon?: number;
  destLat?: number;
  destLon?: number;
  className?: string;
}

export function RouteMap({
  routeSegments,
  startLat,
  startLon,
  destLat,
  destLon,
  className,
}: RouteMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<LeafletMap | null>(null);
  const tileLayerRef = useRef<TileLayer | null>(null);
  const segmentLinesRef = useRef<Polyline[]>([]);
  const startMarkerRef  = useRef<Marker | null>(null);
  const destMarkerRef   = useRef<Marker | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null);

  const [satellite, setSatellite]   = useState(false);
  const [mapReady, setMapReady]     = useState(false);
  const hasRoute = routeSegments && routeSegments.length > 0;

  // ── Init map once ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let mounted = true;

    import("leaflet").then((L) => {
      if (!mounted || !containerRef.current || mapRef.current) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:       "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:     "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      LRef.current = L;

      const map = L.map(containerRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView(EDINBURGH, DEFAULT_ZOOM);

      mapRef.current = map;

      tileLayerRef.current = L.tileLayer(TILES.standard.url, {
        attribution: TILES.standard.attribution,
        maxZoom: 19,
      }).addTo(map);

      setMapReady(true);
    });

    return () => {
      mounted = false;
      if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; }
    };
  }, []);

  // ── Swap tile layer when satellite toggles ─────────────────────────────────
  useEffect(() => {
    const L = LRef.current; const map = mapRef.current;
    if (!mapReady || !L || !map) return;

    tileLayerRef.current?.remove();
    const tile = satellite ? TILES.satellite : TILES.standard;
    tileLayerRef.current = L.tileLayer(tile.url, {
      attribution: tile.attribution,
      maxZoom: 19,
    }).addTo(map);
  }, [satellite, mapReady]);

  // ── Draw / update coloured route segments ──────────────────────────────────
  useEffect(() => {
    const L = LRef.current; const map = mapRef.current;
    if (!mapReady || !L || !map) return;

    // Clear previous route graphics
    segmentLinesRef.current.forEach((p) => p.remove());
    segmentLinesRef.current = [];
    startMarkerRef.current?.remove(); startMarkerRef.current = null;
    destMarkerRef.current?.remove();  destMarkerRef.current = null;

    if (!routeSegments || routeSegments.length === 0) return;

    const allCoords: [number, number][] = [];

    routeSegments.forEach((seg) => {
      if (seg.coordinates.length < 2) return;
      const colour = DIFFICULTY_COLOUR[seg.difficulty];
      const line = L.polyline(seg.coordinates, {
        color: colour,
        weight: 6,
        opacity: 0.88,
      }).addTo(map);
      segmentLinesRef.current.push(line);
      allCoords.push(...seg.coordinates);
    });

    if (allCoords.length >= 2) {
      const bounds = L.latLngBounds(allCoords);
      map.fitBounds(bounds, { padding: [44, 44] });
    }

    const startIcon = L.divIcon({
      html: `<div style="width:14px;height:14px;background:#2D6A6A;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
      iconSize: [14, 14], iconAnchor: [7, 7], className: "",
    });
    const destIcon = L.divIcon({
      html: `<div style="width:18px;height:18px;background:#C4776A;border:3px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.35)"></div>`,
      iconSize: [18, 18], iconAnchor: [9, 9], className: "",
    });

    if (startLat != null && startLon != null) {
      startMarkerRef.current = L.marker([startLat, startLon], { icon: startIcon })
        .addTo(map).bindPopup("<strong>Start</strong>");
    }
    if (destLat != null && destLon != null) {
      destMarkerRef.current = L.marker([destLat, destLon], { icon: destIcon })
        .addTo(map).bindPopup("<strong>Destination</strong>").openPopup();
    }
  }, [routeSegments, mapReady, startLat, startLon, destLat, destLon]);

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={className ?? "h-[420px] w-full"}
        aria-label="Route map"
        role="img"
      />

      {/* Satellite / map toggle */}
      {mapReady && (
        <button
          type="button"
          onClick={() => setSatellite((s) => !s)}
          className="absolute right-12 top-2 z-[1000] flex items-center gap-1.5 rounded-md border border-stone-300 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-text-primary shadow-sm backdrop-blur hover:bg-white"
          aria-pressed={satellite}
        >
          {satellite ? <><span aria-hidden>🗺</span> Map</> : <><span aria-hidden>🛰</span> Satellite</>}
        </button>
      )}

      {/* Difficulty legend — only shown when a route is drawn */}
      {mapReady && hasRoute && (
        <div className="absolute bottom-6 left-2 z-[1000] flex flex-col gap-1 rounded-lg border border-stone-200 bg-white/90 px-3 py-2 text-xs shadow-sm backdrop-blur">
          <p className="mb-0.5 font-semibold text-text-primary">Route difficulty</p>
          {(["easy", "medium", "hard"] as const).map((d) => (
            <span key={d} className="flex items-center gap-1.5 capitalize text-text-secondary">
              <span
                className="inline-block h-2.5 w-5 rounded-full"
                style={{ background: DIFFICULTY_COLOUR[d] }}
                aria-hidden
              />
              {d}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

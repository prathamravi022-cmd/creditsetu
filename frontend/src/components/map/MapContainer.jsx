import React, { useEffect, useRef, useState, useCallback } from 'react';

export default function MapContainer({ center, partners, selectedPartner, onSelectPartner }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersLayer = useRef(null);
  const [L, setL] = useState(null);
  const [icons, setIcons] = useState({ user: null, bank: null, selected: null });

  // Lazily load Leaflet
  useEffect(() => {
    let cancelled = false;
    import('leaflet').then((leaflet) => {
      if (cancelled) return;
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const userIcon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="width:18px;height:18px;background:#2563eb;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.35)"></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      const bankIcon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="width:14px;height:14px;background:#15803d;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const selectedIcon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="width:22px;height:22px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(0,0,0,0.4)"></div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });

      setL(leaflet);
      setIcons({ user: userIcon, bank: bankIcon, selected: selectedIcon });
    });
    return () => { cancelled = true; };
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || !L || mapInstance.current) return;

    const map = L.map(mapRef.current, {
      center,
      zoom: 11,
      zoomControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 18,
    }).addTo(map);

    markersLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    // Invalidate size after a short delay to fix sizing issues
    setTimeout(() => map.invalidateSize(), 100);

    return () => {
      map.remove();
      mapInstance.current = null;
      markersLayer.current = null;
    };
  }, [L]);

  // Update center
  useEffect(() => {
    if (mapInstance.current && center) {
      mapInstance.current.setView(center, mapInstance.current.getZoom());
    }
  }, [center]);

  // Update markers
  useEffect(() => {
    if (!mapInstance.current || !markersLayer.current || !L || !icons.user) return;
    const layer = markersLayer.current;
    layer.clearLayers();

    // User marker
    L.marker(center, { icon: icons.user }).bindPopup('<b>Your Location</b>').addTo(layer);

    // Partner markers
    partners.forEach((partner) => {
      const isSelected = selectedPartner?.id === partner.id;
      const marker = L.marker([partner.lat, partner.lng], {
        icon: isSelected ? icons.selected : icons.bank,
      }).addTo(layer);

      marker.bindPopup(`
        <div style="min-width:200px;font-family:system-ui,sans-serif">
          <h3 style="font-weight:600;font-size:14px;margin:0 0 4px;color:#065f46">${partner.name}</h3>
          <p style="font-size:12px;color:#64748b;margin:0 0 2px">${partner.bank_type_display} · ${partner.branch_name}</p>
          <p style="font-size:12px;color:#64748b;margin:0 0 4px">📍 ${partner.distance_km} km away</p>
          <p style="font-size:12px;margin:0 0 4px">
            NPA: <span style="color:${partner.npa_percentage > 10 ? '#ef4444' : '#15803d'};font-weight:600">${partner.npa_percentage}%</span>
          </p>
          ${partner.funds_available
            ? `<p style="font-size:12px;color:#15803d;font-weight:600;margin:0 0 8px">✓ Funds: ₹${(partner.funds_remaining / 100000).toFixed(1)}L</p>`
            : `<p style="font-size:12px;color:#ef4444;font-weight:600;margin:0 0 8px">✗ Funds Exhausted</p>`
          }
        </div>
      `);

      marker.on('click', () => onSelectPartner(partner));
    });

    // Fit bounds if markers exist
    if (partners.length > 0) {
      const bounds = [center, ...partners.map(p => [p.lat, p.lng])];
      mapInstance.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [partners, selectedPartner, L, icons, onSelectPartner]);

  if (!L) {
    return (
      <div className="h-[300px] sm:h-[400px] md:h-[500px] bg-slate-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200">
      <div
        ref={mapRef}
        className="h-[300px] sm:h-[400px] md:h-[500px] w-full"
        style={{ background: '#e2e8f0', zIndex: 0 }}
      />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm rounded-lg p-2.5 text-xs shadow-md z-[400]">
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-3 h-3 bg-blue-600 rounded-full border-2 border-white shadow-sm" />
          <span className="text-slate-600 font-medium">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-700 rounded-full border-2 border-white shadow-sm" />
          <span className="text-slate-600 font-medium">Eligible Bank</span>
        </div>
      </div>

      {/* Partner count badge */}
      <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium text-slate-700 shadow-md z-[400]">
        {partners.length} location{partners.length !== 1 ? 's' : ''} shown
      </div>
    </div>
  );
}

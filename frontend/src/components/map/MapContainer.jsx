import React, { useEffect, useRef, useState } from 'react';

export default function MapContainer({ center, partners, selectedPartner, onSelectPartner }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [L, setL] = useState(null);
  const [icons, setIcons] = useState({ user: null, bank: null, selected: null });

  // Lazily load Leaflet inside useEffect (avoids top-level await)
  useEffect(() => {
    let cancelled = false;

    import('leaflet').then((leaflet) => {
      if (cancelled) return;

      // Fix default marker icons
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const userIcon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="width:16px;height:16px;background:#3b82f6;border:3px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });

      const bankIcon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="width:14px;height:14px;background:#15803d;border:2px solid white;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const selectedIcon = leaflet.divIcon({
        className: 'custom-marker',
        html: `<div style="width:20px;height:20px;background:#f97316;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.4)"></div>`,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      setL(leaflet);
      setIcons({ user: userIcon, bank: bankIcon, selected: selectedIcon });
    });

    return () => { cancelled = true; };
  }, []);

  // Initialize map once L is loaded
  useEffect(() => {
    if (!mapRef.current || !L || mapInstance.current) return;

    mapInstance.current = L.map(mapRef.current, {
      center,
      zoom: 11,
      zoomControl: true,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
    }).addTo(mapInstance.current);

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [L]);

  // Update map center when userLocation changes
  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.setView(center, 11);
    }
  }, [center]);

  // Add markers
  useEffect(() => {
    if (!mapInstance.current || !L || !icons.user) return;

    // Collect markers to remove first, then remove (avoids skipping during iteration)
    const layersToRemove = [];
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        layersToRemove.push(layer);
      }
    });
    layersToRemove.forEach((layer) => mapInstance.current.removeLayer(layer));

    // User marker
    L.marker(center, { icon: icons.user }).addTo(mapInstance.current)
      .bindPopup('<b>Your Location</b>');

    // Partner markers
    partners.forEach((partner) => {
      const isSelected = selectedPartner?.id === partner.id;
      const marker = L.marker([partner.lat, partner.lng], {
        icon: isSelected ? icons.selected : icons.bank,
      }).addTo(mapInstance.current);

      marker.bindPopup(`
        <div style="min-width:200px">
          <h3 style="font-weight:600;font-size:14px;margin:0 0 4px">${partner.name}</h3>
          <p style="font-size:12px;color:#64748b;margin:0 0 4px">${partner.bank_type_display} • ${partner.branch_name}</p>
          <p style="font-size:12px;color:#64748b;margin:0 0 4px">Distance: ${partner.distance_km} km</p>
          <p style="font-size:12px;margin:0 0 4px">
            NPA: <span style="color:${partner.npa_percentage > 10 ? '#ef4444' : '#15803d'}">${partner.npa_percentage}%</span>
          </p>
          ${partner.funds_available
            ? `<p style="font-size:12px;color:#15803d;font-weight:600;margin:0 0 8px">✓ Funds Available: ₹${(partner.funds_remaining / 100000).toFixed(1)}L</p>`
            : `<p style="font-size:12px;color:#ef4444;font-weight:600;margin:0 0 8px">✗ Funds Exhausted</p>`
          }
        </div>
      `);

      marker.on('click', () => onSelectPartner(partner));
    });
  }, [partners, selectedPartner, L, icons, onSelectPartner]);

  if (!L) {
    return (
      <div className="h-[500px] bg-slate-200 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-slate-500 text-sm">Loading map library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-200">
      <div ref={mapRef} className="h-[500px] w-full" style={{ background: '#e2e8f0' }} />

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs shadow-sm z-[400]">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-green-500 rounded-full" />
          <span className="text-slate-600">Your Location</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-700 rounded-full" />
          <span className="text-slate-600">Eligible Bank</span>
        </div>
      </div>
    </div>
  );
}

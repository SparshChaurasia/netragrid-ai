import React, { useEffect, useRef } from 'react';
import { BLACKSPOT_MARKERS } from '../../lib/mockData';
import { REGIONAL_HOSPITALS_REGISTRY } from '../../lib/mockHospitals';
import type { Incident } from '../../types';

interface CommandMapProps {
  incidents: Incident[];
  onSelectIncident?: (incident: Incident) => void;
  height?: string;
}

export const CommandMapComponent: React.FC<CommandMapProps> = ({
  incidents,
  onSelectIncident,
  height = '320px',
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    // Dynamically import Leaflet on client side only to avoid SSR window error
    import('leaflet').then((L) => {
      if (!isMounted || !mapRef.current) return;

      if (!leafletInstance.current) {
        const map = L.map(mapRef.current, {
          center: [28.52, 77.12],
          zoom: 11,
          zoomControl: false,
        });

        L.control.zoom({ position: 'bottomright' }).addTo(map);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; OpenStreetMap',
        }).addTo(map);

        leafletInstance.current = map;
      }

      const map = leafletInstance.current;

      map.eachLayer((layer: any) => {
        if (
          layer instanceof L.Marker ||
          layer instanceof L.Circle ||
          layer instanceof L.Polyline
        ) {
          map.removeLayer(layer);
        }
      });

      // 1. Draw Blackspot markers
      BLACKSPOT_MARKERS.forEach((bs) => {
        const circle = L.circle([bs.lat, bs.lng], {
          color: '#0B7FF5',
          fillColor: '#0B7FF5',
          fillOpacity: 0.12,
          radius: 450,
        }).addTo(map);

        circle.bindTooltip(
          `<div style="font-family:sans-serif; color:#0F172A; background:#FFFFFF; border:1px solid #E2E8F0; padding:6px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
            <strong>📍 ${bs.name}</strong><br/>
            <span style="font-size:11px; color:#0B7FF5; font-weight:bold;">Blackspot Risk: ${bs.riskLevel} (${bs.incidentCount} past incidents)</span>
          </div>`,
          { direction: 'top', sticky: true }
        );
      });

      // 2. Draw Regional Hospital Facilities (TinyFish Registry)
      REGIONAL_HOSPITALS_REGISTRY.forEach((hosp) => {
        const hasIcu = hosp.beds.icuBedsAvailable > 0;
        const hospitalIcon = L.divIcon({
          className: 'custom-hospital-marker',
          html: `<div style="
            width: 26px;
            height: 26px;
            background-color: ${hasIcu ? '#10B981' : '#EF4444'};
            border: 2px solid #ffffff;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 13px;
            color: white;
            font-family: sans-serif;
          ">H</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const hospMarker = L.marker([hosp.coordinates.lat, hosp.coordinates.lng], {
          icon: hospitalIcon,
        }).addTo(map);

        hospMarker.bindTooltip(
          `<div style="font-family:sans-serif; color:#0F172A; background:#FFFFFF; border:1px solid #10B981; padding:8px; border-radius:8px; box-shadow:0 4px 10px rgba(0,0,0,0.15); min-width:180px;">
            <div style="display:flex; align-items:center; justify-content:space-between; gap:6px; margin-bottom:4px;">
              <strong style="color:#0F172A; font-size:12px;">🏥 ${hosp.name}</strong>
              <span style="background:#ECFDF5; color:#065F46; font-size:9px; padding:2px 5px; border-radius:4px; font-weight:bold;">${hosp.traumaLevel.replace('_', ' ')}</span>
            </div>
            <div style="font-size:10px; color:#475569; margin-bottom:4px;">${hosp.address}</div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px; font-size:10px; font-family:monospace; background:#F8FAFC; padding:4px 6px; border-radius:4px;">
              <div>ICU: <strong style="color:${hasIcu ? '#059669' : '#DC2626'}">${hosp.beds.icuBedsAvailable} free</strong></div>
              <div>Vents: <strong>${hosp.beds.ventilatorBedsAvailable} free</strong></div>
            </div>
            <div style="font-size:9px; color:#64748B; margin-top:4px;">108 Dispatch: ${hosp.phone}</div>
          </div>`,
          { direction: 'top' }
        );
      });

      // 3. Draw Active Collision Incidents & Routing vectors to Recommended Hospitals
      incidents.forEach((inc) => {
        const customIcon = L.divIcon({
          className: 'custom-leaflet-marker',
          html: `<div style="
            width: 26px;
            height: 26px;
            background-color: #EF4444;
            border: 2px solid #ffffff;
            border-radius: 50%;
            box-shadow: 0 0 12px rgba(239, 68, 68, 0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-size: 13px;
            color: white;
            animation: pulse 1.5s infinite;
          ">!</div>`,
          iconSize: [26, 26],
          iconAnchor: [13, 13],
        });

        const marker = L.marker([inc.coordinates.lat, inc.coordinates.lng], {
          icon: customIcon,
        }).addTo(map);

        marker.bindTooltip(
          `<div style="font-family:sans-serif; color:#0F172A; background:#FFFFFF; border:1px solid #EF4444; padding:8px; border-radius:6px; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1);">
            <strong style="color:#EF4444;">🚨 ${inc.id}: ${inc.severity}</strong><br/>
            <span>${inc.location}</span><br/>
            <span style="font-size:10px; color:#64748B; font-weight:bold;">Status: ${inc.status}</span>
            ${
              inc.hospitalRecommendation
                ? `<br/><span style="font-size:10px; color:#059669; font-weight:bold;">🏥 108 Target: ${inc.hospitalRecommendation.name} (${inc.hospitalRecommendation.distanceKm} km)</span>`
                : ''
            }
          </div>`,
          { direction: 'top' }
        );

        marker.on('click', () => {
          if (onSelectIncident) {
            onSelectIncident(inc);
          }
        });

        // 4. Draw 108 Ambulance Transit Vector Line if hospital recommendation is available
        if (inc.hospitalRecommendation) {
          const hospCoords = inc.hospitalRecommendation.coordinates;
          const routeLine = L.polyline(
            [
              [inc.coordinates.lat, inc.coordinates.lng],
              [hospCoords.lat, hospCoords.lng],
            ],
            {
              color: '#10B981',
              weight: 3.5,
              opacity: 0.85,
              dashArray: '6, 8',
            }
          ).addTo(map);

          routeLine.bindTooltip(
            `<div style="font-family:sans-serif; font-size:11px; background:#FFFFFF; border:1px solid #10B981; padding:4px 8px; border-radius:4px; font-weight:bold; color:#065F46;">
              🚑 108 Ambulance Route &rarr; ${inc.hospitalRecommendation.name} (${inc.hospitalRecommendation.distanceKm} km &bull; ~${inc.hospitalRecommendation.estimatedEtaMinutes}m)
            </div>`,
            { sticky: true }
          );
        }
      });
    });

    return () => {
      isMounted = false;
    };
  }, [incidents, onSelectIncident]);

  return (
    <div className="relative rounded-xl overflow-hidden border border-slate-200 shadow-xs">
      <div ref={mapRef} style={{ height }} className="w-full z-10" />
      <div className="absolute top-3 left-3 z-20 bg-white/90 backdrop-blur border border-slate-200 px-3 py-1.5 rounded-lg text-[11px] font-mono text-[#0B7FF5] flex items-center space-x-2 shadow-xs font-bold">
        <span className="w-1.5 h-1.5 rounded-full bg-[#0B7FF5] animate-pulse" />
        <span>Leaflet GIS Blackspot Map</span>
      </div>
    </div>
  );
};

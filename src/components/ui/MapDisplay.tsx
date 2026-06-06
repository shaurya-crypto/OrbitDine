"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Fix Leaflet's "releasePointerCapture" bug in Chrome
if (typeof window !== 'undefined' && Element.prototype.releasePointerCapture) {
  const originalReleasePointerCapture = Element.prototype.releasePointerCapture;
  Element.prototype.releasePointerCapture = function(pointerId) {
    try {
      if (this.hasPointerCapture(pointerId)) {
        originalReleasePointerCapture.call(this, pointerId);
      }
    } catch (e) {
      // Ignored
    }
  };
}

interface MapDisplayProps {
  position: { lat: number; lng: number };
}

export default function MapDisplay({ position }: MapDisplayProps) {
  return (
    <div className="w-full h-48 rounded-xl overflow-hidden border border-border z-0 relative">
      <MapContainer center={position} zoom={15} scrollWheelZoom={false} style={{ height: "100%", width: "100%", zIndex: 0 }}>
        <TileLayer
          attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Search } from "lucide-react";
import { useToast } from "@/components/ui/ToastProvider";

// Fix Leaflet's default icon path issues in Next.js
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

interface MapPickerProps {
  initialPosition?: { lat: number; lng: number };
  onPositionChange: (pos: { lat: number; lng: number }) => void;
  onLocationDetailsFetched?: (details: { address: string, city: string, state: string, country: string, pinCode: string }) => void;
}

function MapUpdater({ coords }: { coords: { lat: number; lng: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 15);
    }
  }, [coords, map]);
  return null;
}

function LocationMarker({ position, setPosition, onPositionChange, fetchLocationDetails }: any) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onPositionChange(e.latlng);
      fetchLocationDetails(e.latlng.lat, e.latlng.lng);
      map.flyTo(e.latlng, map.getZoom());
    },
    locationfound(e) {
      if (!position) {
        setPosition(e.latlng);
        onPositionChange(e.latlng);
        fetchLocationDetails(e.latlng.lat, e.latlng.lng);
        map.flyTo(e.latlng, map.getZoom());
      }
    },
  });

  useEffect(() => {
    map.locate();
  }, [map]);

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const marker = e.target;
          const pos = marker.getLatLng();
          setPosition(pos);
          onPositionChange(pos);
          fetchLocationDetails(pos.lat, pos.lng);
        },
      }}
    />
  );
}

export default function MapPicker({ initialPosition, onPositionChange, onLocationDetailsFetched }: MapPickerProps) {
  const [position, setPosition] = useState<any>(initialPosition || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchCoords, setSearchCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
      setSearchCoords(initialPosition);
    }
  }, [initialPosition?.lat, initialPosition?.lng]);

  const center = initialPosition || { lat: 37.7749, lng: -122.4194 };

  const fetchLocationDetails = async (lat: number, lng: number) => {
    if (!onLocationDetailsFetched) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;
        const details = {
          address: data.display_name || "",
          city: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          country: addr.country || "",
          pinCode: addr.postcode || ""
        };
        onLocationDetailsFetched(details);
      }
    } catch (e) {
      console.error("Reverse Geocoding Error", e);
    }
  };

  const toast = useToast();

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery) return;
    
    setSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
        setSearchCoords(newPos);
        setPosition(newPos);
        onPositionChange(newPos);
        fetchLocationDetails(newPos.lat, newPos.lng);
      } else {
        toast.warning("Location not found. Try a different search.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to search location.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      <form onSubmit={handleSearch} className="flex gap-2">
        <input 
          type="text"
          placeholder="Search location (e.g. Times Square, NY)"
          className="flex-1 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-accent"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          type="submit" 
          disabled={searching}
          className="px-4 py-2 bg-accent text-white rounded-xl font-medium hover:bg-accent/90 transition-colors flex items-center justify-center min-w-[110px]"
        >
          {searching ? "Searching..." : <><Search size={18} className="mr-2"/> Search</>}
        </button>
      </form>
      <div className="w-full h-64 rounded-xl overflow-hidden border border-zinc-800 relative z-0">
        <MapContainer center={center} zoom={13} scrollWheelZoom={true} style={{ height: "100%", width: "100%", zIndex: 0 }}>
          <TileLayer
            attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
          />
          <MapUpdater coords={searchCoords} />
          <LocationMarker position={position} setPosition={setPosition} onPositionChange={onPositionChange} fetchLocationDetails={fetchLocationDetails} />
        </MapContainer>
      </div>
    </div>
  );
}

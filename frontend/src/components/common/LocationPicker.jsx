import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icon in Leaflet + React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map clicks and move the marker
const LocationMarker = ({ position, setPosition, onLocationSelect }) => {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      reverseGeocode(lat, lng);
    },
  });

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: data.display_name
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom());
    }
  }, [position, map]);

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
};

const LocationPicker = ({ onLocationSelect, initialCoords }) => {
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState(initialCoords ? [initialCoords.lat, initialCoords.lng] : [12.9716, 77.5946]); // Default to Bangalore
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          reverseGeocode(latitude, longitude);
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by this browser.');
      setLoading(false);
    }
  };

  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await response.json();
      setAddress(data.display_name);
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: data.display_name
      });
    } catch (error) {
      console.error('Error reverse geocoding:', error);
    }
  };

  const searchLocation = async (searchText) => {
    if (!searchText) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`
      );
      const data = await response.json();
      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);
        setAddress(display_name);
        onLocationSelect({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          address: display_name
        });
      }
    } catch (error) {
      console.error('Error searching location:', error);
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 font-lato">
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-semibold text-gray-700">Set Service Location</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchLocation(address)}
            placeholder="Search for an area or address..."
            className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
          <button
            type="button"
            onClick={getCurrentLocation}
            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors"
            title="Use current location"
          >
            📍
          </button>
          <button
            type="button"
            onClick={() => searchLocation(address)}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md"
          >
            Search
          </button>
        </div>
        <p className="text-[11px] text-gray-400 italic">Tip: You can also click directly on the map to pin a location.</p>
      </div>

      <div className="h-72 w-full rounded-2xl overflow-hidden border-2 border-white shadow-xl z-0">
        <MapContainer center={position} zoom={13} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationPicker;
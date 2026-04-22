import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from 'react-leaflet';
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

const LocationPicker = ({ onLocationSelect, initialCoords, showRadius = false, radius = 50 }) => {
  const [address, setAddress] = useState('');
  const [position, setPosition] = useState(initialCoords ? [initialCoords.lat, initialCoords.lng] : [12.9716, 77.5946]); // Default to Bangalore
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // 🚀 Debounce search suggestions
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (address && address.length > 2 && !loading) {
        fetchSuggestions(address);
      } else {
        setSuggestions([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [address]);

  const fetchSuggestions = async (query) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`
      );
      const data = await response.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    const newPos = [parseFloat(lat), parseFloat(lon)];
    setPosition(newPos);
    setAddress(display_name);
    setSuggestions([]);
    setShowSuggestions(false);
    onLocationSelect({
      latitude: parseFloat(lat),
      longitude: parseFloat(lon),
      address: display_name
    });
  };

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
    setShowSuggestions(false);

    try {
      // 🚀 Pincode Priority: If 6 digits are found, prioritize postalcode search
      const pincodeMatch = searchText.match(/\b\d{6}\b/);
      let url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}&limit=1`;

      if (pincodeMatch) {
        console.log('📍 Pincode detected:', pincodeMatch[0]);
        url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${pincodeMatch[0]}&country=india&limit=1`;
      }

      const response = await fetch(url);
      const data = await response.json();

      if (data.length > 0) {
        const { lat, lon, display_name } = data[0];
        const newPos = [parseFloat(lat), parseFloat(lon)];
        setPosition(newPos);

        // Use the formal display name for accuracy, but keep user's input prefix if it was specific
        const finalAddress = display_name;
        setAddress(finalAddress);
        onLocationSelect({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          address: finalAddress
        });
      } else {
        alert("We couldn't pinpoint this exact area. Please check the address/pincode or click directly on the map.");
      }
    } catch (error) {
      console.error('Error searching location:', error);
      alert("Error searching for location. Please verify your connection.");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-4 font-lato">
      <div className="flex flex-col gap-2">
        <label className="block text-sm font-semibold text-gray-700">Set Service Location</label>
        <div className="flex gap-2 relative">
          <div className="flex-1 relative">
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchLocation(address)}
              placeholder="Search for an area, address, or 6-digit Pincode..."
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />

            {/* 🚀 Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white/90 backdrop-blur-md border border-gray-100 rounded-2xl shadow-2xl z-[2000] overflow-hidden animate-in">
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => handleSuggestionClick(s)}
                    className="px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-0 transition-colors"
                  >
                    <p className="text-sm font-bold text-gray-800 line-clamp-1">{s.display_name.split(',')[0]}</p>
                    <p className="text-[10px] text-gray-500 line-clamp-1">{s.display_name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={getCurrentLocation}
            className="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition-colors border border-blue-100 shadow-sm"
            title="Use current location"
          >
            📍
          </button>
          <button
            type="button"
            onClick={() => searchLocation(address)}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>
        <p className="text-[11px] text-gray-400 font-medium italic">
          <span className="text-blue-500">Tip:</span> Use a Pincode for faster results, or click directly on the map to pin.
        </p>
      </div>

      <div className="h-80 w-full rounded-2xl overflow-hidden border-4 border-white shadow-2xl z-0 relative group">
        <MapContainer center={position} zoom={17} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} setPosition={setPosition} onLocationSelect={onLocationSelect} />
          {showRadius && position && (
            <Circle
              center={position}
              radius={radius * 1000} // Convert KM to Meters
              pathOptions={{
                fillColor: '#3B82F6',
                fillOpacity: 0.1,
                color: '#3B82F6',
                weight: 1,
                dashArray: '5, 10'
              }}
            />
          )}
        </MapContainer>

        {/* Subtle Map Overlay for Premium Feel */}
        <div className="absolute inset-0 pointer-events-none border-[12px] border-white/10 rounded-2xl z-10"></div>
      </div>

      <style jsx="true">{`
        .animate-in {
          animation: slideUp 0.3s ease-out forwards;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default LocationPicker;
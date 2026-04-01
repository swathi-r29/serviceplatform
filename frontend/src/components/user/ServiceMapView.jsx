import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FaStar, FaPhoneAlt, FaMapMarkerAlt, FaToolbox } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom worker icon
const workerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
});

const ChangeView = ({ center }) => {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
};

const ServiceMapView = ({ providers, center = [12.9716, 77.5946] }) => {
  const navigate = useNavigate();

  // Filter providers that have coordinates
  const validProviders = providers.filter(p => p.coordinates && p.coordinates.lat && p.coordinates.lng);

  return (
    <div className="h-[600px] w-full rounded-3xl overflow-hidden shadow-2xl border-4 border-white relative z-0 group">
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-lg border border-blue-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
           <FaMapMarkerAlt className="text-blue-600" /> {validProviders.length} Professionals Near You
        </p>
      </div>

      <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} />
        
        {validProviders.map((provider) => (
          <Marker 
            key={provider._id} 
            position={[provider.coordinates.lat, provider.coordinates.lng]}
            icon={workerIcon}
          >
            <Popup className="custom-popup">
              <div className="p-1 min-w-[200px] font-lato">
                <div className="flex items-center gap-3 mb-3 border-b border-gray-100 pb-2">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden border border-blue-200">
                    {provider.profileImage ? (
                        <img src={`http://localhost:5000${provider.profileImage}`} alt={provider.name} className="w-full h-full object-cover" />
                    ) : (
                        <span className="font-bold text-blue-600">{provider.name.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 leading-tight">{provider.name}</h3>
                    <p className="text-[10px] text-gray-400 flex items-center gap-1 font-medium italic">
                        <FaMapMarkerAlt size={8} /> {provider.location || 'Local Provider'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 text-gray-500"><FaStar className="text-yellow-400" /> {provider.rating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-blue-600 font-bold">20+ Bookings</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {provider.skills?.slice(0, 3).map((skill, i) => (
                        <span key={i} className="text-[9px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">#{skill}</span>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => navigate(`/user/profile`)}
                  className="w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                >
                  <FaToolbox size={10} /> View Profile
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <style jsx="true">{`
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 16px;
          padding: 4px;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .custom-popup .leaflet-popup-tip {
          background: white;
        }
      `}</style>
    </div>
  );
};

export default ServiceMapView;

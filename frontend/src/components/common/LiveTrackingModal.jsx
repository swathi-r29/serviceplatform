import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { FaTimes, FaLocationArrow, FaPlay } from 'react-icons/fa';
import { useWebRTC } from '../../context/WebRTCContext';

// Custom Worker Icon
const workerIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/583/583093.png',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
});

// Component to recenter map
function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, 15);
    return null;
}

const LiveTrackingModal = ({ isOpen, onClose, bookingId, workerName }) => {
    const { socket } = useWebRTC();
    const [workerPos, setWorkerPos] = useState(null);
    const [isSimulating, setIsSimulating] = useState(false);

    useEffect(() => {
        if (!socket) return;

        socket.emit('joinBooking', bookingId);
        
        socket.on('location-ping', ({ coords }) => {
            setWorkerPos([coords.lat, coords.lng]);
        });

        return () => {
            socket.off('location-ping');
        };
    }, [socket, bookingId]);

    // --- Dev Simulation Logic ---
    const startSimulation = () => {
        setIsSimulating(true);
        // Start from a point and move slowly towards a destination
        let lat = 12.9716; // Default Bangalore center
        let lng = 77.5946;
        
        const interval = setInterval(() => {
            lat += 0.0001;
            lng += 0.0001;
            const newPos = { lat, lng };
            socket.emit('update-location', { bookingId, coords: newPos });
            
            if (!isOpen) clearInterval(interval);
        }, 2000);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white w-full max-w-4xl h-[80vh] rounded-3xl overflow-hidden shadow-2xl flex flex-col relative">
                
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10">
                    <div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight flex items-center gap-2">
                            <span className="w-3 h-3 bg-green-500 rounded-full animate-ping"></span>
                            Live Tracker: {workerName || 'Professional'}
                        </h2>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mt-1">Status: On the Way</p>
                    </div>
                    <button onClick={onClose} className="p-3 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors">
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Map Area */}
                <div className="flex-grow relative bg-gray-100">
                    <MapContainer 
                        center={workerPos || [12.9716, 77.5946]} 
                        zoom={15} 
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {workerPos && (
                            <>
                                <ChangeView center={workerPos} />
                                <Marker position={workerPos} icon={workerIcon}>
                                    <Popup className="font-bold">
                                        {workerName || 'Worker'} is here
                                    </Popup>
                                </Marker>
                            </>
                        )}
                    </MapContainer>

                    {/* Simulation Control (Developer Helper) */}
                    <div className="absolute bottom-6 left-6 z-[1000] flex flex-col gap-3">
                         {!workerPos && (
                             <div className="bg-white/90 backdrop-blur shadow-xl p-4 rounded-2xl border border-blue-100 animate-pulse">
                                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Waiting for GPS...</p>
                                 <p className="text-xs text-gray-500">The professional hasn't started the trip yet.</p>
                             </div>
                         )}
                         <button 
                            onClick={startSimulation}
                            className="flex items-center gap-2 px-6 py-3 bg-[#1a2b4b] text-white rounded-full font-bold text-xs shadow-xl hover:bg-blue-700 transition-all uppercase tracking-widest"
                         >
                            <FaPlay size={10} /> Simulate Worker Movement
                         </button>
                    </div>

                    {/* Quick Access Sidebar */}
                    <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
                        <button className="p-4 bg-white shadow-xl rounded-2xl text-blue-600 hover:bg-blue-50 transition-all border border-blue-100">
                            <FaLocationArrow />
                        </button>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="p-6 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg">
                            {workerName ? workerName.charAt(0) : 'P'}
                        </div>
                        <div>
                            <p className="text-sm font-black text-gray-900">{workerName || 'Professional'}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase">ETA: 12 Mins</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <div className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            Secure Tracking Active
                         </div>
                    </div>
                </div>
            </div>
            <style jsx="true">{`
                .animate-in { animation: fadeIn 0.3s ease-out; }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            `}</style>
        </div>
    );
};

export default LiveTrackingModal;

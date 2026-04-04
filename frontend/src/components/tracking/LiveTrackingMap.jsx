import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useWorkerTracking } from '../../hooks/useWorkerTracking';

// ── Fix Leaflet default icons ─────────────────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Blue pulsing icon for worker
const workerIcon = new L.DivIcon({
  className: '',
  html: `
    <div style="position:relative;width:36px;height:36px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.25);animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;"></div>
      <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:18px;height:18px;border-radius:50%;background:#2563eb;border:2px solid #fff;box-shadow:0 2px 8px rgba(37,99,235,0.6);display:flex;align-items:center;justify-content:center;">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/></svg>
      </div>
    </div>`,
  iconSize:   [36, 36],
  iconAnchor: [18, 18],
});

// Red pin icon for user destination
const destinationIcon = new L.DivIcon({
  className: '',
  html: `<div style="width:22px;height:22px;border-radius:50%;background:#ef4444;border:3px solid #fff;box-shadow:0 2px 6px rgba(239,68,68,0.6);"></div>`,
  iconSize:   [22, 22],
  iconAnchor: [11, 11],
});

// Sub-component: fits map bounds when both points are known
const FitBounds = ({ worker, destination }) => {
  const map = useMap();
  useEffect(() => {
    if (worker && destination) {
      const bounds = L.latLngBounds([
        [worker.lat, worker.lng],
        [destination.lat, destination.lng]
      ]);
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (worker) {
      map.setView([worker.lat, worker.lng], 15);
    }
  }, [worker, destination, map]);
  return null;
};

// ── Elapsed time helper ───────────────────────────────────────────────────────
const useElapsed = (since) => {
  const [elapsed, setElapsed] = useState('');
  useEffect(() => {
    if (!since) { setElapsed(''); return; }
    const tick = () => {
      const secs = Math.floor((Date.now() - since.getTime()) / 1000);
      if (secs < 60)        setElapsed(`${secs}s ago`);
      else if (secs < 3600) setElapsed(`${Math.floor(secs / 60)}m ago`);
      else                  setElapsed('a while ago');
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [since]);
  return elapsed;
};

// ── Status bar config ─────────────────────────────────────────────────────────
const STATUS_CONFIG = {
  idle:     { dot: 'bg-gray-400',  text: 'Locating worker...' },
  waiting:  { dot: 'bg-yellow-400 animate-pulse', text: 'Waiting for worker location...' },
  live:     { dot: 'bg-green-500 animate-pulse',  text: 'Worker is on the way' },
  lost:     { dot: 'bg-red-500',   text: 'Connection lost — retrying...' },
  stopped:  { dot: 'bg-gray-500',  text: 'Worker has arrived' },
};

// ── Main Component ─────────────────────────────────────────────────────────────
/**
 * Props:
 *   booking    — full booking object (must have locationCoords, worker._id resolved)
 *   workerName — string
 *   userId     — current user's _id for socket auth
 */
const LiveTrackingMap = ({ booking, workerName, userId }) => {
  const isActive = ['on-the-way', 'in-progress'].includes(booking?.status);

  const { workerLocation, connectionStatus, lastUpdated } = useWorkerTracking(
    booking?._id,
    userId,
    isActive
  );

  const elapsed = useElapsed(lastUpdated);
  const destination = booking?.locationCoords?.lat
    ? { lat: booking.locationCoords.lat, lng: booking.locationCoords.lng }
    : null;

  if (!isActive) return null;

  const statusCfg = STATUS_CONFIG[connectionStatus] || STATUS_CONFIG.idle;
  const center = workerLocation
    ? [workerLocation.lat, workerLocation.lng]
    : destination
    ? [destination.lat, destination.lng]
    : [12.9716, 77.5946]; // Bangalore fallback

  return (
    <div className="mt-4 rounded-xl overflow-hidden border border-blue-100 shadow-md">
      {/* ── Status bar ── */}
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${statusCfg.dot}`} />
          <span className="text-xs font-semibold text-gray-700">{statusCfg.text}</span>
        </div>
        {elapsed && (
          <span className="text-[10px] text-gray-400 font-medium">Updated {elapsed}</span>
        )}
      </div>

      {/* ── Map ── */}
      {!workerLocation && connectionStatus !== 'live' ? (
        <div
          className="flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 text-center"
          style={{ height: 280 }}
        >
          <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-blue-500 animate-pulse" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
          </div>
          <p className="text-sm font-semibold text-blue-700">{workerName || 'Worker'}</p>
          <p className="text-xs text-blue-500 mt-1">Waiting for worker to share location…</p>
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={14}
          zoomControl={false}
          style={{ height: 280, width: '100%' }}
        >
          <TileLayer
            attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Worker marker */}
          {workerLocation && (
            <Marker
              position={[workerLocation.lat, workerLocation.lng]}
              icon={workerIcon}
              title={`${workerName} • Live`}
            />
          )}

          {/* Destination marker */}
          {destination && (
            <Marker
              position={[destination.lat, destination.lng]}
              icon={destinationIcon}
              title="Your Location"
            />
          )}

          {/* Dashed line between worker and destination */}
          {workerLocation && destination && (
            <Polyline
              positions={[
                [workerLocation.lat, workerLocation.lng],
                [destination.lat, destination.lng]
              ]}
              pathOptions={{ color: '#3b82f6', dashArray: '8 6', weight: 2, opacity: 0.7 }}
            />
          )}

          <FitBounds worker={workerLocation} destination={destination} />
        </MapContainer>
      )}

      {/* Leaflet ping animation */}
      <style>{`@keyframes ping{75%,100%{transform:scale(2);opacity:0}}`}</style>
    </div>
  );
};

export default LiveTrackingMap;

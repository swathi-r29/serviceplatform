import { useLocationBroadcast } from '../../hooks/useLocationBroadcast';

/**
 * WorkerTrackingControls
 * Shown on the worker's active booking card when status === 'on-the-way'.
 *
 * Props:
 *   bookingId     — string
 *   bookingStatus — string
 *   workerId      — string (current worker's _id)
 */
const WorkerTrackingControls = ({ bookingId, bookingStatus, workerId }) => {
  const isActive = bookingStatus === 'on-the-way';

  const { isTracking, currentPosition, startTracking, stopTracking, error } =
    useLocationBroadcast(bookingId, workerId, isActive);

  if (!isActive) return null;

  return (
    <div className={`rounded-2xl p-4 mt-3 border ${
      error
        ? 'bg-amber-50 border-amber-200'
        : isTracking
        ? 'bg-green-50 border-green-200'
        : 'bg-white border-gray-200'
    }`}>

      {/* ── Error state ── */}
      {error && (
        <div className="mb-3">
          <p className="text-xs font-bold text-amber-700 mb-2">⚠ {error}</p>
          <button
            onClick={startTracking}
            className="text-xs font-bold text-amber-700 underline underline-offset-2 hover:text-amber-900 transition"
          >
            Try again
          </button>
        </div>
      )}

      {/* ── Tracking ACTIVE ── */}
      {isTracking ? (
        <>
          <div className="flex items-center gap-2 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
            </span>
            <span className="text-xs font-black text-green-700 uppercase tracking-widest">
              Live location active
            </span>
          </div>

          {currentPosition && (
            <p className="text-[10px] text-green-600 font-mono mb-3">
              {currentPosition.lat.toFixed(5)}, {currentPosition.lng.toFixed(5)}
            </p>
          )}

          <button
            onClick={stopTracking}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs transition-all shadow-md shadow-red-100"
          >
            <span className="text-base leading-none">⏹</span>
            Stop Sharing
          </button>
        </>
      ) : (
        /* ── NOT tracking ── */
        <>
          {!error && (
            <p className="text-xs text-gray-500 mb-3 font-medium">
              Share your location with the customer
            </p>
          )}

          <button
            onClick={startTracking}
            className="w-full flex items-center justify-center gap-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-100"
          >
            <span className="text-base leading-none">▶</span>
            Start Live Location
          </button>

          <p className="text-[10px] text-gray-400 text-center mt-2">
            Only shared during active service
          </p>
        </>
      )}
    </div>
  );
};

export default WorkerTrackingControls;

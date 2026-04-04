import { useState, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const TRACKING_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * useLocationBroadcast — WORKER side
 * Connects to the /tracking namespace and broadcasts GPS position.
 *
 * @param {string}  bookingId — MongoDB _id of the active booking
 * @param {string}  workerId  — current worker's user _id
 * @param {boolean} isActive  — mount connection only when booking is 'on-the-way'
 * @returns {{ isTracking, currentPosition, startTracking, stopTracking, error }}
 */
export const useLocationBroadcast = (bookingId, workerId, isActive) => {
  const [isTracking, setIsTracking]       = useState(false);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [error, setError]                 = useState('');
  const socketRef     = useRef(null);
  const watchIdRef    = useRef(null);

  // Connect socket once when active
  useEffect(() => {
    if (!isActive || !bookingId || !workerId) return;

    const socket = io(`${TRACKING_URL}/tracking`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    });
    socketRef.current = socket;

    socket.on('connect', () => console.log('[useLocationBroadcast] connected'));
    socket.on('tracking:started', () => console.log('[useLocationBroadcast] tracking started ack'));

    return () => {
      handleStop();
      socket.disconnect();
      socketRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingId, workerId, isActive]);

  const handleStop = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (socketRef.current?.connected) {
      socketRef.current.emit('worker:stop-tracking', { bookingId });
    }
    setIsTracking(false);
    setCurrentPosition(null);
  }, [bookingId]);

  const startTracking = useCallback(() => {
    setError('');
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      () => {
        // Permission granted — emit start and begin watching
        socketRef.current?.emit('worker:start-tracking', { bookingId, workerId });
        setIsTracking(true);

        watchIdRef.current = navigator.geolocation.watchPosition(
          (pos) => {
            const { latitude: lat, longitude: lng, heading } = pos.coords;
            setCurrentPosition({ lat, lng });
            socketRef.current?.emit('worker:location-update', {
              bookingId, lat, lng,
              heading: heading ?? null
            });
          },
          (err) => {
            console.error('[useLocationBroadcast] watchPosition error:', err);
            setError('Location access error. Please check your browser settings.');
            setIsTracking(false);
          },
          {
            enableHighAccuracy: true,
            maximumAge: 10000,
            timeout: 5000
          }
        );
      },
      () => {
        setError('Location permission required to share live tracking.');
      }
    );
  }, [bookingId, workerId]);

  const stopTracking = useCallback(() => {
    handleStop();
  }, [handleStop]);

  return { isTracking, currentPosition, startTracking, stopTracking, error };
};

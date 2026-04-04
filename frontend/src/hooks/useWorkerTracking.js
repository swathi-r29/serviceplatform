import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

const TRACKING_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * useWorkerTracking — USER side
 * Connects to the /tracking namespace and listens for live worker coordinates.
 *
 * @param {string}  bookingId  — MongoDB _id of the booking to watch
 * @param {string}  userId     — current authenticated user's _id
 * @param {boolean} isActive   — only connect when booking status is 'on-the-way'
 * @returns {{ workerLocation, connectionStatus, lastUpdated }}
 *   connectionStatus: 'idle' | 'waiting' | 'live' | 'lost' | 'stopped'
 */
export const useWorkerTracking = (bookingId, userId, isActive) => {
  const [workerLocation, setWorkerLocation] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [lastUpdated, setLastUpdated]           = useState(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isActive || !bookingId || !userId) return;

    setConnectionStatus('waiting');

    const socket = io(`${TRACKING_URL}/tracking`, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[useWorkerTracking] connected');
      // Subscribe to the booking room
      socket.emit('user:watch-booking', { bookingId, userId });
    });

    socket.on('location:updated', ({ lat, lng, heading, timestamp }) => {
      setWorkerLocation({ lat, lng, heading });
      setLastUpdated(new Date(timestamp));
      setConnectionStatus('live');
    });

    socket.on('tracking:stopped', () => {
      setConnectionStatus('stopped');
    });

    socket.on('tracking:worker-disconnected', () => {
      setConnectionStatus('lost');
    });

    socket.on('tracking:error', (err) => {
      console.error('[useWorkerTracking] error:', err.message);
      setConnectionStatus('idle');
    });

    socket.on('disconnect', () => {
      setConnectionStatus(prev => prev === 'live' ? 'lost' : prev);
    });

    socket.on('reconnect', () => {
      socket.emit('user:watch-booking', { bookingId, userId });
      setConnectionStatus('waiting');
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [bookingId, userId, isActive]);

  return { workerLocation, connectionStatus, lastUpdated };
};

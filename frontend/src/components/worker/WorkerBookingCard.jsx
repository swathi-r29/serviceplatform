import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWebRTC } from '../../context/WebRTCContext';
import { FaPhone } from 'react-icons/fa';
import LifecycleTimeline from '../common/LifecycleTimeline';
import BookingActions from './BookingActions';
import WorkerTrackingControls from '../tracking/WorkerTrackingControls';
import axios from '../../api/axios';

const WorkerBookingCard = ({ booking, onRefresh }) => {
  const { startStream, callUser, setIsCallModalOpen } = useWebRTC();

  // Decode workerId from JWT for the tracking hook
  const workerId = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id || payload._id || null;
    } catch { return null; }
  })();

  const handleWorkerCancel = async () => {
    const isConfirmed = window.confirm("Cancelling will give the customer a full refund and affect your reliability score. Continue?");
    if (!isConfirmed) return;
    
    try {
      await axios.post('/cancellation/cancel', {
        bookingId: booking._id,
        reason: 'Provider cancelled'
      });
      alert('Cancellation successful. The customer will receive a full refund.');
      onRefresh();
    } catch (error) {
      console.error('Cancel failed', error);
      alert(error.response?.data?.message || 'Failed to cancel the booking. Please contact support.');
    }
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    'on-the-way': 'bg-indigo-100 text-indigo-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  return (
    <div className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 min-h-[300px] flex flex-col group">
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${statusColors[booking.status]}`}>
              {booking.status}
            </span>
          </div>
          <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
            {booking.service?.name}
          </h3>
          <div className="space-y-1">
            <p className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <span className="text-gray-400 font-medium">Customer:</span> {booking.user?.name}
            </p>
            <p className="text-xs text-gray-500 font-medium">{booking.address}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-2xl font-black text-gray-900">₹{booking.totalAmount}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mt-1">
            {booking.paymentStatus === 'paid' ? '💰 Payment Confirmed' : '⌛ Payment Pending'}
          </p>
        </div>
      </div>

      <div className="bg-gray-50/50 rounded-xl p-4 mb-6">
        <LifecycleTimeline
          currentStatus={booking.status}
          history={booking.statusHistory}
        />
      </div>

      <div className="mt-auto space-y-3">
        {/* Call + Chat buttons for active bookings */}
        {['accepted', 'on-the-way', 'in-progress'].includes(booking.status) && (
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                startStream();
                callUser(booking.user._id);
                setIsCallModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-xl font-bold text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-100"
            >
              <FaPhone size={12} /> Call Customer
            </button>
            <Link
              to={`/chat/booking/${booking._id}`}
              className="flex items-center justify-center border border-gray-200 text-gray-600 font-bold text-xs rounded-xl hover:bg-gray-50 transition-all"
            >
              Open Messaging
            </Link>
          </div>
        )}

        {/* ── Live location controls (replaces old GPS simulation) ── */}
        <WorkerTrackingControls
          bookingId={booking._id}
          bookingStatus={booking.status}
          workerId={workerId}
        />

        {/* Status action buttons */}
        <div>
          <BookingActions booking={booking} onRefresh={onRefresh} />
        </div>

        {/* Worker Cancel Button */}
        {['pending', 'accepted'].includes(booking.status) && (
          <div className="pt-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={handleWorkerCancel}
              className="px-4 py-2 bg-white border border-red-200 text-red-500 text-xs font-bold rounded-lg hover:bg-red-50 transition"
            >
              Cancel Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkerBookingCard;

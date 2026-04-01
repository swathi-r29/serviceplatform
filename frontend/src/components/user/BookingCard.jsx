import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Payment from './Payment';
import ReviewForm from './ReviewForm';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import LifecycleTimeline from '../common/LifecycleTimeline';
import { useWebRTC } from '../../context/WebRTCContext';
import LiveTrackingModal from '../common/LiveTrackingModal';

const BookingCard = ({ booking, onCancel, onRefresh }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const { startStream, callUser, setIsCallModalOpen } = useWebRTC();
  const [isFavoriteWorker, setIsFavoriteWorker] = useState(false);

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    'on-the-way': 'bg-indigo-100 text-indigo-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  };

  const toggleFavoriteWorker = async () => {
    if (!booking.worker?._id) return;
    try {
      await axios.put(`/favorites/worker/${booking.worker._id}`);
      setIsFavoriteWorker(!isFavoriteWorker); // Simple toggle for UI feedback
      // onRefresh(); // Optional: refresh if we want global state update
      alert(isFavoriteWorker ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update favorite');
    }
  };

  // Helper to construct image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath; // Already absolute
    return `http://localhost:5000${imagePath}`; // Prepend backend URL
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5 flex flex-col md:flex-row gap-6 shadow-sm hover:shadow-md transition-shadow group">

        {/* Left: Service Image */}
        <div className="w-full md:w-48 h-48 md:h-auto flex-shrink-0 relative rounded-lg overflow-hidden bg-gray-100">
          {booking.service?.image ? (
            <img
              src={getImageUrl(booking.service.image)}
              alt={booking.service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.onerror = null;
                e.target.parentNode.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50"><svg class="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg></div>';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-50">
              <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
          {/* Status Badge Overlay (Mobile only or keep it clean?) - Let's put it in content */}
        </div>

        {/* Middle: Content */}
        <div className="flex-grow flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
              {booking.status === 'accepted' ? 'CONFIRMED' : booking.status}
            </span>
            {booking.status === 'accepted' && (
              <span className="px-2.5 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-green-100 text-green-700">
                ARRIVING SOON
              </span>
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900 font-playfair mb-1">
            {booking.service?.name}
          </h3>

          {/* Worker Info */}
          <div className="flex items-center gap-2 mb-4">
            <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
              {/* Placeholder for worker image */}
              <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              Pro: <span className="font-semibold text-gray-900">{booking.worker?.name || "Pending Assignment"}</span>
              {booking.worker && (
                <button
                  onClick={toggleFavoriteWorker}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                  title={isFavoriteWorker ? "Remove from favorites" : "Add to favorites"}
                >
                  {isFavoriteWorker ? <FaHeart className="text-red-500" /> : <FaRegHeart />}
                </button>
              )}
            </p>
            {booking.worker?.rating && (
              <div className="flex items-center text-yellow-500 text-sm">
                <span className="mr-0.5">★</span> {booking.worker.rating}
              </div>
            )}
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-500 font-lato">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {new Date(booking.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {booking.scheduledTime}
            </div>
          </div>

          {/* Payment Status */}
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900">₹{booking.totalAmount}</p>
          </div>
        </div>

        {/* Lifecycle Timeline */}
        <div className="w-full mt-4">
          <LifecycleTimeline currentStatus={booking.status} history={booking.statusHistory} />
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col md:items-end justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 min-w-[180px]">
          {['accepted', 'on-the-way', 'in-progress'].includes(booking.status) && (
            <>
              {booking.status === 'on-the-way' && (
                <button
                  onClick={() => setShowTracking(true)}
                  className="w-full px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 animate-bounce hover:animate-none"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
                  Track Live
                </button>
              )}
              <div className="flex gap-2 w-full">
                <button
                  onClick={() => {
                    startStream();
                    callUser(booking.worker._id);
                    setIsCallModalOpen(true);
                  }}
                  className="flex-1 px-4 py-2.5 bg-green-500 text-white text-sm font-bold rounded-lg hover:bg-green-600 transition flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>
                  Call
                </button>
                <Link
                  to={`/chat/booking/${booking._id}`}
                  className="flex-1 px-4 py-2.5 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition text-center flex items-center justify-center gap-2"
                >
                  Chat
                </Link>
              </div>
              <button
                onClick={() => setShowPayment(true)}
                className="w-full px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition shadow-sm"
              >
                {booking.paymentStatus === 'paid' ? 'View Receipt' : 'Pay Now'}
              </button>
            </>
          )}

          {booking.status === 'pending' && (
            <button
              onClick={() => onCancel(booking._id)}
              className="w-full px-5 py-2.5 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel
            </button>
          )}

          {booking.status === 'completed' && (
            <button
              onClick={() => setShowReview(true)}
              className="w-full px-5 py-2.5 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition shadow-sm"
            >
              Write Review
            </button>
          )}

          {(booking.status !== 'pending' && booking.status !== 'accepted' && booking.status !== 'completed') && (
            <button className="w-full px-5 py-2.5 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed">
              {booking.status}
            </button>
          )}
        </div>
      </div>

      {showPayment && (
        <Payment
          booking={booking}
          onClose={() => setShowPayment(false)}
          onSuccess={() => {
            setShowPayment(false);
            onRefresh();
          }}
        />
      )}

      {showReview && (
        <ReviewForm
          booking={booking}
          onClose={() => setShowReview(false)}
          onSuccess={() => {
            setShowReview(false);
            onRefresh();
          }}
        />
      )}

      {showTracking && (
        <LiveTrackingModal
          isOpen={showTracking}
          onClose={() => setShowTracking(false)}
          bookingId={booking._id}
          workerName={booking.worker?.name}
        />
      )}
    </>
  );
};

export default BookingCard;
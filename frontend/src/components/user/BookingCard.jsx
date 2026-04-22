import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import Payment from './Payment';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import LifecycleTimeline from '../common/LifecycleTimeline';
import { useWebRTC } from '../../context/WebRTCContext';
import LiveTrackingMap from '../tracking/LiveTrackingMap';
import CancelBookingModal from '../cancellation/CancelBookingModal';
import Receipt from './Receipt';

const BookingCard = ({ booking, onCancel, onRefresh }) => {
  const [showPayment, setShowPayment] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const { startStream, callUser, setIsCallModalOpen } = useWebRTC();

  // Decode userId from JWT stored in localStorage for socket auth
  const userId = (() => {
    try {
      const userData = JSON.parse(localStorage.getItem('user'));
      return userData?._id || userData?.id || null;
    } catch { return null; }
  })();

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    accepted: 'bg-blue-100 text-blue-800',
    'on-the-way': 'bg-indigo-100 text-indigo-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
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
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                <svg className="w-full h-full text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="text-sm text-gray-600 flex items-center gap-1.5 min-w-0">
                <span className="whitespace-nowrap">Pro:</span>
                <span className="font-semibold text-gray-900 whitespace-nowrap overflow-hidden text-ellipsis" title={booking.worker?.name}>
                  {booking.worker?.name || "Pending Assignment"}
                </span>
              </div>
            </div>
            {booking.worker?.rating !== undefined && (
              <div className="flex items-center text-yellow-600 text-sm font-medium flex-shrink-0">
                <span className="mr-0.5 text-yellow-500 text-base">★</span> 
                {booking.worker.rating > 0 ? booking.worker.rating : 'New'}
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-500 font-lato mt-auto">
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{new Date(booking.scheduledDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{booking.scheduledTime}</span>
            </div>
          </div>


          {/* Payment Status */}
          <div className="mt-3">
            <p className="text-2xl font-bold text-gray-900">₹{booking.totalAmount}</p>
            {booking.status === 'cancelled' && booking.refundStatus && booking.refundStatus !== 'none' && (
              <div className="mt-2 flex flex-col gap-1">
                <span className={`inline-flex self-start items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  booking.refundStatus === 'processing' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                  booking.refundStatus === 'processed' ? 'bg-green-100 text-green-800 border border-green-200' :
                  'bg-red-100 text-red-800 border border-red-200'
                }`}>
                  {booking.refundStatus === 'processing' ? 'Refund Processing' :
                   booking.refundStatus === 'processed' ? 'Refund Credited' :
                   'Refund Failed - Contact Support'}
                </span>
                {booking.refundAmount > 0 && <p className="text-sm font-semibold text-gray-600">₹{booking.refundAmount} refunded</p>}
              </div>
            )}
          </div>
        </div>

        {/* Lifecycle Timeline */}
        <div className="w-full mt-4">
          <LifecycleTimeline currentStatus={booking.status} history={booking.statusHistory} />
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col md:items-end justify-center gap-3 pt-4 md:pt-0 border-t md:border-t-0 md:border-l border-gray-100 md:pl-6 min-w-[180px]">
          {/* Only show old pay button or Chat/Call if not cancelled or rejected */}
          {['accepted', 'on-the-way', 'in-progress'].includes(booking.status) && (
            <>
          {['on-the-way', 'in-progress'].includes(booking.status) && (
            <button
               onClick={() => setShowTracking(!showTracking)}
               className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full border mb-2 transition-all ${
                 showTracking 
                 ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' 
                 : 'text-blue-600 bg-blue-50 border-blue-100 hover:bg-blue-100'
               }`}
            >
              <span className={`w-2 h-2 rounded-full ${showTracking ? 'bg-white' : 'bg-blue-500'} animate-pulse`} />
              {showTracking ? 'Hide Tracking Map' : 'Live Tracking Active'}
            </button>
          )}
              <div className="flex gap-2 w-full">
                <button
                  onClick={async () => {
                    setIsCallModalOpen(true);
                    await callUser(booking.worker._id);
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
                 onClick={() => {
                   if (booking.paymentStatus === 'paid') {
                     setShowReceipt(true);
                   } else {
                     setShowPayment(true);
                   }
                 }}
                 className="w-full px-5 py-2.5 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-black transition shadow-sm mt-2"
               >
                 {booking.paymentStatus === 'paid' ? 'View Receipt' : 'Pay Now'}
               </button>
            </>
          )}

          {/* New Cancellation Button Rule */}
          {['pending', 'accepted'].includes(booking.status) && booking.paymentStatus === 'paid' && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full px-5 py-2.5 mt-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel Booking
            </button>
          )}
          
          {/* Fallback for pending but not paid yet (old logic if any exist) */}
          {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (
            <button
              onClick={() => onCancel(booking._id)}
              className="w-full px-5 py-2.5 mt-2 bg-white border border-red-200 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel
            </button>
          )}

          {(booking.status !== 'pending' && booking.status !== 'accepted' && booking.status !== 'completed' && booking.status !== 'cancelled') && (
            <button className="w-full px-5 py-2.5 mt-2 bg-gray-100 text-gray-400 text-sm font-medium rounded-lg cursor-not-allowed uppercase">
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

       {showReceipt && (
         <Receipt
           booking={booking}
           onClose={() => setShowReceipt(false)}
         />
       )}

      {showCancelModal && (
        <CancelBookingModal
          booking={booking}
          onClose={() => setShowCancelModal(false)}
          onCancelled={() => {
            setShowCancelModal(false);
            onRefresh();
          }}
        />
      )}

      {showTracking && (
        <LiveTrackingMap
          booking={booking}
          workerName={booking.worker?.name || 'Worker'}
          userId={userId}
        />
      )}
    </>
  );
};

export default BookingCard;
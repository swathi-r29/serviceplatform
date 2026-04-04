import { useState, useMemo } from 'react';
import axios from '../../api/axios';

const CancelBookingModal = ({ booking, onClose, onCancelled }) => {
  const [reasonCategory, setReasonCategory] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const refundDetails = useMemo(() => {
    if (!booking) return null;
    
    // User cancels BEFORE worker accepts (status: 'pending')
    if (booking.status === 'pending') {
      return { percentage: 100, amount: booking.totalAmount, rule: 'Cancelled before confirmation' };
    }
    
    // User cancels AFTER worker accepts
    if (booking.status === 'accepted') {
      if (!booking.scheduledDate || !booking.scheduledTime) {
        return { percentage: 100, amount: booking.totalAmount, rule: 'Unknown schedule time' };
      }
      
      const scheduledDateTime = new Date(`${new Date(booking.scheduledDate).toDateString()} ${booking.scheduledTime}`);
      const now = new Date();
      const hoursDiff = (scheduledDateTime - now) / (1000 * 60 * 60);

      if (hoursDiff > 24) {
        return { percentage: 80, amount: Math.round(booking.totalAmount * 0.8), rule: 'Cancelled >24hrs before scheduled time (20% platform fee retained)' };
      } else {
        return { percentage: 50, amount: Math.round(booking.totalAmount * 0.5), rule: 'Cancelled <24hrs before scheduled time' };
      }
    }
    
    return { percentage: 0, amount: 0, rule: 'Cannot guarantee refund status' };
  }, [booking]);

  const handleCancelClick = async () => {
    if (!reasonCategory) {
      setError('Please select a cancellation reason');
      return;
    }
    
    const finalReason = reasonCategory === 'Other' ? customReason : reasonCategory;
    if (reasonCategory === 'Other' && !finalReason.trim()) {
      setError('Please provide a reason');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post('/cancellation/cancel', {
        bookingId: booking._id,
        reason: finalReason
      });

      setSuccessData(response.data);
      if (onCancelled) onCancelled();
      
      setTimeout(() => {
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to cancel booking. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!booking) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 p-4 font-lato">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 relative p-6">
        {successData ? (
          <div className="text-center py-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Booking Cancelled</h3>
            {successData.refundAmount > 0 ? (
              <p className="text-sm text-gray-600">
                ₹{successData.refundAmount} refund initiated. {successData.message}
              </p>
            ) : (
              <p className="text-sm text-gray-600">{successData.message}</p>
            )}
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-5 border-b pb-4">
              <h2 className="text-xl font-bold text-gray-900">Cancel Booking</h2>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-6">
              <div className="bg-amber-50 rounded-lg p-4 border border-amber-200 mb-5">
                <h4 className="font-semibold text-amber-800 mb-1">Cancellation Policy</h4>
                {refundDetails && (
                  <>
                    <p className="text-sm text-amber-700">
                      You will receive a <span className="font-bold">{refundDetails.percentage}% refund (₹{refundDetails.amount})</span>
                    </p>
                    <p className="text-xs text-amber-600 mt-1 opacity-80">{refundDetails.rule}</p>
                    {refundDetails.amount > 0 && (
                       <p className="text-xs text-amber-600 mt-2 font-medium">Refund credited in 5-7 business days</p>
                    )}
                  </>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Reason for cancellation</label>
                  <select 
                    value={reasonCategory}
                    onChange={(e) => setReasonCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                    <option value="" disabled>Select a reason...</option>
                    <option value="Schedule conflict">Schedule conflict</option>
                    <option value="Found another provider">Found another provider</option>
                    <option value="Emergency">Emergency</option>
                    <option value="Service no longer needed">Service no longer needed</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {reasonCategory === 'Other' && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Please specify</label>
                    <input 
                      type="text"
                      maxLength={100}
                      value={customReason}
                      onChange={(e) => setCustomReason(e.target.value)}
                      placeholder="Brief reason for cancellation"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                )}
              </div>
              
              {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                  {error}
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Keep Booking
              </button>
              <button 
                type="button" 
                onClick={handleCancelClick}
                disabled={isLoading || !reasonCategory}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                     <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                     Processing...
                  </>
                ) : 'Confirm Cancellation'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CancelBookingModal;

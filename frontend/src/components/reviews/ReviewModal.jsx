import { useState } from 'react';
import axios from '../../api/axios';
import { FaStar, FaCheckCircle, FaTimes } from 'react-icons/fa';

const RATING_LABELS = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent!' };

const ReviewModal = ({ bookingId, workerName, serviceName, onClose, onSubmitted }) => {
  const [rating, setRating]           = useState(0);
  const [hovered, setHovered]         = useState(0);
  const [comment, setComment]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [submitted, setSubmitted]     = useState(false);

  const handleSubmit = async () => {
    if (!rating) return;
    setLoading(true);
    setError('');
    try {
      await axios.post('/reviews', { bookingId, rating, comment });
      setSubmitted(true);
      if (onSubmitted) onSubmitted();
      setTimeout(() => onClose(), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const activeStar = hovered || rating;

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative animate-in fade-in zoom-in-95 duration-200">

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <FaTimes size={18} />
        </button>

        {/* ── Success state ── */}
        {submitted ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <FaCheckCircle className="text-green-500 text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Review Submitted!</h3>
            <p className="text-gray-500 text-sm">Thank you for your feedback.</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 leading-snug">
                How was your experience with <span className="text-[#e67e22]">{workerName}</span>?
              </h2>
              <p className="text-sm text-gray-500 mt-1">{serviceName}</p>
            </div>

            {/* ── Star Rating ── */}
            <div className="flex justify-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHovered(star)}
                  onMouseLeave={() => setHovered(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`Rate ${star} stars`}
                >
                  <FaStar
                    size={36}
                    className="transition-colors duration-100"
                    style={{ color: star <= activeStar ? '#f59e0b' : '#e5e7eb' }}
                  />
                </button>
              ))}
            </div>

            {/* Rating label */}
            <div className="text-center mb-5 h-5">
              {activeStar > 0 && (
                <span className="text-sm font-semibold text-amber-500">
                  {RATING_LABELS[activeStar]}
                </span>
              )}
            </div>

            {/* Comment */}
            <div className="relative mb-5">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                rows={3}
                placeholder="Share your experience (optional)"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition"
              />
              <span className="absolute bottom-2 right-3 text-[10px] text-gray-400">
                {comment.length}/500
              </span>
            </div>

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg mb-4 border border-red-100">
                {error}
              </p>
            )}

            {/* Actions */}
            <button
              onClick={handleSubmit}
              disabled={!rating || loading}
              className="w-full py-3 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: (!rating || loading) ? '#d1d5db' : 'linear-gradient(135deg,#f59e0b,#d97706)'
              }}
            >
              {loading ? 'Submitting…' : 'Submit Review'}
            </button>

            <button
              onClick={onClose}
              className="w-full mt-3 text-xs text-gray-400 hover:text-gray-600 transition text-center"
            >
              Skip for now
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewModal;

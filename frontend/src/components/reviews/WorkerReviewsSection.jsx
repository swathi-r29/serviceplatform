import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
};

const StarDisplay = ({ rating, size = 14 }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars.push(<FaStar key={i} size={size} style={{ color: '#f59e0b' }} />);
    } else if (rating >= i - 0.5) {
      stars.push(<FaStarHalfAlt key={i} size={size} style={{ color: '#f59e0b' }} />);
    } else {
      stars.push(<FaRegStar key={i} size={size} style={{ color: '#d1d5db' }} />);
    }
  }
  return <div className="flex items-center gap-0.5">{stars}</div>;
};

// ── Skeletons ─────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 bg-gray-200 rounded-full" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-2 bg-gray-100 rounded w-1/4" />
      </div>
    </div>
    <div className="space-y-2">
      <div className="h-2 bg-gray-100 rounded w-full" />
      <div className="h-2 bg-gray-100 rounded w-3/4" />
    </div>
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────

const WorkerReviewsSection = ({ workerId }) => {
  const [data, setData]     = useState(null);   // { summary, reviews }
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data: res } = await axios.get(`/reviews/worker/${workerId}`);
        setData(res);
      } catch (err) {
        setError('Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };
    if (workerId) fetch();
  }, [workerId]);

  // ── Loading ──
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 animate-pulse">
          <div className="flex gap-6">
            <div className="w-20 h-20 bg-gray-200 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="space-y-1.5">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-2 bg-gray-100 rounded w-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
        {[1,2,3].map(i => <Skeleton key={i} />)}
      </div>
    );
  }

  if (error) {
    return <p className="text-red-500 text-sm text-center py-4">{error}</p>;
  }

  const { summary, reviews } = data || { summary: {}, reviews: [] };
  const { averageRating = 0, totalReviews = 0, ratingDistribution = {} } = summary;

  // ── Empty state ──
  if (totalReviews === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
        <FaStar size={32} className="mx-auto mb-3 text-gray-200" />
        <p className="text-gray-500 text-sm font-medium">No reviews yet.</p>
        <p className="text-gray-400 text-xs mt-1">Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Summary Card ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">

          {/* Big average */}
          <div className="text-center sm:border-r sm:border-gray-100 sm:pr-6 shrink-0">
            <p className="text-5xl font-black text-gray-900">{averageRating.toFixed(1)}</p>
            <StarDisplay rating={averageRating} size={16} />
            <p className="text-xs text-gray-400 mt-1">Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}</p>
          </div>

          {/* Distribution bars */}
          <div className="flex-1 space-y-1.5 w-full">
            {[5, 4, 3, 2, 1].map((star) => {
              const count = ratingDistribution[star] || 0;
              const pct   = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
              return (
                <div key={star} className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-gray-500 w-6 text-right shrink-0">{star}★</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-400 w-8 shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Review Cards ── */}
      <div className="space-y-4">
        {reviews.map((review) => {
          const initial = review.user?.name?.[0]?.toUpperCase() || '?';
          return (
            <div
              key={review._id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow"
            >
              {/* Card header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {review.user?.profileImage ? (
                    <img
                      src={review.user.profileImage.startsWith('http')
                        ? review.user.profileImage
                        : `http://localhost:5000${review.user.profileImage}`}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-100"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                      {initial}
                    </div>
                  )}

                  <div>
                    <p className="font-bold text-gray-900 text-sm">{review.user?.name || 'Anonymous'}</p>
                    <p className="text-[10px] text-gray-400">{formatDate(review.createdAt)}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <StarDisplay rating={review.rating} size={12} />
                  {review.service?.name && (
                    <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-100 px-2 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {review.service.name}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              {review.comment ? (
                <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>
              ) : (
                <p className="text-sm text-gray-400 italic">No comment provided.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WorkerReviewsSection;

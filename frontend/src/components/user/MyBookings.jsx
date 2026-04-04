import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import BookingCard from './BookingCard';
import UserSidebar from './UserSidebar';
import ReviewModal from '../reviews/ReviewModal';
import { FaPlus, FaStar, FaCheckCircle } from 'react-icons/fa';

const MyBookings = () => {
  const [bookings, setBookings]               = useState([]);
  const [filter, setFilter]                   = useState('upcoming');
  const [loading, setLoading]                 = useState(true);
  const [recommendedServices, setRecommendedServices] = useState([]);

  // Review state
  const [reviewStatus, setReviewStatus]       = useState({});  // { [bookingId]: { canReview, reason } }
  const [reviewModal, setReviewModal]         = useState(null); // { bookingId, workerName, serviceName }

  useEffect(() => {
    fetchBookings();
    fetchRecommended();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/user/bookings');
      setBookings(data);
      // After fetching, check review eligibility for completed bookings
      fetchReviewStatuses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewStatuses = async (allBookings) => {
    const completed = allBookings.filter(b => b.status === 'completed');
    if (completed.length === 0) return;

    // Batch: run all checks in parallel
    const results = await Promise.allSettled(
      completed.map(b => axios.get(`/reviews/can-review/${b._id}`))
    );

    const statusMap = {};
    completed.forEach((b, i) => {
      const result = results[i];
      if (result.status === 'fulfilled') {
        statusMap[b._id] = result.value.data;
      } else {
        statusMap[b._id] = { canReview: false, reason: 'error' };
      }
    });
    setReviewStatus(statusMap);
  };

  const fetchRecommended = async () => {
    try {
      const { data } = await axios.get('/services?limit=2');
      setRecommendedServices(data.slice(0, 2));
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await axios.put(`/bookings/${id}/cancel`);
        fetchBookings();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to cancel booking');
      }
    }
  };

  const getFilteredBookings = () => {
    if (filter === 'upcoming')  return bookings.filter(b => b.status === 'pending' || b.status === 'accepted');
    if (filter === 'past')      return bookings.filter(b => b.status === 'completed' || b.status === 'rejected');
    if (filter === 'cancelled') return bookings.filter(b => b.status === 'cancelled');
    return bookings;
  };

  const filteredBookings = getFilteredBookings();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#faf8f5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#e67e22]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] font-lato">
      <UserSidebar />

      {/* Review Modal */}
      {reviewModal && (
        <ReviewModal
          bookingId={reviewModal.bookingId}
          workerName={reviewModal.workerName}
          serviceName={reviewModal.serviceName}
          onClose={() => setReviewModal(null)}
          onSubmitted={() => {
            // Mark as reviewed locally for instant feedback
            setReviewStatus(prev => ({
              ...prev,
              [reviewModal.bookingId]: { canReview: false, reason: 'already_reviewed' }
            }));
          }}
        />
      )}

      <div className="md:ml-64 p-8">
        <div className="max-w-7xl mx-auto">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-playfair mb-1">My Bookings</h1>
              <p className="text-gray-500">Track your upcoming and past home services</p>
            </div>
            <Link
              to="/services"
              className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-[#1a2b4b] text-white px-6 py-3 rounded-lg hover:bg-[#2c426b] transition shadow-sm font-medium"
            >
              <FaPlus className="text-sm" />
              New Booking
            </Link>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8 flex gap-8">
            {['upcoming', 'past', 'cancelled'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`pb-3 text-sm font-semibold capitalize relative transition-colors ${
                  filter === tab ? 'text-[#1a2b4b]' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab === 'past' ? 'Past Services' : tab}
                {tab === 'upcoming' && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {bookings.filter(b => b.status === 'pending' || b.status === 'accepted').length}
                  </span>
                )}
                {filter === tab && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#1a2b4b]" />
                )}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          <div className="space-y-6 mb-12">
            {filteredBookings.length > 0 ? (
              filteredBookings.map(booking => (
                <div key={booking._id}>
                  <BookingCard
                    booking={booking}
                    onCancel={handleCancel}
                    onRefresh={fetchBookings}
                  />

                  {/* ── Review CTA for completed bookings ── */}
                  {booking.status === 'completed' && (
                    <div className="mt-2 flex justify-end px-1">
                      {reviewStatus[booking._id]?.canReview ? (
                        <button
                          onClick={() => setReviewModal({
                            bookingId:   booking._id,
                            workerName:  booking.worker?.name  || 'Professional',
                            serviceName: booking.service?.name || 'Service'
                          })}
                          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-600 border border-amber-300 bg-amber-50 hover:bg-amber-100 px-4 py-1.5 rounded-full transition"
                        >
                          <FaStar size={12} />
                          Leave a Review
                        </button>
                      ) : reviewStatus[booking._id]?.reason === 'already_reviewed' ? (
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 border border-green-100 px-3 py-1 rounded-full">
                          <FaCheckCircle size={11} />
                          Reviewed
                        </span>
                      ) : null}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
                <div className="text-gray-400 mb-2 font-medium">No bookings found in this category</div>
              </div>
            )}
          </div>

          {/* Recommended Section */}
          <div>
            <h2 className="text-xl font-bold font-playfair text-gray-900 mb-4">Recommended for You</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {recommendedServices.map(service => (
                <Link
                  to={`/user/booking/create/${service._id}`}
                  key={service._id}
                  className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition group"
                >
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden">
                    {service.image ? (
                      <img
                        src={service.image.startsWith('http') ? service.image : `http://localhost:5000${service.image}`}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-bold text-gray-900 group-hover:text-[#e67e22] transition-colors">{service.name}</h4>
                    <p className="text-sm text-gray-500 line-clamp-1">{service.description || 'Top rated service for you'}</p>
                    <div className="mt-2 flex items-center text-sm font-medium text-[#1a2b4b]">
                      Book Now <span className="ml-1 transition-transform group-hover:translate-x-1">→</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default MyBookings;
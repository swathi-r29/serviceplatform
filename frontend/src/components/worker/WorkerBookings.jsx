import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import WorkerBookingCard from './WorkerBookingCard';

const WorkerBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/worker/bookings');
      setBookings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="completed">Completed</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {filteredBookings.map(booking => (
          <WorkerBookingCard key={booking._id} booking={booking} onRefresh={fetchBookings} />
        ))}

        {filteredBookings.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">No bookings found</div>
        )}
      </div>
    </div>
  );
};

export default WorkerBookings;
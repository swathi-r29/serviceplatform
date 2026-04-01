import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await axios.get('/admin/bookings');
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
      <h1 className="text-3xl font-bold mb-8">Booking Management</h1>

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
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-6 py-3 text-left">Booking ID</th>
              <th className="px-6 py-3 text-left">Customer</th>
              <th className="px-6 py-3 text-left">Worker</th>
              <th className="px-6 py-3 text-left">Service</th>
              <th className="px-6 py-3 text-left">Date</th>
              <th className="px-6 py-3 text-left">Amount</th>
              <th className="px-6 py-3 text-left">Payment</th>
              <th className="px-6 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredBookings.map(booking => (
              <tr key={booking._id} className="border-t">
                <td className="px-6 py-4 font-mono text-sm">{booking._id.slice(-8)}</td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold">{booking.user?.name}</p>
                    <p className="text-sm text-gray-500">{booking.user?.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold">{booking.worker?.name || 'Unassigned'}</p>
                    <p className="text-sm text-gray-500">{booking.worker?.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="font-semibold">{booking.service?.name}</p>
                    <p className="text-sm text-gray-500">{booking.service?.category}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p>{new Date(booking.scheduledDate).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-500">{booking.scheduledTime}</p>
                  </div>
                </td>
                <td className="px-6 py-4 font-bold">₹{booking.totalAmount}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    booking.paymentStatus === 'paid' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {booking.paymentStatus}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {booking.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="text-center py-8 text-gray-500">No bookings found</div>
        )}
      </div>
    </div>
  );
};

export default BookingManagement;
import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const Earnings = () => {
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const { data } = await axios.get('/worker/earnings');
      setEarnings(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Earnings</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Earnings</h3>
          <p className="text-4xl font-bold">₹{earnings?.totalEarnings || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Completed Jobs</h3>
          <p className="text-4xl font-bold">{earnings?.completedBookings || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Average Rating</h3>
          <p className="text-4xl font-bold">{earnings?.rating?.toFixed(1) || 0} ⭐</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Reviews</h3>
          <p className="text-4xl font-bold">{earnings?.reviewCount || 0}</p>
        </div>
      </div>

      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold mb-4">Earnings Breakdown</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Average per Job</span>
            <span className="text-xl font-bold">
              ₹{earnings?.completedBookings > 0 
                ? (earnings.totalEarnings / earnings.completedBookings).toFixed(2) 
                : 0}
            </span>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Total Completed Jobs</span>
            <span className="text-xl font-bold">{earnings?.completedBookings || 0}</span>
          </div>
          <div className="flex justify-between items-center border-b pb-3">
            <span className="text-gray-600">Customer Satisfaction</span>
            <span className="text-xl font-bold">{earnings?.rating?.toFixed(1) || 0}/5.0</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Reviews Received</span>
            <span className="text-xl font-bold">{earnings?.reviewCount || 0}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Earnings;
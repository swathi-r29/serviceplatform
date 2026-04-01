import { useState, useEffect } from 'react';
import axios from '../../api/axios';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchChartData();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data } = await axios.get('/admin/analytics');
      setAnalytics(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const { data } = await axios.get('/admin/analytics/charts');
      setChartData(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-4xl font-bold">{analytics?.totalUsers || 0}</p>
          <p className="text-sm mt-2 opacity-90">+{analytics?.newUsersThisMonth || 0} this month</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Workers</h3>
          <p className="text-4xl font-bold">{analytics?.totalWorkers || 0}</p>
          <p className="text-sm mt-2 opacity-90">Active: {analytics?.activeWorkers || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Services</h3>
          <p className="text-4xl font-bold">{analytics?.totalServices || 0}</p>
          <p className="text-sm mt-2 opacity-90">Active: {analytics?.activeServices || 0}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
          <p className="text-4xl font-bold">{analytics?.totalBookings || 0}</p>
          <p className="text-sm mt-2 opacity-90">+{analytics?.bookingsThisMonth || 0} this month</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Pending Bookings</h3>
          <p className="text-3xl font-bold text-yellow-600">{analytics?.pendingBookings || 0}</p>
          <div className="mt-4 bg-yellow-100 rounded-full h-2">
            <div 
              className="bg-yellow-600 h-2 rounded-full" 
              style={{ width: `${(analytics?.pendingBookings / analytics?.totalBookings * 100) || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Completed Bookings</h3>
          <p className="text-3xl font-bold text-green-600">{analytics?.completedBookings || 0}</p>
          <div className="mt-4 bg-green-100 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full" 
              style={{ width: `${(analytics?.completedBookings / analytics?.totalBookings * 100) || 0}%` }}
            ></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Total Revenue</h3>
          <p className="text-3xl font-bold text-blue-600">₹{analytics?.totalRevenue || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Avg: ₹{analytics?.averageBookingValue || 0}</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Revenue Trend (Last 7 Days)</h3>
          {chartData?.dailyRevenue && (
            <div className="space-y-2">
              {chartData.dailyRevenue.map((item, index) => (
                <div key={index} className="flex items-center gap-4">
                  <span className="text-sm text-gray-600 w-20">{item.date}</span>
                  <div className="flex-1 bg-blue-100 rounded-full h-6">
                    <div 
                      className="bg-blue-600 h-6 rounded-full flex items-center justify-end pr-2 text-xs text-white font-semibold"
                      style={{ width: `${(item.revenue / Math.max(...chartData.dailyRevenue.map(d => d.revenue)) * 100)}%` }}
                    >
                      ₹{item.revenue}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Top Services by Bookings</h3>
          {chartData?.topServices && (
            <div className="space-y-3">
              {chartData.topServices.map((service, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-semibold">{service.name}</p>
                    <div className="bg-green-100 rounded-full h-4 mt-1">
                      <div 
                        className="bg-green-600 h-4 rounded-full"
                        style={{ width: `${(service.bookings / Math.max(...chartData.topServices.map(s => s.bookings)) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  <span className="ml-4 font-bold text-green-600">{service.bookings}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Platform Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Completion Rate</span>
              <span className="font-bold">
                {analytics?.totalBookings > 0 
                  ? ((analytics.completedBookings / analytics.totalBookings) * 100).toFixed(1) 
                  : 0}%
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Average Revenue per Booking</span>
              <span className="font-bold">
                ₹{analytics?.totalBookings > 0 
                  ? (analytics.totalRevenue / analytics.totalBookings).toFixed(2) 
                  : 0}
              </span>
            </div>
            <div className="flex justify-between items-center border-b pb-2">
              <span className="text-gray-600">Active Users</span>
              <span className="font-bold">{analytics?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Active Workers</span>
              <span className="font-bold">{analytics?.totalWorkers || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-bold mb-4">Worker Performance</h3>
          {chartData?.topWorkers && (
            <div className="space-y-3">
              {chartData.topWorkers.map((worker, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-semibold">{worker.name}</p>
                    <p className="text-sm text-gray-500">{worker.rating.toFixed(1)} ⭐ • {worker.reviews} reviews</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">₹{worker.earnings}</p>
                    <p className="text-xs text-gray-500">{worker.completedJobs} jobs</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Analytics;
import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const AdminAnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [chartData, setChartData] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [selectedStatus, setSelectedStatus] = useState('all');

  useEffect(() => {
    fetchAnalytics();
    fetchChartData();
    fetchRecentBookings();
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

  const fetchRecentBookings = async () => {
    try {
      const { data } = await axios.get('/admin/recent-bookings?limit=10');
      setRecentBookings(data);
    } catch (error) {
      console.error(error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculatePercentageChange = (current, previous) => {
    if (!previous) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 font-medium">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between">
          <div>
            <nav className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <span>Main</span>
              <span>›</span>
              <span className="text-gray-900 font-medium">Analytics Dashboard</span>
            </nav>
            <h1 className="text-2xl font-bold text-gray-900">Admin Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search data..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="px-8 py-6">
        {/* Top KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">TOTAL REVENUE</p>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-1">
                  {formatCurrency(analytics?.totalRevenue || 0)}
                </h2>
                <p className="text-sm text-gray-500">
                  vs. {formatCurrency(analytics?.lastMonthRevenue || 0)} last month
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>{calculatePercentageChange(analytics?.totalRevenue || 0, analytics?.lastMonthRevenue || 0)}%</span>
              </div>
            </div>
          </div>

          {/* Active Workers Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">ACTIVE WORKERS</p>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-1">
                  {analytics?.activeWorkers?.toLocaleString() || 0}
                </h2>
                <p className="text-sm text-gray-500">
                  vs. {analytics?.lastMonthWorkers?.toLocaleString() || 0} last month
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>{calculatePercentageChange(analytics?.activeWorkers || 0, analytics?.lastMonthWorkers || 0)}%</span>
              </div>
            </div>
          </div>

          {/* Total Bookings Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">TOTAL BOOKINGS</p>
                </div>
              </div>
            </div>
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-1">
                  {analytics?.totalBookings?.toLocaleString() || 0}
                </h2>
                <p className="text-sm text-gray-500">
                  vs. {analytics?.lastMonthBookings?.toLocaleString() || 0} last month
                </p>
              </div>
              <div className="flex items-center gap-1 text-green-600 font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                <span>{calculatePercentageChange(analytics?.totalBookings || 0, analytics?.lastMonthBookings || 0)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Bookings Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="px-6 py-5 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Recent Bookings</h2>
              <div className="flex items-center gap-3">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">All Services</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="cleaning">Cleaning</option>
                </select>
                <select className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option>Status</option>
                  <option>Completed</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </select>
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Last {selectedPeriod} Days
                </button>
                <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Booking ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Service & Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Assigned Worker
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentBookings && recentBookings.length > 0 ? (
                  recentBookings.map((booking, index) => (
                    <tr key={booking._id || index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-blue-600 font-semibold">#{booking._id ? booking._id.slice(-6).toUpperCase() : `BK-${9482 + index}`}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-gray-900">{booking.service?.name || 'Service Name'}</p>
                          <p className="text-sm text-gray-500">{booking.service?.category || 'Category'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{booking.user?.name || 'User Name'}</p>
                          <p className="text-sm text-gray-500">{booking.user?.email || 'user@example.com'}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {booking.worker ? (
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                              {booking.worker.name ? booking.worker.name.split(' ').map(n => n[0]).join('').toUpperCase() : 'W'}
                            </div>
                            <span className="font-medium text-gray-900">{booking.worker.name || 'Worker Name'}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span className="italic">Unassigned</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold text-gray-900">₹{booking.totalAmount || 0}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-gray-100 text-gray-800'
                          }`}>
                          {booking.status ? booking.status.charAt(0).toUpperCase() + booking.status.slice(1) : 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button className="text-gray-400 hover:text-gray-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      No recent bookings available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing 1 to {recentBookings?.length || 0} of {recentBookings?.length || 0} results
            </p>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50" disabled>
                Previous
              </button>
              <button className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">
                1
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                2
              </button>
              <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                3
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Next
              </button>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue Trend Line Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Revenue Trend (Last 7 Days)</h2>
            <div className="h-[300px]">
              <Line
                data={{
                  labels: chartData?.dailyRevenue?.map(d => d.date) || [],
                  datasets: [{
                    label: 'Revenue (₹)',
                    data: chartData?.dailyRevenue?.map(d => d.revenue) || [],
                    borderColor: '#4f46e5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    fill: true,
                    tension: 0.4,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                    x: { grid: { display: false } }
                  }
                }}
              />
            </div>
          </div>

          {/* Service Distribution Doughnut Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Service Popularity</h2>
            <div className="h-[300px] flex items-center justify-center">
              <Doughnut
                data={{
                  labels: chartData?.topServices?.map(s => s.name) || [],
                  datasets: [{
                    data: chartData?.topServices?.map(s => s.bookings) || [],
                    backgroundColor: [
                      '#4f46e5',
                      '#10b981',
                      '#f59e0b',
                      '#ef4444',
                      '#8b5cf6',
                    ],
                    borderWidth: 0,
                  }]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'right',
                      labels: { usePointStyle: true, padding: 20 }
                    }
                  },
                  cutout: '70%'
                }}
              />
            </div>
          </div>
        </div>

        {/* Worker Performance Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Top Performing Workers</h2>
          <div className="h-[400px]">
            <Bar
              data={{
                labels: chartData?.topWorkers?.map(w => w.name) || [],
                datasets: [
                  {
                    label: 'Earnings (₹)',
                    data: chartData?.topWorkers?.map(w => w.earnings) || [],
                    backgroundColor: '#4f46e5',
                    borderRadius: 6,
                  },
                  {
                    label: 'Completed Jobs',
                    data: chartData?.topWorkers?.map(w => w.completedJobs) || [],
                    backgroundColor: '#10b981',
                    borderRadius: 6,
                  }
                ]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'top' },
                  tooltip: { mode: 'index', intersect: false }
                },
                scales: {
                  y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                  x: { grid: { display: false } }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAnalyticsDashboard;
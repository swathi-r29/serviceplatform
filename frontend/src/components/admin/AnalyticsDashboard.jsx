import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  Legend, ResponsiveContainer 
} from 'recharts';
import { 
  FaDollarSign, FaCalendarCheck, FaUsers, FaUndoAlt, 
  FaArrowUp, FaArrowDown, FaMinus, FaStar, FaBuilding, 
  FaUserPlus, FaCheckCircle, FaMoneyBillWave 
} from 'react-icons/fa';

const COLORS = {
  blue: '#f59e0b',
  purple: '#f59e0b',
  amber: '#f59e0b', 
  gray: '#6b7280',
  cyan: '#06b6d4',
  pink: '#ec4899'
};

const PIE_COLORS = [COLORS.blue, COLORS.purple, COLORS.green, COLORS.amber, COLORS.pink, COLORS.cyan];

const KPICard = ({ title, value, subtitle, trend, trendDirection, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-sm font-semibold text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={20} />
        </div>
      </div>
      <div className="flex items-center text-sm">
        {trendDirection === 'up' && <span className="text-green-500 flex items-center font-semibold"><FaArrowUp className="mr-1" size={10}/>{trend}</span>}
        {trendDirection === 'down' && <span className="text-red-500 flex items-center font-semibold"><FaArrowDown className="mr-1" size={10}/>{trend}</span>}
        {trendDirection === 'neutral' && <span className="text-gray-400 flex items-center font-semibold"><FaMinus className="mr-1" size={10}/>{trend}</span>}
        <span className="text-gray-400 ml-2">{subtitle}</span>
      </div>
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [categoriesData, setCategoriesData] = useState([]);
  const [topWorkers, setTopWorkers] = useState([]);
  const [trendsData, setTrendsData] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [revenuePeriod, setRevenuePeriod] = useState('30d');

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchRevenueData();
  }, [revenuePeriod]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        summaryRes,
        categoriesRes,
        workersRes,
        trendsRes,
        activityRes
      ] = await Promise.all([
        axios.get('/admin/analytics/summary'),
        axios.get('/admin/analytics/categories'),
        axios.get('/admin/analytics/top-workers?limit=5'),
        axios.get('/admin/analytics/booking-trends'),
        axios.get('/admin/analytics/recent-activity')
      ]);

      setSummary(summaryRes.data);
      setCategoriesData(categoriesRes.data);
      setTopWorkers(workersRes.data);
      setTrendsData(trendsRes.data);
      setRecentActivity(activityRes.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRevenueData = async () => {
    try {
      const res = await axios.get(`/admin/analytics/revenue-chart?period=${revenuePeriod}`);
      setRevenueData(res.data);
    } catch (error) {
      console.error('Error fetching revenue data:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading && !summary) {
    return (
      <div className="p-8 space-y-6 bg-[#f8fafc] min-h-screen">
        <div className="h-8 w-64 bg-gray-200 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1,2,3,4].map(i => <div key={i} className="h-32 bg-white rounded-2xl shadow-sm animate-pulse border border-gray-100" />)}
        </div>
        <div className="flex gap-6">
          <div className="h-80 bg-white rounded-2xl shadow-sm animate-pulse border border-gray-100 flex-[3]" />
          <div className="h-80 bg-white rounded-2xl shadow-sm animate-pulse border border-gray-100 flex-[2]" />
        </div>
      </div>
    );
  }

  // Formatting categories for PieChart (Top 5 + Other)
  const processCategories = () => {
    if (!categoriesData || categoriesData.length === 0) return [];
    const sorted = [...categoriesData].sort((a, b) => b.revenue - a.revenue);
    if (sorted.length <= 6) return sorted;
    
    const top5 = sorted.slice(0, 5);
    const otherData = sorted.slice(5).reduce((acc, curr) => {
      acc.revenue += curr.revenue;
      acc.bookingCount += curr.bookingCount;
      return acc;
    }, { category: 'Other', revenue: 0, bookingCount: 0, averageRating: 0 });
    
    return [...top5, otherData];
  };

  const pieData = processCategories();

  return (
    <div className="p-4 md:p-8 bg-[#f8fafc] min-h-screen font-lato">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-playfair">Platform Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Last updated: {new Date().toLocaleString()}</p>
        </div>
        <button onClick={fetchAllData} className="px-4 py-2 bg-white border border-gray-200 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-50 transition shadow-sm">
          Refresh Data
        </button>
      </div>

      {/* ROW 1: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <KPICard 
          title="Total Revenue" 
          value={formatCurrency(summary?.revenue?.total || 0)}
          subtitle="vs last month"
          trend={summary?.revenue?.growth ? `${Math.abs(summary.revenue.growth)}%` : '0%'}
          trendDirection={summary?.revenue?.growth > 0 ? 'up' : summary?.revenue?.growth < 0 ? 'down' : 'neutral'}
          icon={FaDollarSign}
          colorClass="bg-amber-50 text-amber-600"
        />
        <KPICard 
          title="Total Bookings" 
          value={(summary?.bookings?.total || 0).toLocaleString('en-IN')}
          subtitle={`${summary?.bookings?.completionRate || 0}% complete`}
          trend={`${summary?.bookings?.completed || 0} done`}
          trendDirection="up"
          icon={FaCalendarCheck}
          colorClass="bg-green-50 text-green-600"
        />
        <KPICard 
          title="Total Users" 
          value={(summary?.users?.total || 0).toLocaleString('en-IN')}
          subtitle={`${summary?.users?.pendingApprovals || 0} pending approvals`}
          trend={`+${summary?.users?.newThisMonth || 0} new`}
          trendDirection="up"
          icon={FaUsers}
          colorClass="bg-amber-50 text-amber-600"
        />
        <KPICard 
          title="Refund Rate" 
          value={`${summary?.refunds?.refundRate || 0}%`}
          subtitle={`${formatCurrency(summary?.refunds?.totalRefunded || 0)} out`}
          trend={`${summary?.bookings?.cancelled || 0} cancelled`}
          trendDirection="down"
          icon={FaUndoAlt}
          colorClass="bg-red-50 text-red-600"
        />
      </div>

      {/* ROW 2: Charts (Revenue & Categories) */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Left: Revenue Chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-[3] min-w-0">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue Over Time</h3>
            <div className="flex rounded-lg overflow-hidden border border-gray-200">
              {['7d', '30d', '90d', '12m'].map(p => (
                <button 
                  key={p} 
                  onClick={() => setRevenuePeriod(p)}
                  className={`px-3 py-1.5 text-xs font-semibold uppercase ${revenuePeriod === p ? 'bg-amber-50 text-amber-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 w-full">
            {revenueData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 font-medium">No data available yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val/1000}k`} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value, name) => [name === 'revenue' ? formatCurrency(value) : value, name === 'revenue' ? 'Revenue' : 'Bookings']}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Line yAxisId="left" type="monotone" dataKey="revenue" stroke={COLORS.blue} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Revenue" />
                  <Line yAxisId="right" type="monotone" dataKey="bookings" stroke={COLORS.gray} strokeDasharray="5 5" strokeWidth={2} dot={false} name="Bookings" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-[2] min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Category Breakdown</h3>
          <div className="h-72 w-full">
            {pieData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 font-medium">No data available yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="revenue"
                    nameKey="category"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => formatCurrency(value)}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="bottom" 
                    align="center"
                    iconType="circle"
                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* ROW 3: Trends & Top Workers */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8">
        {/* Left: Booking Trends */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-[5.5] min-w-0">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Booking Trends (Last 8 Weeks)</h3>
          <div className="h-72 w-full">
            {trendsData.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 font-medium">No data available yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendsData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <RechartsTooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }}/>
                  <Bar dataKey="completed" name="Completed" stackId="a" fill={COLORS.green} radius={[0, 0, 4, 4]} />
                  <Bar dataKey="pending" name="Pending/Active" stackId="a" fill={COLORS.amber} />
                  <Bar dataKey="cancelled" name="Cancelled" stackId="a" fill={COLORS.red} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Top Workers */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex-[4.5] min-w-0 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Providers</h3>
            <button className="text-xs font-semibold text-amber-600 hover:text-amber-800">View All</button>
          </div>
          <div className="flex-grow overflow-auto">
            {topWorkers.length === 0 ? (
               <div className="h-full flex items-center justify-center text-gray-400 font-medium pb-8">No providers available yet</div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs text-gray-400 border-b border-gray-100">
                    <th className="pb-3 font-medium">Provider</th>
                    <th className="pb-3 font-medium text-center">Jobs</th>
                    <th className="pb-3 font-medium text-right">Earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {topWorkers.map((worker, idx) => (
                    <tr key={worker.workerId} className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center text-gray-500 text-xs font-bold font-playfair bg-gradient-to-br from-blue-100 to-indigo-100">
                            {worker.profileImage ? <img src={worker.profileImage} alt="" className="w-full h-full object-cover" /> : worker.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900 line-clamp-1">{worker.name}</p>
                            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                              <FaStar className="text-amber-400" size={10} /> {worker.rating} 
                              <span className="mx-1">•</span>
                              {worker.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-sm font-semibold text-gray-700 text-center">{worker.completedJobs}</td>
                      <td className="py-3 text-sm font-bold text-gray-900 text-right">{formatCurrency(worker.totalEarnings)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* ROW 4: Recent Activity */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Activity feed</h3>
        {recentActivity.length === 0 ? (
          <div className="py-8 text-center text-gray-400 font-medium">No recent activity</div>
        ) : (
          <div className="space-y-6">
            {recentActivity.map((activity, index) => {
              // Icon and colors based on type
              let Icon = FaBuilding;
              let bgClass = "bg-gray-100";
              let textClass = "text-gray-600";
              
              if (activity.type === 'new_booking') { Icon = FaCalendarCheck; bgClass = "bg-blue-50"; textClass = "text-blue-600"; }
              else if (activity.type === 'booking_completed') { Icon = FaCheckCircle; bgClass = "bg-green-50"; textClass = "text-green-600"; }
              else if (activity.type === 'new_worker') { Icon = FaUserPlus; bgClass = "bg-purple-50"; textClass = "text-purple-600"; }
              else if (activity.type === 'review_posted') { Icon = FaStar; bgClass = "bg-amber-50"; textClass = "text-amber-600"; }
              else if (activity.type === 'refund_issued') { Icon = FaMoneyBillWave; bgClass = "bg-red-50"; textClass = "text-red-600"; }

              // Calculate relative time
              const mins = Math.floor((new Date() - new Date(activity.timestamp)) / 60000);
              const timeStr = mins < 1 ? 'Just now' : mins < 60 ? `${mins} minutes ago` : mins < 1440 ? `${Math.floor(mins/60)} hours ago` : `${Math.floor(mins/1440)} days ago`;

              return (
                <div key={index} className="flex items-start gap-4">
                  <div className={`p-2.5 rounded-full ${bgClass} ${textClass} mt-1 flex-shrink-0`}>
                    <Icon size={14} />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm font-semibold text-gray-800">{activity.message}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400 font-medium">{timeStr}</span>
                      {activity.amount > 0 && (
                        <>
                          <span className="text-gray-300">•</span>
                          <span className="text-xs font-bold text-gray-600">{formatCurrency(activity.amount)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;

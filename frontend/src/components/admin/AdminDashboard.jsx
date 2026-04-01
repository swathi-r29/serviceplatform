import { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const location = useLocation();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const [analyticsRes, usersRes, workersRes, bookingsRes] = await Promise.all([
        axios.get('/admin/analytics'),
        axios.get('/admin/users'),
        axios.get('/admin/workers'),
        axios.get('/admin/bookings')
      ]);

      setAnalytics(analyticsRes.data);
      setUsers(usersRes.data);
      setWorkers(workersRes.data);
      setBookings(bookingsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`/admin/users/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleDeleteWorker = async (id) => {
    if (window.confirm('Are you sure you want to delete this worker?')) {
      try {
        await axios.delete(`/admin/workers/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to delete worker');
      }
    }
  };

  const handleToggleUserStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`/admin/users/${id}/status`,
        { isActive: !currentStatus }
      );
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleToggleWorkerStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`/admin/workers/${id}/status`,
        { isActive: !currentStatus }
      );
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update worker status');
    }
  };

  const handleApproveWorker = async (id) => {
    try {
      await axios.patch(`/admin/workers/${id}/approve`);
      fetchData();
      alert('Worker approved successfully!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to approve worker');
    }
  };

  const handleRejectWorker = async (id) => {
    if (window.confirm('Are you sure you want to reject this worker?')) {
      try {
        await axios.patch(`/admin/workers/${id}/reject`);
        fetchData();
        alert('Worker rejected successfully!');
      } catch (error) {
        alert(error.response?.data?.message || 'Failed to reject worker');
      }
    }
  };

  const isActive = (path) => location.pathname === path;

  // Filter users and workers based on search and status
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && user.isActive) ||
      (filterStatus === 'inactive' && !user.isActive);
    return matchesSearch && matchesStatus;
  });

  const filteredWorkers = workers.filter(worker => {
    const matchesSearch = worker.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      worker.location?.toLowerCase().includes(searchTerm.toLowerCase());

    // If we're on the general 'workers' tab, hide pending workers
    // If we're on the 'worker-requests' tab, filterStatus will be 'pending'
    const isPending = worker.status === 'pending';

    const matchesStatus =
      (activeTab === 'worker-requests' && isPending) || // In requests tab, only show pending
      (activeTab === 'workers' && !isPending && ( // In workers tab, show others
        filterStatus === 'all' ||
        (filterStatus === 'active' && worker.isActive) ||
        (filterStatus === 'inactive' && !worker.isActive) ||
        (filterStatus === 'approved' && worker.status === 'approved') ||
        (filterStatus === 'rejected' && worker.status === 'rejected')
      ));

    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2 text-center">Error Loading Dashboard</h3>
          <p className="text-gray-600 text-center mb-4">{error}</p>
          <button
            onClick={fetchData}
            className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-black shadow-lg flex flex-col">
        {/* Logo Section */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">ServiceHub</h2>
              <p className="text-xs text-gray-300">ADMIN CENTRAL</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            <li>
              <Link
                to="/admin/dashboard"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/dashboard')
                  ? 'bg-indigo-600 text-white'
                  : 'text-white hover:bg-gray-800'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span className="font-medium">Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/services"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/services')
                  ? 'bg-indigo-600 text-white'
                  : 'text-white hover:bg-gray-800'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium">Services</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/workers"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/workers')
                  ? 'bg-indigo-600 text-white'
                  : 'text-white hover:bg-gray-800'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium">Workers</span>
              </Link>
            </li>
            <li>
              <button
                onClick={() => {
                  setActiveTab('worker-requests');
                  setFilterStatus('pending');
                  document.querySelector('main').scrollTo({ top: 800, behavior: 'smooth' });
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'worker-requests'
                  ? 'bg-indigo-600 text-white'
                  : 'text-white hover:bg-gray-800'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-medium">Worker Requests</span>
                {analytics?.pendingApprovals > 0 && (
                  <span className="bg-amber-400 text-black text-xs font-bold px-2 py-0.5 rounded-full ml-auto">
                    {analytics.pendingApprovals}
                  </span>
                )}
              </button>
            </li>
            <li>
              <Link
                to="/admin/analytics"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/analytics')
                  ? 'bg-indigo-600 text-white'
                  : 'text-white hover:bg-gray-800'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span className="font-medium">Analytics</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/settings"
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${isActive('/admin/settings')
                  ? 'bg-indigo-600 text-white'
                  : 'text-white hover:bg-gray-800'
                  }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-medium">Settings</span>
              </Link>
            </li>
          </ul>
        </nav>

        {/* Bottom Section - System Status */}
        <div className="p-4 border-t border-gray-700">
          <div className="bg-indigo-600 text-white rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">System Status: Live</span>
            </div>
          </div>

          {/* Admin User Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">{user?.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
              <p className="text-xs text-gray-400">Super Admin</p>
            </div>
            <button
              onClick={logout}
              className="text-gray-400 hover:text-white transition-colors"
              title="Logout"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Admin Overview</h1>
            <p className="text-gray-600">Manage your service marketplace operations and growth.</p>
          </div>

          {/* Pending Approvals Alert */}
          {analytics?.pendingApprovals > 0 && (
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 mb-8 rounded-r-lg shadow-sm flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-bold text-amber-800">
                    Action Required: {analytics.pendingApprovals} new worker{analytics.pendingApprovals > 1 ? 's' : ''} awaiting approval
                  </p>
                  <p className="text-sm text-amber-700">
                    Unapproved workers will not appear in customer searches or booking options.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveTab('worker-requests');
                  setSearchTerm('');
                  setFilterStatus('pending');
                }}
                className="bg-amber-100 hover:bg-amber-200 text-amber-800 px-4 py-2 rounded-lg text-sm font-bold transition-colors"
              >
                Review Applications
              </button>
            </div>
          )}

          {/* Analytics Cards */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">TOTAL REVENUE</h3>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">₹{analytics?.totalRevenue?.toLocaleString() ?? '0'}</p>
              <p className="text-sm text-green-600 font-medium">+12% vs last month</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">ACTIVE WORKERS</h3>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.totalWorkers ?? workers?.filter(w => w.isActive)?.length ?? '0'}</p>
              <p className="text-sm text-blue-600 font-medium">+5% growth</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">OPEN BOOKINGS</h3>
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.pendingBookings ?? bookings?.filter(b => b.status === 'pending')?.length ?? '0'}</p>
              <p className="text-sm text-orange-600 font-medium">! Awaiting action</p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-600">TOTAL USERS</h3>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-800 mb-1">{analytics?.totalUsers ?? users?.length ?? '0'}</p>
              <p className="text-sm text-purple-600 font-medium">+8% this month</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Tasks</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Pending Bookings</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{analytics?.pendingBookings || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Worker Approvals</span>
                  </div>
                  <span className="text-lg font-bold text-purple-600">{analytics?.pendingApprovals || 0}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Links</h2>
              <div className="grid grid-cols-2 gap-4">
                <Link to="/admin/services/add" className="flex items-center p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Service
                </Link>
                <button
                  onClick={() => { setActiveTab('workers'); setFilterStatus('all'); }}
                  className="flex items-center p-3 text-sm text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  All Workers
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Users/Workers Section with Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
              <div className="flex space-x-8 px-6">
                <button
                  onClick={() => setActiveTab('users')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'users'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                    <span>Users ({filteredUsers.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('workers'); setFilterStatus('all'); }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'workers'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Workers ({filteredWorkers.length})</span>
                  </div>
                </button>
                <button
                  onClick={() => { setActiveTab('worker-requests'); setFilterStatus('pending'); }}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'worker-requests'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                >
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Worker Requests ({workers.filter(w => w.status === 'pending').length})</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="p-6 border-b border-gray-200 bg-gray-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder={`Search ${activeTab}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    {activeTab === 'workers' && (
                      <>
                        <option value="pending">Pending Approval</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </>
                    )}
                  </select>
                  <button
                    onClick={fetchData}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-6">
              {activeTab === 'users' ? (
                <div className="grid gap-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <div key={user._id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {user.profileImage ? (
                                <img
                                  src={`http://localhost:5000${user.profileImage}`}
                                  alt={user.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                  }}
                                />
                              ) : (
                                <span className="text-indigo-600 font-bold text-lg">{user.name?.charAt(0) || 'U'}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{user.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {user.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{user.email}</span>
                                </div>
                                {user.phone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {user.phone}
                                  </div>
                                )}
                                <div className="flex items-center text-xs text-gray-500">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${user.isActive
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user._id)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                              title="Delete User"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : activeTab === 'workers' ? (
                <div className="grid gap-4">
                  {filteredWorkers.length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No workers found</h3>
                      <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                    </div>
                  ) : (
                    filteredWorkers.map(worker => (
                      <div key={worker._id} className="border border-gray-200 rounded-lg p-4 hover:border-indigo-300 hover:shadow-sm transition-all">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {worker.profileImage ? (
                                <img
                                  src={`http://localhost:5000${worker.profileImage}`}
                                  alt={worker.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.name)}&background=random`;
                                  }}
                                />
                              ) : (
                                <span className="text-indigo-600 font-bold text-lg">{worker.name?.charAt(0) || 'W'}</span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-1">
                                <h3 className="text-lg font-semibold text-gray-900 truncate">{worker.name}</h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${worker.isActive
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-gray-100 text-gray-800'
                                  }`}>
                                  {worker.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {worker.rating && (
                                  <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-full">
                                    <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    <span className="ml-1 text-sm font-medium text-yellow-800">{worker.rating.toFixed(1)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center text-sm text-gray-600">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{worker.email}</span>
                                </div>
                                {worker.location && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    {worker.location}
                                  </div>
                                )}
                                {worker.phone && (
                                  <div className="flex items-center text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {worker.phone}
                                  </div>
                                )}
                                {worker.services && worker.services.length > 0 && (
                                  <div className="flex items-start text-sm text-gray-600">
                                    <svg className="w-4 h-4 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                    <div className="flex flex-wrap gap-1">
                                      {worker.services.slice(0, 3).map((service, idx) => (
                                        <span key={idx} className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-xs">
                                          {service}
                                        </span>
                                      ))}
                                      {worker.services.length > 3 && (
                                        <span className="text-indigo-600 text-xs">+{worker.services.length - 3} more</span>
                                      )}
                                    </div>
                                  </div>
                                )}
                                <div className="flex items-center text-xs text-gray-500">
                                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  Joined: {new Date(worker.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => handleToggleWorkerStatus(worker._id, worker.isActive)}
                              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${worker.isActive
                                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                : 'bg-green-100 text-green-800 hover:bg-green-200'
                                }`}
                              title={worker.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {worker.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteWorker(worker._id)}
                              className="px-3 py-1 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 text-sm font-medium transition-colors"
                              title="Delete Worker"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                <div className="grid gap-4">
                  {workers.filter(w => w.status === 'pending').length === 0 ? (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
                      <p className="mt-1 text-sm text-gray-500">All workers have been processed.</p>
                    </div>
                  ) : (
                    workers.filter(w => w.status === 'pending').map(worker => (
                      <div key={worker._id} className="border-2 border-amber-200 bg-amber-50 rounded-lg p-5 hover:border-amber-400 transition-all shadow-sm">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-4 flex-1">
                            <div className="w-14 h-14 bg-amber-200 rounded-2xl flex items-center justify-center flex-shrink-0 border-2 border-amber-300">
                              <span className="text-amber-800 font-bold text-xl">{worker.name?.charAt(0) || 'W'}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 truncate">{worker.name}</h3>
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-xs font-bold uppercase tracking-wider">
                                  Pending Approval
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                <div className="flex items-center text-sm text-gray-700">
                                  <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="truncate">{worker.email}</span>
                                </div>
                                <div className="flex items-center text-sm text-gray-700">
                                  <svg className="w-4 h-4 mr-2 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  {worker.phone}
                                </div>
                                <div className="flex items-start text-sm text-gray-700 col-span-2">
                                  <svg className="w-4 h-4 mr-2 mt-1 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  <div>
                                    <span className="font-semibold block mb-1">Skills:</span>
                                    <div className="flex flex-wrap gap-1">
                                      {worker.skills?.map((s, i) => (
                                        <span key={i} className="bg-white px-2 py-0.5 rounded text-xs border border-amber-200">{s}</span>
                                      )) || 'None'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <button
                              onClick={() => handleApproveWorker(worker._id)}
                              className="px-6 py-2.5 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Approve
                            </button>
                            <button
                              onClick={() => handleRejectWorker(worker._id)}
                              className="px-6 py-2.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 font-bold transition-all shadow-md flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
import { useState, useEffect, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

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
      await axios.patch(`/admin/users/${id}/status`, { isActive: !currentStatus });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update user status');
    }
  };

  const handleToggleWorkerStatus = async (id, currentStatus) => {
    try {
      await axios.patch(`/admin/workers/${id}/status`, { isActive: !currentStatus });
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
      worker.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const isPending = worker.status === 'pending';
    
    if (activeTab === 'worker-requests') return isPending && matchesSearch;
    
    const matchesStatus = filterStatus === 'all' ||
      (filterStatus === 'active' && worker.isActive) ||
      (filterStatus === 'inactive' && !worker.isActive);
    
    return !isPending && matchesSearch && matchesStatus;
  });

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-azure"></div>
    </div>
  );

  return (
    <div className="space-y-8 p-4 md:p-8">
      {/* Header */}
      <div className="p-8 bg-white rounded-3xl shadow-sm border border-slate-100">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Admin Dashboard</h1>
        <p className="text-slate-600 font-medium">Platform performance and user management overview.</p>
      </div>

      {/* Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `₹${analytics?.totalRevenue?.toLocaleString() || 0}`, color: 'bg-emerald-50 text-emerald-600' },
          { label: 'Active Workers', value: analytics?.totalWorkers || 0, color: 'bg-blue-50 text-blue-600' },
          { label: 'Pending Bookings', value: analytics?.pendingBookings || 0, color: 'bg-orange-50 text-orange-600' },
          { label: 'Total Users', value: analytics?.totalUsers || user?.length || 0, color: 'bg-indigo-50 text-indigo-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-3xl font-black ${stat.color.split(' ')[1]}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Requests Banner */}
      {workers.filter(w => w.status === 'pending').length > 0 && (
        <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl flex items-center justify-between">
          <div>
            <p className="text-amber-800 font-bold text-lg">Worker Requests Pending</p>
            <p className="text-amber-600 text-sm">{workers.filter(w => w.status === 'pending').length} professionals awaiting approval</p>
          </div>
          <button 
            onClick={() => setActiveTab('worker-requests')}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-6 rounded-xl transition-all"
          >
            Review Now
          </button>
        </div>
      )}

      {/* Tabs Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex border-b border-slate-100 bg-slate-50/50">
          {['users', 'workers', 'worker-requests'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
                activeTab === tab 
                  ? 'bg-white text-brand-azure border-b-2 border-brand-azure' 
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {tab.replace('-', ' ')}
            </button>
          ))}
        </div>

        <div className="p-6">
          <div className="mb-6 relative">
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-brand-azure/20 outline-none transition-all"
            />
            <svg className="w-5 h-5 absolute left-4 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="pb-4 px-4 font-black">Entity</th>
                  <th className="pb-4 px-4 font-black">Status</th>
                  <th className="pb-4 px-4 font-black">Joined</th>
                  <th className="pb-4 px-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {(activeTab === 'users' ? filteredUsers : filteredWorkers).map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500">
                          {item.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                        item.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {item.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500 font-medium">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {activeTab === 'worker-requests' ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handleApproveWorker(item._id)} className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Approve</button>
                          <button onClick={() => handleRejectWorker(item._id)} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Reject</button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => activeTab === 'users' ? handleToggleUserStatus(item._id, item.isActive) : handleToggleWorkerStatus(item._id, item.isActive)}
                            className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-brand-azure transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          </button>
                          <button 
                            onClick={() => activeTab === 'users' ? handleDeleteUser(item._id) : handleDeleteWorker(item._id)}
                            className="p-2 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
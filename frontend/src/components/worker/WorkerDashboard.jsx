import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';
import EarningsTracker from './EarningsTracker';
import Notifications from '../common/Notifications';
import { useAssistantContext } from '../../context/AssistantContext';

const WorkerDashboard = () => {
  const { user, logout, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('All');
  const [workerProfile, setWorkerProfile] = useState({
    name: user?.name || 'Worker',
    role: user?.skills?.[0] || 'Service Professional',
    avatar: null,
    isOnline: false
  });
  const { setPageContext } = useAssistantContext();

  useEffect(() => {
    if (user?.status === 'approved') {
      setPageContext({
        type: 'worker',
        name: workerProfile.name,
        skills: workerProfile.role,
        rate: user?.hourlyRate || 'Assigned per task'
      });
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, workerProfile.name, workerProfile.role, setPageContext]);

  const fetchData = async () => {
    try {
      const [bookingsRes, earningsRes] = await Promise.all([
        axios.get('/worker/bookings'),
        axios.get('/worker/earnings')
      ]);
      setBookings(bookingsRes.data);
      setEarnings(earningsRes.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleOnlineStatus = () => {
    setWorkerProfile(prev => ({ ...prev, isOnline: !prev.isOnline }));
  };

  const handleAccept = async (bookingId) => {
    try {
      await axios.put(`/worker/bookings/${bookingId}/accept`);
      fetchData();
    } catch (error) {
      console.error('Failed to accept booking:', error);
    }
  };

  const handleReject = async (bookingId) => {
    try {
      await axios.put(`/worker/bookings/${bookingId}/reject`);
      fetchData();
    } catch (error) {
      console.error('Failed to reject booking:', error);
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await axios.put(`/worker/bookings/${bookingId}/complete`);
      fetchData();
    } catch (error) {
      console.error('Failed to complete booking:', error);
    }
  };

  const getBookingStatus = (booking) => {
    if (booking.status === 'completed') return 'Completed';
    if (booking.status === 'accepted') {
      const now = new Date();
      const bookingTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
      const timeDiff = (bookingTime - now) / (1000 * 60 * 60); // hours

      if (timeDiff < 0 && !booking.completedAt) return 'In Progress';
      if (timeDiff < 2) return 'Up Next';
      return 'Scheduled';
    }
    return booking.status;
  };

  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const activeBookings = bookings.filter(b => b.status === 'accepted' || b.status === 'in-progress');
  const completedBookings = bookings.filter(b => b.status === 'completed');

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#f8f9fa]">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium tracking-tight">Syncing your workspace...</p>
      </div>
    );
  }

  // SHOW PENDING SCREEN IF NOT APPROVED
  if (user?.status === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#fdf8f4] p-6 font-['Inter']">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] text-center">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2">Application Under Review</h1>
          <p className="text-gray-500 leading-relaxed mb-8">
            Thanks for joining <b>ServiceHub</b>, {user.name}! Your profile is currently being reviewed by our team. You'll get access to your dashboard as soon as it's approved.
          </p>
          <div className="bg-gray-50 p-4 rounded-xl mb-8 text-sm text-gray-600">
             Estimated time: <b>24-48 hours</b>
          </div>
          <button 
            onClick={logout}
            className="w-full py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-all"
          >
            Log Out
          </button>
          <p className="mt-6 text-sm text-gray-400">
            Need help? <a href="mailto:support@servicehub.com" className="text-amber-600 font-medium">Contact Support</a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="worker-dashboard">
        {/* Sidebar */}
        <aside className="dashboard-sidebar">
          <div className="profile-section">
            <div className="profile-avatar">
              <div className="avatar-placeholder">
                {workerProfile.name.charAt(0)}
              </div>
            </div>
            <div className="profile-info">
              <h3 className="profile-name">ServiceHub Pro</h3>
              <p className="profile-role">{workerProfile.role}</p>
            </div>
          </div>

          <nav className="sidebar-nav">
            <Link to="/worker/dashboard" className="nav-item active">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
              <span>Dashboard</span>
            </Link>

            <Link to="/worker/profile" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
              <span>Profile</span>
            </Link>

            <Link to="/worker/availability" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span>Availability</span>
            </Link>

            <Link to="/worker/bookings" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              <span>Booking History</span>
            </Link>

            <Link to="/worker/settings" className="nav-item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3"/>
              </svg>
              <span>Settings</span>
            </Link>
          </nav>

          <button 
            className={`online-toggle ${workerProfile.isOnline ? 'online' : 'offline'}`}
            onClick={toggleOnlineStatus}
          >
            {workerProfile.isOnline ? 'Go Offline' : 'Go Online'}
          </button>

          <div className="sidebar-bottom">
            <Link to="/support" className="bottom-link">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                <line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
              <span>Support</span>
            </Link>
            <button className="bottom-link logout-link" onClick={logout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="dashboard-main">
          <header className="dashboard-header">
            <div>
              <h1>Worker Dashboard</h1>
              <p className="welcome-text">
                Welcome back, {workerProfile.name}! You have {pendingBookings.length} jobs remaining today.
              </p>
            </div>
            <div className="header-actions">
              <Notifications socket={socket} />
              <Link to="/worker/schedule" className="manage-schedule-btn">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                </svg>
                Manage Schedule
              </Link>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">TOTAL EARNINGS</span>
                <div className="stat-icon earnings-icon">$</div>
              </div>
              <div className="stat-value">${earnings?.totalEarnings?.toFixed(2) || '0.00'}</div>
              <div className="stat-change positive">
                <span>+12%</span>
                <span className="stat-subtitle">vs last month</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">JOBS COMPLETED</span>
                <div className="stat-icon completed-icon">✓</div>
              </div>
              <div className="stat-value">{completedBookings.length}</div>
              <div className="stat-change positive">
                <span>+5%</span>
                <span className="stat-subtitle">consistent pace</span>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <span className="stat-label">PENDING REQUESTS</span>
                <div className="stat-icon pending-icon">📋</div>
              </div>
              <div className="stat-value">{pendingBookings.length}</div>
              <div className="stat-subtitle awaiting">Awaiting action</div>
            </div>
          </div>

          {/* New Job Requests */}
          <section className="section">
            <div className="section-header">
              <h2>New Job Requests</h2>
              <Link to="/worker/bookings" className="view-all-link">View All</Link>
            </div>

            <div className="job-requests-grid">
              {pendingBookings.map((booking, index) => {
                // Calculate time ago
                const createdAt = new Date(booking.createdAt);
                const now = new Date();
                const diffMs = now - createdAt;
                const diffMins = Math.floor(diffMs / 60000);
                const diffHours = Math.floor(diffMins / 60);
                const timeAgo = diffMins < 60 ? `${diffMins} mins ago` : `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;

                // Calculate urgency based on scheduled time
                const bookingTime = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`);
                const timeToService = (bookingTime - now) / (1000 * 60 * 60); // in hours
                const isUrgent = timeToService < 24;

                return (
                <div key={booking._id} className="job-request-card">
                  <div className="job-request-header">
                    <span className={`urgency-badge ${isUrgent ? 'urgent' : 'scheduled'}`}>
                      {isUrgent ? 'URGENT' : 'SCHEDULED'}
                    </span>
                    <span className="time-ago">
                      {timeAgo}
                    </span>
                  </div>

                  <h3 className="job-title">{booking.service?.name || 'Service Request'}</h3>
                  <div className="job-details">
                    <p className="job-detail-item">
                      <span>Location:</span> {booking.address || 'Not specified'}
                    </p>
                    <p className="job-detail-item">
                      <span>Est. Pay:</span> ₹{booking.totalAmount}
                    </p>
                  </div>

                  <div className="job-actions">
                    <button 
                      onClick={() => handleAccept(booking._id)}
                      className="accept-btn"
                    >
                      ✓ Accept
                    </button>
                    <button 
                      onClick={() => handleReject(booking._id)}
                      className="reject-btn"
                    >
                      × Reject
                    </button>
                  </div>
                </div>
                );
              })}

              {pendingBookings.length === 0 && (
                <div className="no-requests">
                  <p>No new job requests at the moment</p>
                </div>
              )}
            </div>
          </section>

          {/* Today's Active Schedule */}
          <section className="section">
            <div className="section-header">
              <h2>Today's Active Schedule</h2>
              <div className="filter-dropdown">
                <label>Filter by status:</label>
                <select 
                  value={activeFilter} 
                  onChange={(e) => setActiveFilter(e.target.value)}
                  className="status-filter"
                >
                  <option value="All">All</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Up Next">Up Next</option>
                  <option value="Scheduled">Scheduled</option>
                </select>
              </div>
            </div>

            <div className="schedule-table">
              <div className="table-header">
                <div className="table-col">CLIENT / TASK</div>
                <div className="table-col">TIME</div>
                <div className="table-col">STATUS</div>
                <div className="table-col">ACTIONS</div>
              </div>

              <div className="table-body">
                {activeBookings.slice(0, 5).map((booking) => {
                  const currentStatus = getBookingStatus(booking);

                  return (
                    <div key={booking._id} className="table-row">
                      <div className="table-col client-info">
                        <div>
                          <h4>{booking.user?.name || 'Customer'}</h4>
                          <p>{booking.service?.name}</p>
                        </div>
                      </div>

                      <div className="table-col time-info">
                        🕐 <span>{booking.scheduledTime}</span>
                      </div>

                      <div className="table-col">
                        <span className={`status-badge status-${currentStatus.replace(/\s/g, '-').toLowerCase()}`}>
                          {currentStatus}
                        </span>
                      </div>

                      <div className="table-col actions-col">
                        {currentStatus === 'In Progress' && (
                          <button 
                            onClick={() => handleComplete(booking._id)}
                            className="action-btn complete-btn"
                          >
                            Complete
                          </button>
                        )}
                        
                        {currentStatus === 'Up Next' && (
                          <span className="text-xs text-gray-500 italic">Not started yet</span>
                        )}

                        {/* Only show Start Job if time has come and it's not completed */}
                        {currentStatus === 'In Progress' && !booking.startedAt && (
                           <button className="action-btn start-btn">
                             Start Job
                           </button>
                        )}

                        {currentStatus === 'Completed' && (
                          <span className="text-sm font-bold text-green-600">✓ Completed</span>
                        )}

                        <button className="icon-btn message-btn" onClick={() => navigate(`/chat/booking/${booking._id}`)}>💬</button>
                      </div>
                    </div>
                  );
                })}

                {activeBookings.length === 0 && (
                  <div className="no-bookings">
                    <p>No active bookings scheduled for today</p>
                  </div>
                )}
              </div>

              {activeBookings.length > 0 && (
                <div className="table-footer">
                  <span>Showing {Math.min(3, activeBookings.length)} active bookings</span>
                  <div className="pagination">
                    <button className="pagination-btn">‹</button>
                    <button className="pagination-btn">›</button>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .worker-dashboard {
          display: flex;
          min-height: 100vh;
          background: rgb(249, 244, 238);
          font-family: 'Inter', sans-serif;
        }

        /* Sidebar */
        .dashboard-sidebar {
          width: 280px;
          background: #000000;
          border-right: 1px solid #333333;
          display: flex;
          flex-direction: column;
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          padding: 2rem 1.5rem;
          overflow-y: auto;
        }

        .profile-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #333333;
        }

        .profile-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          overflow: hidden;
        }

        .avatar-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .profile-info {
          flex: 1;
        }

        .profile-name {
          font-size: 1rem;
          font-weight: 700;
          color: white;
          margin-bottom: 0.25rem;
        }

        .profile-role {
          font-size: 0.75rem;
          color: #cccccc;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: white;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .nav-item:hover {
          background: #333333;
          color: white;
        }

        .nav-item.active {
          background: #555555;
          color: white;
        }

        .online-toggle {
          width: 100%;
          padding: 0.875rem 1.5rem;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-bottom: 1.5rem;
        }

        .online-toggle.online {
          background: #3b82f6;
          color: white;
        }

        .online-toggle.offline {
          background: #e5e7eb;
          color: #6b7280;
        }

        .sidebar-bottom {
          padding-top: 1.5rem;
          border-top: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .bottom-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          color: #6b7280;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
        }

        .bottom-link:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .logout-link {
          color: #ef4444;
        }

        .logout-link:hover {
          background: #fee2e2;
          color: #dc2626;
        }

        /* Main Content */
        .dashboard-main {
          flex: 1;
          margin-left: 280px;
          padding: 2rem 3rem;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
        }

        .dashboard-header h1 {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .welcome-text {
          color: #6b7280;
          font-size: 0.95rem;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border: none;
          background: white;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .icon-btn:hover {
          background: #f3f4f6;
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .manage-schedule-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.25rem;
          background: #1f2937;
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .manage-schedule-btn:hover {
          background: #111827;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          padding: 1.75rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #6b7280;
          letter-spacing: 0.5px;
        }

        .stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .earnings-icon {
          background: #d1fae5;
          color: #059669;
        }

        .completed-icon {
          background: #dbeafe;
          color: #3b82f6;
        }

        .pending-icon {
          background: #fef3c7;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
        }

        .stat-change.positive {
          color: #059669;
        }

        .stat-change span:first-child {
          font-weight: 600;
        }

        .stat-subtitle {
          color: #9ca3af;
        }

        .awaiting {
          color: #9ca3af;
          font-size: 0.85rem;
        }

        /* Section */
        .section {
          margin-bottom: 3rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-header h2 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
        }

        .view-all-link {
          color: #3b82f6;
          text-decoration: none;
          font-size: 0.9rem;
          font-weight: 600;
          transition: color 0.2s;
        }

        .view-all-link:hover {
          color: #2563eb;
        }

        /* Job Requests */
        .job-requests-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
        }

        .job-request-card {
          background: white;
          padding: 1.5rem;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .job-request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .urgency-badge {
          padding: 0.35rem 0.75rem;
          border-radius: 4px;
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .urgency-badge.urgent {
          background: #fee2e2;
          color: #dc2626;
        }

        .urgency-badge.scheduled {
          background: #dbeafe;
          color: #3b82f6;
        }

        .time-ago {
          font-size: 0.85rem;
          color: #9ca3af;
        }

        .job-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.75rem;
        }

        .job-details {
          margin-bottom: 1rem;
        }

        .job-detail-item {
          font-size: 0.9rem;
          color: #6b7280;
          margin-bottom: 0.25rem;
        }

        .job-detail-item span {
          font-weight: 600;
          color: #374151;
        }

        .job-actions {
          display: flex;
          gap: 0.75rem;
        }

        .accept-btn, .reject-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: none;
          border-radius: 8px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .accept-btn {
          background: #3b82f6;
          color: white;
        }

        .accept-btn:hover {
          background: #2563eb;
        }

        .reject-btn {
          background: transparent;
          color: #6b7280;
          border: 1px solid #e5e7eb;
        }

        .reject-btn:hover {
          background: #f3f4f6;
          color: #111827;
        }

        .no-requests {
          grid-column: 1 / -1;
          text-align: center;
          padding: 3rem;
          color: #9ca3af;
        }

        /* Filter Dropdown */
        .filter-dropdown {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.9rem;
          color: #6b7280;
        }

        .status-filter {
          padding: 0.5rem 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          color: #374151;
          background: white;
          cursor: pointer;
        }

        /* Schedule Table */
        .schedule-table {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .table-header, .table-row {
          display: grid;
          grid-template-columns: 2fr 1.5fr 1fr 1.5fr;
          padding: 1rem 1.5rem;
          align-items: center;
        }

        .table-header {
          background: #f9fafb;
          border-bottom: 1px solid #e5e7eb;
        }

        .table-header .table-col {
          font-size: 0.75rem;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.5px;
        }

        .table-row {
          border-bottom: 1px solid #f3f4f6;
        }

        .table-row:last-child {
          border-bottom: none;
        }

        .client-info h4 {
          font-size: 0.95rem;
          font-weight: 600;
          color: #111827;
          margin-bottom: 0.25rem;
        }

        .client-info p {
          font-size: 0.85rem;
          color: #6b7280;
        }

        .time-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #374151;
        }

        .status-badge {
          display: inline-block;
          padding: 0.4rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .status-in-progress {
          background: #fef3c7;
          color: #d97706;
        }

        .status-up-next {
          background: #e0e7ff;
          color: #6366f1;
        }

        .status-scheduled {
          background: #e5e7eb;
          color: #6b7280;
        }

        .actions-col {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }

        .action-btn {
          padding: 0.5rem 1.25rem;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .complete-btn {
          background: #10b981;
          color: white;
        }

        .complete-btn:hover {
          background: #059669;
        }

        .start-btn {
          background: #3b82f6;
          color: white;
        }

        .start-btn:hover {
          background: #2563eb;
        }

        .message-btn {
          background: #f3f4f6;
        }

        .message-btn:hover {
          background: #e5e7eb;
        }

        .table-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 1.5rem;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
          font-size: 0.85rem;
          color: #6b7280;
        }

        .pagination {
          display: flex;
          gap: 0.5rem;
        }

        .pagination-btn {
          width: 32px;
          height: 32px;
          border: 1px solid #e5e7eb;
          background: white;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1.2rem;
        }

        .pagination-btn:hover {
          background: #f3f4f6;
        }

        .no-bookings {
          padding: 3rem;
          text-align: center;
          color: #9ca3af;
        }

        /* Responsive */
        @media (max-width: 1400px) {
          .dashboard-main {
            padding: 2rem;
          }
        }

        @media (max-width: 1024px) {
          .dashboard-sidebar {
            width: 240px;
          }

          .dashboard-main {
            margin-left: 240px;
          }

          .job-requests-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-sidebar {
            display: none;
          }

          .dashboard-main {
            margin-left: 0;
            padding: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .table-header, .table-row {
            grid-template-columns: 1fr;
            gap: 0.75rem;
          }

          .dashboard-header {
            flex-direction: column;
            gap: 1rem;
          }

          .header-actions {
            width: 100%;
            justify-content: space-between;
          }
        }
      `}</style>
    </>
  );
};

export default WorkerDashboard;
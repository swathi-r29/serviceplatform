import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import axios from '../../api/axios';
import { FaUser, FaHistory, FaPlusCircle, FaCompass, FaCheckCircle, FaClock, FaExclamationTriangle, FaBell, FaCalendarAlt, FaWallet, FaTasks } from 'react-icons/fa';
import { useAssistantContext } from '../../context/AssistantContext';
import Notifications from '../common/Notifications';

const WorkerDashboard = () => {
  const { user, logout, socket } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { setPageContext } = useAssistantContext();

  useEffect(() => {
    if (user?.status === 'approved') {
      setPageContext({
        type: 'worker',
        name: user.name,
        skills: user.skills?.[0] || 'Professional',
        rate: user?.hourlyRate || 'Assigned'
      });
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user, setPageContext]);

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

  const handleAccept = async (id) => { try { await axios.put(`/worker/bookings/${id}/accept`); fetchData(); } catch (_) { } };
  const handleReject = async (id) => { try { await axios.put(`/worker/bookings/${id}/reject`); fetchData(); } catch (_) { } };
  const handleComplete = async (id) => { try { await axios.put(`/worker/bookings/${id}/complete`); fetchData(); } catch (_) { } };

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-blue"></div>
    </div>
  );

  // SHOW PENDING SCREEN IF NOT APPROVED
  if (user?.status === 'pending') {
    return (
      <div className="flex items-center justify-center min-h-screen p-6 font-lato">
        <div className="glass-panel max-w-md w-full p-12 text-center shadow-2xl shadow-blue-500/5">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner">
             <FaClock size={40} />
          </div>
          <h1 className="text-3xl font-black text-deep-slate mb-4 tracking-tight">Application Under Review</h1>
          <p className="text-muted-slate font-medium mb-8 leading-relaxed">
            Welcome back, <b>{user.name}</b>! We are verifying your professional credentials. You'll get full access once approved.
          </p>
          <div className="bg-white/40 p-5 rounded-2xl mb-8 border border-white/20">
             <p className="text-xs font-black text-deep-slate uppercase tracking-widest">Est. Approval Time</p>
             <p className="text-xl font-bold text-azure-blue mt-1">24 - 48 Hours</p>
          </div>
          <button onClick={logout} className="w-full py-4 bg-deep-slate text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/10 hover:scale-105 transition-all">
             Logout
          </button>
        </div>
      </div>
    );
  }

  const pending = bookings.filter(b => b.status === 'pending');
  const history = bookings.filter(b => ['completed', 'rejected', 'cancelled'].includes(b.status)).slice(0, 4);

  return (
    <div className="space-y-10 animate-fadeIn">
      <header className="flex justify-between items-start">
        <div>
           <h1 className="text-4xl font-extrabold text-deep-slate tracking-tight">Pro Dashboard</h1>
           <p className="text-muted-slate font-medium text-sm mt-1">You have {pending.length} new service requests waiting.</p>
        </div>
        <div className="flex gap-4 items-center">
           <Notifications socket={socket} />
           <Link to="/worker/schedule" className="bg-deep-slate text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-slate-900/10 hover:scale-105 transition-all">
              Manage Calendar
           </Link>
        </div>
      </header>

      {/* 📊 KEY Vitals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Revenue', value: '₹' + (earnings?.totalEarnings?.toFixed(0) || '0'), sub: '+12% this week', color: 'text-emerald-500', icon: <FaWallet /> },
          { label: 'Jobs Completed', value: bookings.filter(b=>b.status==='completed').length, sub: 'All time', color: 'text-azure-blue', icon: <FaCheckCircle /> },
          { label: 'New Requests', value: pending.length, sub: 'Awaiting Action', color: 'text-rose-500', icon: <FaBell /> }
        ].map((stat, i) => (
           <div key={i} className="glass-panel p-8 shadow-2xl shadow-slate-200/40 relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                 <span className="text-[10px] font-black text-muted-slate uppercase tracking-widest">{stat.label}</span>
                 <span className={`${stat.color} text-lg`}>{stat.icon}</span>
              </div>
              <p className="text-4xl font-black text-deep-slate">{stat.value}</p>
              <p className="text-[10px] font-bold text-muted-slate/60 mt-2 uppercase tracking-tight">{stat.sub}</p>
           </div>
        ))}
      </div>

      {/* 🍱 LIVE JOB FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* New Requests (2/3) */}
        <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-2xl font-black text-deep-slate">Live Work Portal</h2>
               <Link to="/worker/bookings" className="text-[10px] font-black text-azure-blue uppercase tracking-widest hover:underline">View All →</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               {pending.map((booking) => {
                  const isUrgent = new Date(`${booking.scheduledDate}T${booking.scheduledTime}`) - new Date() < 86400000;
                  return (
                    <div key={booking._id} className="glass-panel p-6 shadow-xl relative animate-fadeIn group">
                       <div className="flex justify-between items-start mb-6">
                          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${isUrgent ? 'bg-rose-50 text-rose-500 border-rose-100' : 'bg-blue-50 text-azure-blue border-blue-100'}`}>
                             {isUrgent ? 'URGENT' : 'SCHEDULED'}
                          </span>
                          <span className="text-[9px] font-bold text-muted-slate">JUST NOW</span>
                       </div>
                       
                       <h3 className="text-xl font-black text-deep-slate mb-2">{booking.service?.name}</h3>
                       <div className="space-y-1 mb-8">
                          <p className="text-xs font-bold text-muted-slate flex items-center gap-2"><div className="w-1 h-1 bg-azure-blue rounded-full"></div> {booking.address}</p>
                          <p className="text-xs font-bold text-deep-slate flex items-center gap-2 mt-2">Payout: ₹{booking.totalAmount}</p>
                       </div>

                       <div className="flex gap-2">
                          <button onClick={()=>handleAccept(booking._id)} className="flex-1 py-3 bg-azure-blue text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/10 hover:scale-[1.02] transition-all">Accept</button>
                          <button onClick={()=>handleReject(booking._id)} className="px-4 py-3 bg-white/50 text-rose-500 rounded-xl font-black text-[10px] uppercase border border-white/40 hover:bg-rose-50 transition-all">Decline</button>
                       </div>
                    </div>
                  );
               })}
               {pending.length === 0 && (
                 <div className="col-span-2 glass-panel p-16 text-center">
                    <FaCompass className="text-slate-200 text-6xl mx-auto mb-4 animate-slowSpin" />
                    <p className="text-muted-slate font-black italic">Waiting for new requests in your area...</p>
                 </div>
               )}
            </div>
        </div>

        {/* Sidebar Active Jobs (1/3) */}
        <div className="lg:col-span-1 space-y-6">
            <h3 className="text-xl font-black text-deep-slate">Today's Schedule</h3>
            <div className="glass-panel p-2 space-y-2">
               {bookings.filter(b=>b.status==='accepted' || b.status==='in-progress').slice(0, 5).map(b => (
                  <div key={b._id} className="p-4 bg-white/30 rounded-2xl border border-white/20 group hover:bg-white/50 transition-all">
                     <div className="flex justify-between items-start mb-3">
                        <div>
                           <p className="text-xs font-black text-deep-slate">{b.user?.name || 'Customer'}</p>
                           <p className="text-[10px] font-bold text-muted-slate">{b.service?.name}</p>
                        </div>
                        <span className="text-[10px] font-black text-azure-blue bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">{b.scheduledTime}</span>
                     </div>
                     <button onClick={()=>handleComplete(b._id)} className="w-full py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all hover:scale-[1.02]">
                        Mark Complete
                     </button>
                  </div>
               ))}
               {bookings.filter(b=>b.status==='accepted' || b.status==='in-progress').length === 0 && (
                 <div className="py-12 text-center text-muted-slate font-bold text-xs opacity-50 italic">No active tasks.</div>
               )}
            </div>
        </div>
      </div>

      {/* 📜 RECENT HISTORY SECTION */}
      <div className="space-y-6">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-deep-slate">Recent Job History</h2>
            <Link to="/worker/bookings" className="text-[10px] font-black text-azure-blue uppercase tracking-widest hover:underline">View Full History →</Link>
        </div>
        
        <div className="glass-panel overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-white/40 border-b border-white/20">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-muted-slate uppercase tracking-widest">Service</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-slate uppercase tracking-widest">Customer</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-slate uppercase tracking-widest">Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-slate uppercase tracking-widest">Amount</th>
                <th className="px-6 py-4 text-[10px] font-black text-muted-slate uppercase tracking-widest text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {history.map((job) => (
                <tr key={job._id} className="hover:bg-white/20 transition-colors">
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-deep-slate">{job.service?.name}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-muted-slate">{job.user?.name}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-xs font-bold text-muted-slate">{new Date(job.scheduledDate).toLocaleDateString()}</p>
                  </td>
                  <td className="px-6 py-5">
                    <p className="text-sm font-black text-azure-blue">₹{job.totalAmount}</p>
                  </td>
                  <td className="px-6 py-5 text-right">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                      job.status === 'completed' ? 'bg-emerald-50 text-emerald-500' : 
                      job.status === 'rejected' ? 'bg-rose-50 text-rose-500' : 
                      'bg-slate-100 text-slate-500'
                    }`}>
                      {job.status}
                    </span>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-slate font-bold text-xs opacity-50 italic">
                    No completed jobs yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx="true">{`
         .animate-fadeIn { animation: fadeIn 0.5s ease-out forwards; }
         @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
         .animate-slowSpin { animation: spin 10s linear infinite; }
         @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default WorkerDashboard;
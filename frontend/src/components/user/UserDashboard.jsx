import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { FaUser, FaStar, FaHistory, FaPlusCircle, FaCompass, FaCheckCircle, FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { BASE_URL } from '../../utils/constants';
import ServiceCard from '../common/ServiceCard';
import RecommendedServices from './RecommendedServices';

const SERVER_URL = BASE_URL;

const UserDashboard = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const { data } = await axios.get('/user/profile');
        if (data.profileImage) {
          const url = data.profileImage.startsWith('http') ? data.profileImage : `${SERVER_URL}${data.profileImage}`;
          setProfileImageUrl(url);
          updateUser({ profileImage: data.profileImage, name: data.name });
        }
      } catch (_) { }
    };
    loadProfileImage();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [servicesRes, bookingsRes, favoritesRes] = await Promise.all([
        axios.get('/services'),
        axios.get('/user/bookings'),
        axios.get('/favorites'),
      ]);
      setServices(servicesRes.data);
      setBookings(bookingsRes.data);
      setFavorites(favoritesRes.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'All', 'Plumbing', 'Electrical', 'Cleaning', 'Carpentry', 'Painting', 
    'Pest Control', 'Appliance Repair', 'Salon Services', 'Gardening', 'Smart Home'
  ];

  // 📈 DYNAMIC SORTING LOGIC: Count activity per service
  const serviceCounts = bookings.reduce((acc, booking) => {
    const id = booking.service?._id;
    if (id) acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  // Sort services: High booking volume first
  const sortedServices = [...services].sort((a, b) => {
    const countA = serviceCounts[a._id] || 0;
    const countB = serviceCounts[b._id] || 0;
    if (countB !== countA) return countB - countA;
    return new Date(b.updatedAt) - new Date(a.updatedAt); // Recency fallback
  });

  const filteredServices = selectedCategory === 'All' 
    ? sortedServices 
    : sortedServices.filter((s) => s.category === selectedCategory);

  if (loading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-azure-blue"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen relative font-lato">
      {/* 🚀 FIXED GLASS SIDEBAR */}
      <aside className="w-64 glass-panel border-r border-white/20 flex flex-col fixed h-[calc(100vh-2rem)] m-4 z-50 shadow-2xl">
        <div className="p-8 pb-4">
          <h2 className="text-xl font-black text-deep-slate tracking-tighter flex items-center gap-2">
            <div className="w-2 h-2 bg-azure-blue rounded-full animate-pulse"></div>
            Categories
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1 custom-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 transform ${
                selectedCategory === cat
                  ? 'glass-active text-azure-blue shadow-lg shadow-blue-500/10 scale-105'
                  : 'text-muted-slate hover:bg-white/40 hover:text-deep-slate'
              }`}
            >
              <span className="text-sm font-bold">{cat}</span>
            </button>
          ))}
        </div>

        <div className="p-6 border-t border-white/10 mt-auto">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/50 border border-white/40 flex items-center justify-center overflow-hidden">
               {profileImageUrl ? <img src={profileImageUrl} alt="user" className="w-full h-full object-cover" /> : <FaUser className="text-slate-400" />}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-black text-deep-slate truncate">{user?.name || 'User'}</p>
              <p className="text-[9px] font-bold text-azure-blue uppercase tracking-widest">Premium Plan</p>
            </div>
          </div>
          <Link to="/services" className="block">
            <button className="w-full py-3 bg-azure-blue text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 hover:scale-105 transition-all">
              Book Service
            </button>
          </Link>
        </div>
      </aside>

      {/* 🚀 MAIN CONTENT */}
      <main className="flex-1 ml-72 p-10 space-y-12">
        {/* HEADER */}
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-deep-slate tracking-tight">Overview</h1>
            <p className="text-muted-slate font-medium text-sm mt-1">Check your recent activity and recommendations.</p>
          </div>
          <div className="flex gap-4">
             <div className="glass-panel px-4 py-2 flex items-center gap-2 border border-white/30">
                <FaStar className="text-yellow-400" />
                <span className="text-xs font-bold text-deep-slate">4.9 User Rating</span>
             </div>
          </div>
        </header>

        {/* 📊 STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: 'Active Tasks', value: bookings.filter(b=>b.status!=='completed').length, color: 'text-azure-blue', icon: <FaCompass /> },
            { label: 'Completed', value: bookings.filter(b=>b.status==='completed').length, color: 'text-emerald-500', icon: <FaCheckCircle /> },
            { label: 'Wallet Balance', value: '₹1,240', color: 'text-orange-500', icon: <FaHistory /> }
          ].map((stat, i) => (
            <div key={i} className="glass-panel p-8 shadow-2xl shadow-slate-200/50 group hover:-translate-y-1 transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] font-black text-muted-slate uppercase tracking-widest">{stat.label}</span>
                <span className={`${stat.color} p-2 bg-white/50 rounded-lg shadow-inner`}>{stat.icon}</span>
              </div>
              <p className={`text-4xl font-black text-deep-slate`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* QUICK ACTIONS */}
        <div className="space-y-4">
           <h3 className="text-lg font-black text-deep-slate flex items-center gap-2">
              <FaPlusCircle className="text-azure-blue" /> Quick Shortcuts
           </h3>
           <div className="flex gap-4">
              <Link to="/services" className="bg-deep-slate text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 shadow-lg shadow-slate-900/10 hover:scale-105 transition-all">
                 Browse Marketplace
              </Link>
              <Link to="/user/bookings" className="glass-panel px-8 py-4 rounded-2xl font-bold text-deep-slate hover:bg-white/60 transition-all flex items-center gap-3 border border-white/30">
                 Manage Requests
              </Link>
           </div>
        </div>

        {/* 🍱 DYNAMIC INTEGRATED GRID (NO SIDEBAR) */}
        <div className="space-y-10">
          <RecommendedServices />
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
               <h2 className="text-2xl font-black text-deep-slate">{selectedCategory} Pros</h2>
               <span className="glass-panel px-4 py-1.5 text-[10px] font-black text-muted-slate uppercase tracking-wider border border-white/30">
                 {filteredServices.length} Results
               </span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
              {/* SLOTS 1 & 2 */}
              {filteredServices.slice(0, 2).map(s => (
                <ServiceCard key={s._id} service={s} favorites={favorites} isTrending={serviceCounts[s._id] > 5} />
              ))}

              {/* SLOT 3: LIVE ACTIVITY CARD (IF ACTIVITY EXISTS) */}
              {bookings.length > 0 && (
                <div className="xl:row-span-2 glass-panel p-8 space-y-8 shadow-2xl shadow-blue-500/5 min-h-[600px] flex flex-col border border-white/40">
                   <div className="flex items-center justify-between">
                      <h3 className="text-xl font-black text-deep-slate">Live Work Feed</h3>
                      <span className="text-[9px] font-black text-azure-blue animate-pulse tracking-widest">● LIVE UPDATES</span>
                   </div>
                   
                   <div className="flex-1 overflow-y-auto divide-y divide-white/10 pr-2 custom-scrollbar">
                      {bookings.slice(0, 10).map((booking) => (
                        <div key={booking._id} className="py-5 flex gap-5 hover:bg-white/30 rounded-2xl px-2 transition-all group">
                           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                             booking.status === 'completed' ? 'bg-emerald-100/60 text-emerald-600' : 
                             booking.status === 'pending' ? 'bg-amber-100/60 text-amber-600' : 'bg-blue-100/60 text-blue-600'
                           }`}>
                              {booking.status === 'completed' ? <FaCheckCircle /> : booking.status === 'pending' ? <FaClock /> : <FaCompass />}
                           </div>
                           <div>
                              <p className="text-sm font-black text-deep-slate line-clamp-1">{booking.service?.name}</p>
                              <p className="text-[11px] text-muted-slate font-medium line-clamp-2 mt-1 leading-relaxed">{booking.notes || 'Activity detected for this service.'}</p>
                              <p className="text-[9px] font-black text-azure-blue uppercase mt-3 tracking-widest opacity-80">
                                 {new Date(booking.updatedAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} • RECENT
                              </p>
                           </div>
                        </div>
                      ))}
                   </div>
                   <Link to="/user/bookings" className="text-center py-4 bg-white/40 rounded-2xl text-[10px] font-black text-deep-slate uppercase tracking-widest border border-white/20 hover:bg-white/60 transition-all">
                      View Audit Log
                   </Link>
                </div>
              )}

              {/* REMAINING SLOTS: DYNAMICALLY FILL THE REST OF THE GRID */}
              {filteredServices.slice(bookings.length > 0 ? 2 : 0).map(s => (
                <ServiceCard key={s._id} service={s} favorites={favorites} isTrending={serviceCounts[s._id] > 5} />
              ))}

              {filteredServices.length === 0 && (
                <div className="col-span-1 md:col-span-2 xl:col-span-3 glass-panel p-20 text-center border-dashed border-white/40">
                   <FaCompass className="text-slate-200 text-6xl mx-auto mb-6 animate-pulse" />
                   <p className="text-muted-slate font-black italic">Adjusting parameters... try another category.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
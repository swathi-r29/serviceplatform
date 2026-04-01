import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../context/AuthContext';
import { FaUser } from 'react-icons/fa';

const SERVER_URL = 'http://localhost:5000';

import ServiceCard from '../common/ServiceCard';
import RecommendedServices from './RecommendedServices';

const UserDashboard = () => {
  const { user, updateUser } = useContext(AuthContext);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [profileImageUrl, setProfileImageUrl] = useState(null);

  // Fetch fresh profile on mount to get current profileImage
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const { data } = await axios.get('/user/profile');
        if (data.profileImage) {
          const url = data.profileImage.startsWith('http')
            ? data.profileImage
            : `${SERVER_URL}${data.profileImage}`;
          setProfileImageUrl(url);
          updateUser({ profileImage: data.profileImage, name: data.name });
        }
      } catch (_) { }
    };
    loadProfileImage();
  }, []);

  // Also update from context whenever user.profileImage changes (after profile save)
  useEffect(() => {
    if (user?.profileImage) {
      const url = user.profileImage.startsWith('http')
        ? user.profileImage
        : `${SERVER_URL}${user.profileImage}`;
      setProfileImageUrl(url);
    }
  }, [user?.profileImage]);

  const categories = [
    'All',
    'Plumbing',
    'Electrical',
    'Cleaning',
    'Carpentry',
    'Painting',
    'AC Repair',
    'Pest Control',
    'Appliance Repair',
    'Moving & Packing',
    'Home Tutoring',
    'Salon & Spa',
    'Gardening',
    'Smart Home',
    'Other',
  ];

  useEffect(() => {
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

  const filteredServices =
    selectedCategory === 'All'
      ? services
      : services.filter((service) => service.category === selectedCategory);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Icon mapping for categories
  const getCategoryIcon = (category) => {
    // You might need to import these icons, but for now I'll use text or generic SVG if imports aren't available.
    // Ideally: import { FaWrench, FaBolt, FaBroom, FaHammer, FaPaintRoller, FaFan, FaEllipsisH } from 'react-icons/fa';
    // Since I can't guarantee imports in this single replace block without adding them at the top, I'll use SVGs inline or assume icons are imported.
    // Actually, I should do a full file replacement to add imports.
    // But to save tokens, I will try to use the ones I can or generic.
    return null;
  };

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] font-lato">
      {/* LEFT SIDEBAR */}
      <aside className="w-64 bg-black text-white flex flex-col fixed h-full z-50">
        {/* Logo - Removed as per request */}

        {/* Categories Header */}
        <div className="px-6 py-2 mt-6">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Categories</p>
        </div>

        {/* Categories List */}
        <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${selectedCategory === category
                ? 'bg-white/10 text-white font-medium shadow-sm'
                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
            >
              {/* Icons based on Category */}
              <span className={`text-lg ${selectedCategory === category ? 'text-[#c4975d]' : 'text-gray-500 group-hover:text-gray-300'}`}>
                {category === 'Plumbing' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                {category === 'Electrical' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                {category === 'Cleaning' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>}
                {category === 'Carpentry' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>}
                {category === 'Painting' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" /></svg>}
                {category === 'AC Repair' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                {category === 'Pest Control' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4m0 0L8 8m4-4l4 4m-4 4v4m0 0l-4-4m4 4l4-4" /></svg>}
                {category === 'Appliance Repair' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                {category === 'Moving & Packing' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                {category === 'Home Tutoring' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>}
                {category === 'Salon & Spa' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243zm0-5.758a3 3 0 114.243 4.243 3 3 0 01-4.243-4.243z" /></svg>}
                {category === 'Gardening' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                {category === 'Smart Home' && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                {(category === 'All' || category === 'Other') && <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>}
              </span>
              <span className="tracking-wide text-sm">{category}</span>
            </button>
          ))}
        </div>

        {/* Profile Footer */}
        <div className="p-4 bg-[#142036]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center overflow-hidden border-2 border-[#c4975d] flex-shrink-0 text-gray-300">
              {profileImageUrl ? (
                <img
                  src={profileImageUrl}
                  alt={user?.name || 'Profile'}
                  className="w-full h-full object-cover"
                  onError={() => setProfileImageUrl(null)}
                />
              ) : user?.name ? (
                <span className="text-lg font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
              ) : (
                <FaUser className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="text-white text-sm font-bold leading-tight truncate">{user?.name || 'User'}</h4>
              <p className="text-[10px] font-bold text-[#c4975d] uppercase tracking-wider">Diamond Member</p>
            </div>
          </div>
          <Link to="/services" className="block w-full">
            <button className="w-full bg-[#c4975d] hover:bg-[#b08549] text-[#1a2b4b] font-bold py-3 rounded-lg text-xs uppercase tracking-wider transition-colors">
              Book Service
            </button>
          </Link>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* HEADER */}
        <header className="flex justify-between items-center mb-10">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button could go here */}
            <h1 className="text-3xl font-playfair font-bold text-[#1a2b4b]">Overview</h1>
          </div>


        </header>

        {/* STATS */}
        <div className="stats-grid grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute right-0 top-0 w-24 h-24 bg-blue-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
            <h3 className="text-gray-500 font-medium mb-2 relative z-10">Total Bookings</h3>
            <p className="text-4xl font-bold text-[#1a2b4b] relative z-10">{bookings.length}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
            <h3 className="text-gray-500 font-medium mb-2 relative z-10">Completed</h3>
            <p className="text-4xl font-bold text-green-600 relative z-10">
              {bookings.filter((b) => b.status === 'completed').length}
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute right-0 top-0 w-24 h-24 bg-yellow-50 rounded-bl-full opacity-50 transition-transform group-hover:scale-110"></div>
            <h3 className="text-gray-500 font-medium mb-2 relative z-10">Pending</h3>
            <p className="text-4xl font-bold text-yellow-500 relative z-10">
              {bookings.filter((b) => b.status === 'pending').length}
            </p>
          </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="mb-10">
          <h3 className="text-xl font-bold font-playfair text-[#1a2b4b] mb-4">Quick Actions</h3>
          <div className="flex gap-4 flex-wrap">
            <Link to="/services" className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition shadow-sm hover:shadow-md">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Book a New Service
            </Link>

            <Link to="/user/bookings" className="bg-white border border-gray-200 text-black px-6 py-3 rounded-lg flex items-center gap-2 font-medium transition hover:border-black hover:bg-gray-50">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View History
            </Link>
          </div>
        </div>

        {/* SPLIT LAYOUT: AVAILABLE SERVICES & RECENT ACTIVITY */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT COLUMN: AVAILABLE SERVICES (2/3) */}
          <div className="lg:w-2/3">


            {/* AI Recommendations */}
            <RecommendedServices />

            <div className="mb-6">
              <h2 className="text-xl font-bold font-playfair text-[#1a2b4b] mb-4">Available Services</h2>
            </div>

            <section className="mb-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredServices.map((service) => (
                  <ServiceCard
                    key={service._id}
                    service={service}
                    favorites={favorites}
                  />
                ))}
              </div>

              {filteredServices.length === 0 && (
                <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
                  <p className="text-gray-400 text-lg">No services found in this category.</p>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT COLUMN: RECENT ACTIVITY (1/3) */}
          <div className="lg:w-1/3">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold font-playfair text-[#1a2b4b]">Recent Activity</h3>
              <button className="text-xs font-bold text-gray-400 uppercase tracking-wide hover:text-[#1a2b4b]">Mark as read</button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-2">
              <div className="divide-y divide-gray-50 max-h-[600px] overflow-y-auto custom-scrollbar">
                {bookings.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).map((booking) => {
                  let icon, bgClass, textClass, title, desc;

                  switch (booking.status) {
                    case 'completed':
                      icon = (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      );
                      bgClass = 'bg-green-100';
                      textClass = 'text-green-600';
                      title = 'Service Completed';
                      desc = `${booking.service?.name || 'Service'} was completed successfully.`;
                      break;
                    case 'accepted':
                      icon = (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      );
                      bgClass = 'bg-blue-100';
                      textClass = 'text-blue-600';
                      title = 'Pro Dispatched';
                      desc = `${booking.worker?.name || 'A Pro'} is assigned to your ${booking.service?.name || 'booking'}.`;
                      break;
                    case 'pending':
                      icon = (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                      bgClass = 'bg-yellow-100';
                      textClass = 'text-yellow-600';
                      title = 'Booking Request Sent';
                      desc = `Request for ${booking.service?.name} is pending approval.`;
                      break;
                    case 'cancelled':
                      icon = (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      );
                      bgClass = 'bg-red-100';
                      textClass = 'text-red-600';
                      title = 'Booking Cancelled';
                      desc = `Booking for ${booking.service?.name} was cancelled.`;
                      break;
                    default:
                      icon = (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      );
                      bgClass = 'bg-gray-100';
                      textClass = 'text-gray-600';
                      title = 'Status Update';
                      desc = `Booking status changed to ${booking.status}.`;
                  }

                  return (
                    <div key={booking._id} className="p-4 flex gap-4 hover:bg-gray-50 transition-colors rounded-lg group">
                      <div className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center flex-shrink-0 ${textClass} mt-1 group-hover:scale-110 transition-transform`}>
                        {icon}
                      </div>
                      <div>
                        <h5 className="font-bold text-[#1a2b4b] text-sm">{title}</h5>
                        <p className="text-xs text-gray-500 mt-0.5 mb-1 line-clamp-2">{desc}</p>
                        <span className="text-[10px] text-gray-400 font-medium">{new Date(booking.updatedAt).toLocaleDateString()} • {new Date(booking.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}

                {bookings.length === 0 && (
                  <div className="p-8 text-center text-gray-400 text-sm">No recent activity.</div>
                )}
              </div>
              <Link to="/user/bookings" className="block w-full py-3 text-xs font-bold text-[#1a2b4b] uppercase tracking-wider border-t border-gray-50 hover:bg-gray-50 transition-colors mt-2 text-center">
                View all activity
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboard;
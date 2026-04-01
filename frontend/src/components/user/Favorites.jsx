import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import UserSidebar from './UserSidebar';
import { FaHeart, FaStar, FaCommentDots, FaArrowRight } from 'react-icons/fa';

const SERVER_URL = 'http://localhost:5000';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'professionals', 'services'

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const { data } = await axios.get('/favorites');
      setFavorites(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (id, type) => {
    try {
      const url = type === 'worker' ? `/favorites/worker/${id}` : `/favorites/${id}/favorite`;
      await axios.put(url);
      fetchFavorites(); // Refresh list
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove favorite');
    }
  };

  const favoriteProfessionals = favorites.filter(f => f.worker);
  const savedServices = favorites.filter(f => f.service);

  if (loading) return (
    <div className="flex min-h-screen bg-[#f3f4f6]">
      <UserSidebar />
      <div className="flex-1 ml-64 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4b]"></div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] font-lato">
      <UserSidebar />

      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-playfair font-bold text-[#1a2b4b]">Your Favorites</h1>
          <p className="text-gray-500 mt-2">A curated selection of your most trusted professionals and preferred home maintenance services.</p>
        </header>

        {/* Favorite Professionals Section */}
        {(activeTab === 'all' || activeTab === 'professionals') && (
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-playfair text-[#1a2b4b]">Favorite Professionals</h2>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{favoriteProfessionals.length}</span>
              </div>
              {favoriteProfessionals.length > 3 && <button className="text-sm font-bold text-[#1a2b4b] hover:underline">View All</button>}
            </div>

            {favoriteProfessionals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {favoriteProfessionals.map(({ _id, worker }) => (
                  <div key={_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition group relative">
                    <button
                      onClick={() => removeFavorite(worker._id, 'worker')}
                      className="absolute top-6 right-6 text-[#1a2b4b] hover:text-red-500 transition-colors"
                    >
                      <FaHeart className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col items-center text-center mb-6">
                      <div className="relative mb-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white shadow-md">
                          {worker.profileImage ? (
                            <img src={`${SERVER_URL}${worker.profileImage}`} alt={worker.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                              <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                            </div>
                          )}
                        </div>
                        <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>

                      <h3 className="text-lg font-bold text-[#1a2b4b] mb-1">{worker.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{worker.skills?.[0] || 'Professional'} • Specialist</p>

                      <div className="flex items-center gap-1 text-sm font-medium text-[#1a2b4b] bg-yellow-50 px-3 py-1 rounded-full">
                        <FaStar className="text-yellow-400" />
                        <span>{worker.rating?.toFixed(1) || 'N/A'}</span>
                        <span className="text-gray-400 font-normal">({worker.reviewCount || 0} reviews)</span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button className="flex-1 bg-[#1a2b4b] hover:bg-[#2c426b] text-white py-2.5 rounded-lg font-bold text-sm transition shadow-sm">
                        Book Now
                      </button>
                      <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-[#1a2b4b]">
                        <FaCommentDots />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500">You haven't added any professionals to your favorites yet.</p>
              </div>
            )}
          </section>
        )}

        {/* Saved Services Section */}
        {(activeTab === 'all' || activeTab === 'services') && (
          <section>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold font-playfair text-[#1a2b4b]">Saved Services</h2>
                <span className="bg-gray-200 text-gray-700 text-xs font-bold px-2 py-1 rounded-full">{savedServices.length}</span>
              </div>
              {savedServices.length > 3 && <button className="text-sm font-bold text-[#1a2b4b] hover:underline">View All</button>}
            </div>

            {savedServices.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {savedServices.map(({ _id, service }) => (
                  <div key={_id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row hover:shadow-md transition group">
                    <div className="sm:w-48 h-48 relative">
                      {service.image ? (
                        <img src={`${SERVER_URL}${service.image}`} alt={service.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <span className="text-gray-400">No Image</span>
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-[#1a2b4b]">
                          {service.category}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold text-[#1a2b4b] font-playfair">{service.name}</h3>
                        <button
                          onClick={() => removeFavorite(service._id, 'service')}
                          className="text-[#1a2b4b] hover:text-red-500 transition-colors"
                        >
                          <FaHeart />
                        </button>
                      </div>

                      <p className="text-sm text-gray-500 mb-4 line-clamp-2">{service.description}</p>

                      <div className="mt-auto flex justify-between items-end">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Starting From</p>
                          <p className="text-2xl font-bold text-[#1a2b4b]">₹{service.price}</p>
                        </div>
                        <Link to={`/user/booking/create/${service._id}`} className="px-5 py-2 bg-gray-100 hover:bg-gray-200 text-[#1a2b4b] font-bold text-sm rounded-lg transition border border-transparent hover:border-gray-300">
                          Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-dashed border-gray-300 p-8 text-center">
                <p className="text-gray-500">No saved services found.</p>
                <Link to="/services" className="text-[#1a2b4b] font-bold hover:underline mt-2 inline-block">Browse Services</Link>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default Favorites;

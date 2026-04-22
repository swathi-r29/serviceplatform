import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { FaHeart, FaStar, FaCommentDots, FaArrowRight } from 'react-icons/fa';

const SERVER_URL = 'http://localhost:5000';

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const savedServices = favorites.filter(f => f.service);

  if (loading) return (
    <div className="flex min-h-screen bg-[#f3f4f6] justify-center items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1a2b4b]"></div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] font-lato">

      <main className="flex-1 p-8 overflow-y-auto">
        {/* Header */}
        <header className="mb-10">
          <h1 className="text-3xl font-playfair font-bold text-[#1a2b4b]">Your Favorites</h1>
          <p className="text-gray-500 mt-2">A curated selection of your preferred home maintenance services.</p>
        </header>

        {/* Saved Services Section */}
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
      </main>
    </div>
  );
};

export default Favorites;

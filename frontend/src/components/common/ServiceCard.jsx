import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const SERVER_URL = 'http://localhost:5000';

const ServiceCard = ({ service, favorites = [] }) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const favorite = favorites.find(
      fav => fav.service?._id === service._id
    );
    setIsFavorite(!!favorite);
  }, [favorites, service._id]);

  const handleAddToFavorites = async () => {
    try {
      await axios.put(`/favorites/${service._id}/favorite`);
      setIsFavorite(prev => !prev);
      alert(isFavorite ? 'Removed from favorites!' : 'Added to favorites!');
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update favorites');
    }
  };

  const imageUrl =
    service.image && !imgError
      ? `${SERVER_URL}${service.image}`
      : '/placeholder-service.png';

  return (
    <div className="bg-white rounded-[2rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group flex flex-col h-full border border-gray-100/50">
      {/* IMAGE CONTAINER */}
      <div className="relative h-56 overflow-hidden m-2 rounded-[1.5rem]">
        <img
          src={imageUrl}
          alt={service.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* CATEGORY BADGE */}
        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm text-[#1a2b4b] px-4 py-2 rounded-2xl text-xs font-bold shadow-lg border border-gray-100">
          {service.category}
        </div>
      </div>

      <div className="p-8 flex flex-col flex-1">
        <h3 className="text-2xl font-bold text-[#1a2b4b] mb-4 group-hover:text-[#d4a76d] transition-colors duration-300">
          {service.name}
        </h3>

        <p className="text-gray-500 text-sm mb-6 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* PRICING AND ACTIONS */}

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-gray-400 uppercase font-extrabold tracking-widest mb-1">Starting from</span>
            <span className="text-3xl font-black text-[#d4a76d] leading-none transition-all duration-300 group-hover:scale-110 origin-left">
              ₹{service.startingPrice || service.price}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAddToFavorites}
              className={`p-3 rounded-2xl transition-all duration-300 border ${isFavorite
                ? 'bg-red-50 text-red-500 border-red-100 shadow-md shadow-red-500/10'
                : 'bg-white text-gray-300 hover:text-red-500 border-gray-100 hover:border-red-50'
                }`}
              title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            >
              <svg className="w-6 h-6" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            <Link
              to={`/user/booking/create/${service._id}`}
              className="bg-[#2a2a2a] hover:bg-[#1a1a1a] text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 shadow-xl shadow-black/10 hover:shadow-black/20 transform hover:-translate-y-1"
            >
              Book Now
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;

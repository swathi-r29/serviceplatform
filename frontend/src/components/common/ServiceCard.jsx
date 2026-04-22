import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';
import { BASE_URL } from '../../utils/constants';

const SERVER_URL = BASE_URL;

const ServiceCard = ({ service, favorites = [], isTrending = false }) => {
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
    <div className="bg-glass-surface backdrop-blur-md rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:bg-white/50 group flex flex-col h-full border border-glass-border shadow-slate-200/50">
      {/* IMAGE CONTAINER - Floating Pill Shape */}
      <div className="relative h-48 overflow-hidden m-4 rounded-[2.5rem] shadow-sm">
        <img
          src={imageUrl}
          alt={service.name}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* BADGES - Top Right as per screenshot */}
        <div className="absolute top-4 right-4 flex gap-2">
          <div className="bg-white/95 backdrop-blur-sm text-azure-blue px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-md border border-slate-100">
            {service.category}
          </div>
          {isTrending && (
            <div className="bg-rose-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-rose-500/20 border border-white/20 animate-pulse">
               ⚡ Trending
            </div>
          )}
        </div>
      </div>

      <div className="p-8 pt-2 flex flex-col flex-1">
        <h3 className="text-2xl font-black text-deep-slate mb-3 group-hover:text-azure-blue transition-colors duration-300 tracking-tight">
          {service.name}
        </h3>

        <p className="text-muted-slate text-sm mb-6 line-clamp-2 leading-relaxed">
          {service.description}
        </p>

        {/* PRICING AND ACTIONS */}

        <div className="mt-auto pt-4 border-t border-gray-50 flex items-end justify-between">
          <div className="flex flex-col text-left">
            <span className="text-[11px] text-muted-slate uppercase font-extrabold tracking-widest mb-1">Starting from</span>
            <span className="text-3xl font-black text-azure-blue leading-none transition-all duration-300 group-hover:scale-110 origin-left">
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
              className="bg-azure-blue hover:bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transform hover:-translate-y-1"
            >
              Book Now
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;

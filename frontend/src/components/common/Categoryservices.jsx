import { useEffect, useState, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaThLarge, FaMapMarkedAlt, FaChevronLeft } from 'react-icons/fa';
import axios from '../../api/axios';
import ServiceCard from './ServiceCard';
import ServiceMapView from '../user/ServiceMapView';
import SmartSearchBar from '../user/SmartSearchBar';
import { AuthContext } from '../../context/AuthContext';

const SERVER_URL = 'http://localhost:5000';

const CategoryServices = () => {
  const { user } = useContext(AuthContext);
  const { categoryName } = useParams();
  const [services, setServices] = useState([]);
  const [providers, setProviders] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'map'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    // 🌍 Get user location for "Nearby" filtering
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(coords);
          console.log('🌍 User location captured:', coords);
        },
        (error) => {
          console.warn('🌍 Location access denied or failed:', error.message);
        }
      );
    }
  }, []);

  useEffect(() => {
    console.log('CategoryServices component mounted');
    fetchCategoryServices();
  }, [categoryName, userLocation]);

  const fetchCategoryServices = async () => {
    try {
      setLoading(true);
      setError('');

      // 1. Fetch services
      const { data: allServices } = await axios.get('/services');
      const filteredServices = allServices.filter(service =>
        service.category?.toLowerCase() === categoryName.toLowerCase()
      );
      setServices(filteredServices);

      // 2. Fetch providers (workers) for the map with optional radius filtering
      let workersUrl = `/services/workers/${categoryName}`;
      if (userLocation) {
        workersUrl += `?lat=${userLocation.lat}&lng=${userLocation.lng}&radius=50`;
      }
      
      const { data: categoryWorkers } = await axios.get(workersUrl);
      setProviders(categoryWorkers);

      // 3. Fetch favorites (only for users)
      if (user?.role === 'user') {
        try {
          const { data: userFavorites } = await axios.get('/favorites');
          setFavorites(userFavorites);
        } catch (favErr) {
          console.warn('Could not load favorites:', favErr.message);
        }
      }

    } catch (err) {
      console.error('Error fetching services:', err);
      setError('Failed to load services. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading {categoryName} services...</p>
        </div>
        <style>{loadingStyles}</style>
      </>
    );
  }

  return (
    <>
      <div className="category-services-page">
        <div className="services-container">
          {/* Smart Search Bar */}
          <div className="mb-8">
            <SmartSearchBar
              onResultsFound={(results, params) => {
                setServices(results);
                // We could also pre-fill form data if we navigate to booking
              }}
            />
          </div>

          {/* Header with toggle */}
          <div className="header-section">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <Link to="/services" className="back-button">
                  <FaChevronLeft size={14} /> Back to Categories
                </Link>
                <h1 className="page-title">{categoryName} Services</h1>
                <p className="services-count">
                  {services.length} {services.length === 1 ? 'service' : 'services'} available
                </p>
              </div>

              {/* View Toggle */}
              <div className="view-toggle-container">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                >
                  <FaThLarge /> Grid
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`toggle-btn ${viewMode === 'map' ? 'active' : ''}`}
                >
                  <FaMapMarkedAlt /> Map
                </button>
              </div>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* No services found */}
          {!loading && !error && services.length === 0 && (
            <div className="no-services">
              <div className="no-services-icon">📦</div>
              <h3>No Services Available</h3>
              <p>There are currently no services in the {categoryName} category.</p>
              <Link to="/services" className="back-link">
                Browse Other Categories
              </Link>
            </div>
          )}

          {/* View Selection Rendering */}
          {!loading && !error && services.length > 0 && (
            <div className="view-content mt-8">
              {viewMode === 'grid' ? (
                <div className="services-grid pt-4">
                  {services.map(service => (
                    <ServiceCard
                      key={service._id}
                      service={service}
                      favorites={favorites}
                    />
                  ))}
                </div>
              ) : (
                <div className="map-view-wrapper animate-in bg-white p-4 rounded-3xl shadow-xl border border-gray-100">
                  <div className="mb-4 px-2 flex items-center justify-between">
                    <h3 className="font-bold text-gray-700 flex items-center gap-2">
                       <FaMapMarkedAlt className="text-orange-600" /> Professionals in Your Area
                    </h3>
                    <span className="text-xs text-gray-400 bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                      {userLocation ? 'Filtered by distance (50km)' : 'Showing all professionals'} in {categoryName}
                    </span>
                  </div>
                  <ServiceMapView 
                    providers={providers} 
                    center={userLocation ? [userLocation.lat, userLocation.lng] : [12.9716, 77.5946]} 
                    radius={50} 
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{mainStyles}</style>
    </>
  );
};

const loadingStyles = `
  .loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    gap: 1rem;
    font-family: 'Lato', sans-serif;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f4f6;
    border-top: 4px solid #e67e22;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .loading-container p {
    color: #6b7280;
    font-size: 1.1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const mainStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .category-services-page {
    min-height: 100vh;
    background: linear-gradient(135deg, #fafafa 0%, #f0f4f8 100%);
    padding: 2rem;
    font-family: 'Lato', sans-serif;
  }

  .services-container {
    max-width: 1400px;
    margin: 0 auto;
  }

  /* Header Section */
  .header-section {
    margin-bottom: 3rem;
  }

  .back-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #e67e22;
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    margin-bottom: 1.5rem;
    transition: all 0.3s ease;
  }

  .back-button:hover {
    gap: 0.75rem;
    color: #d35400;
  }

  .page-title {
    font-size: 3rem;
    font-weight: 700;
    color: #2c2c2c;
    margin-bottom: 0.5rem;
    text-transform: capitalize;
  }

  .services-count {
    color: #6b7280;
    font-size: 1.1rem;
  }

  .view-toggle-container {
    display: flex;
    background: #f3f4f6;
    padding: 0.4rem;
    border-radius: 14px;
    border: 1px solid #e5e7eb;
    height: fit-content;
  }

  .toggle-btn {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding: 0.6rem 1.5rem;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: 700;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    color: #9ca3af;
    background: transparent;
    border: none;
    cursor: pointer;
  }

  .toggle-btn.active {
    background: white;
    color: #2c2c2c;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  }

  .animate-in {
    animation: fadeInScale 0.4s ease-out forwards;
  }

  @keyframes fadeInScale {
    from { opacity: 0; transform: scale(0.98); }
    to { opacity: 1; transform: scale(1); }
  }

  /* Error Message */
  .error-message {
    background: #fee;
    border: 1px solid #fcc;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
    color: #c00;
  }

  /* No Services State */
  .no-services {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }

  .no-services-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .no-services h3 {
    font-size: 1.5rem;
    color: #2c2c2c;
    margin-bottom: 0.5rem;
  }

  .no-services p {
    color: #6b7280;
    margin-bottom: 2rem;
  }

  .back-link {
    display: inline-block;
    background: #e67e22;
    color: white;
    padding: 0.75rem 2rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: all 0.3s ease;
  }

  .back-link:hover {
    background: #d35400;
    transform: translateY(-2px);
  }

  /* Services Grid */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 2rem;
  }

  .service-card {
    background: white;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .service-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  }

  /* Service Image */
  .service-image-container {
    position: relative;
    width: 100%;
    height: 240px;
    overflow: hidden;
    background: linear-gradient(135deg, #fdf2e9 0%, #fae5d3 100%);
  }

  .service-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .service-card:hover .service-image {
    transform: scale(1.05);
  }

  .category-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: rgba(255, 255, 255, 0.95);
    color: #2c2c2c;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 600;
    backdrop-filter: blur(10px);
  }

  /* Service Content */
  .service-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    flex: 1;
  }

  .service-name {
    font-size: 1.4rem;
    font-weight: 700;
    color: #2c2c2c;
    line-height: 1.3;
  }

  .service-description {
    color: #6b7280;
    font-size: 0.95rem;
    line-height: 1.6;
    flex: 1;
  }

  .service-location {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #6b7280;
    font-size: 0.9rem;
  }

  .service-location svg {
    color: #e67e22;
  }

  /* Service Footer */
  .service-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 1rem;
    border-top: 1px solid #f3f4f6;
    margin-top: auto;
  }

  .price-section {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .price-label {
    font-size: 0.8rem;
    color: #9ca3af;
    font-weight: 500;
  }

  .price {
    font-size: 1.75rem;
    font-weight: 700;
    color: #e67e22;
  }

  .book-button {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: #2c2c2c;
    color: white;
    padding: 0.875rem 1.75rem;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  }

  .book-button:hover {
    background: #1a1a1a;
    transform: translateX(4px);
    gap: 0.75rem;
  }

  /* Responsive Design */
  @media (max-width: 1024px) {
    .services-grid {
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .page-title {
      font-size: 2.5rem;
    }
  }

  @media (max-width: 768px) {
    .category-services-page {
      padding: 1.5rem 1rem;
    }

    .page-title {
      font-size: 2rem;
    }

    .services-grid {
      grid-template-columns: 1fr;
      gap: 1.25rem;
    }

    .service-image-container {
      height: 200px;
    }
  }

  @media (max-width: 480px) {
    .page-title {
      font-size: 1.75rem;
    }

    .service-footer {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .book-button {
      width: 100%;
      justify-content: center;
    }
  }
`;

export default CategoryServices;
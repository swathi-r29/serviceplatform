import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../../api/axios';

const ServiceCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Icon and color mapping for categories
  const categoryConfig = {
    'InstaHelp': { icon: '⚡', badge: 'NEW', helpText: 'Help in 10 mins', color: 'bg-green-50', iconBg: 'bg-green-100' },
    'Beauty': { icon: '💆‍♀️', color: 'bg-pink-50', iconBg: 'bg-pink-100' },
    'Cleaning': { icon: '🧹', color: 'bg-orange-50', iconBg: 'bg-orange-100' },
    'Electrical': { icon: '🔧', color: 'bg-yellow-50', iconBg: 'bg-yellow-100' },
    'Plumbing': { icon: '🔧', color: 'bg-blue-50', iconBg: 'bg-blue-100' },
    'Water': { icon: '💧', color: 'bg-cyan-50', iconBg: 'bg-cyan-100' },
    'Painting': { icon: '🎨', color: 'bg-purple-50', iconBg: 'bg-purple-100' },
    'Cooking': { icon: '🍳', color: 'bg-orange-50', iconBg: 'bg-orange-100' },
    'Carpentry': { icon: '🏠', color: 'bg-indigo-50', iconBg: 'bg-indigo-100' },
    'Pest Control': { icon: '🦟', color: 'bg-rose-50', iconBg: 'bg-rose-100' },
    'Appliance Repair': { icon: '🧺', color: 'bg-neutral-50', iconBg: 'bg-neutral-100' },
    'Salon Services': { icon: '💇‍♀️', color: 'bg-pink-50', iconBg: 'bg-pink-100' },
    'Packers & Movers': { icon: '🚛', color: 'bg-amber-50', iconBg: 'bg-amber-100' },
    'Gardening': { icon: '🌿', color: 'bg-lime-50', iconBg: 'bg-lime-100' },
    'Smart Home': { icon: '🔐', color: 'bg-slate-50', iconBg: 'bg-slate-100' },
    'Other': { icon: '🔧', color: 'bg-gray-50', iconBg: 'bg-gray-100' }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const { data } = await axios.get('/services/categories');
      const mappedCategories = data.map((category, index) => ({
        id: index + 1,
        name: category,
        route: category,
        ...(categoryConfig[category] || categoryConfig['Other'])
      }));
      setCategories(mappedCategories);
    } catch (err) {
      console.error(err);
      setError('Failed to load categories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading services...</p>
      </div>
    );
  }

  return (
    <>
      <div className="service-categories-page">
        <div className="categories-container">
          <h1 className="page-title">What are you looking for?</h1>

          {/* Error message */}
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}

          {/* Categories Grid */}
          {categories.length > 0 && (
            <div className="categories-grid">
              {categories.map(category => (
                <Link
                  key={category.id}
                  to={`/services/category/${category.route}`}
                  className="category-card-link"
                >
                  <div className={`category-card ${category.color}`}>
                    {category.badge && (
                      <div className="badge-container">
                        <span className="new-badge">{category.badge}</span>
                      </div>
                    )}

                    <div className={`icon-container ${category.iconBg}`}>
                      <span className="category-icon">{category.icon}</span>
                    </div>

                    <h3 className="category-title">{category.name}</h3>

                    {category.helpText && (
                      <div className="help-text-container">
                        <span className="help-icon">⚡</span>
                        <span className="help-text">{category.helpText}</span>
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .service-categories-page {
          min-height: 100vh;
          background: #faf8f5;
          padding: 2rem;
          font-family: 'Lato', sans-serif;
        }

        .categories-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-title {
          font-size: 3rem;
          font-weight: 700;
          color: #2c2c2c;
          text-align: center;
          margin-bottom: 3rem;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }

        .category-card-link {
          text-decoration: none;
          color: inherit;
        }

        .category-card {
          background: white;
          border-radius: 16px;
          padding: 2rem 1.5rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
          overflow: hidden;
          min-height: 220px;
        }

        .category-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
        }

        .badge-container {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }

        .new-badge {
          background: #059669;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .icon-container {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1.5rem;
          margin-top: 1rem;
        }

        .category-icon {
          font-size: 3rem;
        }

        .category-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c2c2c;
          line-height: 1.4;
          margin-bottom: 1rem;
        }

        .help-text-container {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
        }

        .help-icon {
          font-size: 1rem;
          color: #059669;
        }

        .help-text {
          color: #059669;
          font-size: 0.85rem;
          font-weight: 600;
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

        /* Loading State */
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          gap: 1rem;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #f3f4f6;
          border-top: 4px solid #e67e22;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
          background: linear-gradient(135deg, #e8e8d8 0%, #d0baba 100%);
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
      `}</style>
    </>
  );
};

export default ServiceCategories;

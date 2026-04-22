import { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Notifications from './Notifications';
import axios from '../../api/axios';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    if (user && user.role === 'user') {
      const fetchCartCount = async () => {
        try {
          const { data } = await axios.get('/cart');
          setCartCount(data.items.length);
        } catch (err) {
          console.error('Failed to fetch cart count');
        }
      };
      fetchCartCount();
    }
  }, [user]);

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          {/* Logo */}
          <Link to="/" className="logo">
            ServiceHub
          </Link>

          {/* Right Side Container - Navigation + Actions */}
          <div className="nav-right-container">
            {/* Desktop Navigation */}
            <div className="nav-links desktop-nav">
              {!user && (
                <>
                  <Link to="/services" className="nav-link">Services</Link>
                  <Link to="/how-it-works" className="nav-link">How It Works</Link>
                  <Link to="/contact" className="nav-link">Contact Us</Link>
                </>
              )}

              {user && user.role === 'user' && (
                <>
                  <Link to="/services" className="nav-link">Services</Link>
                  <Link to="/user/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/user/bookings" className="nav-link">My Bookings</Link>
                  <Link to="/user/favorites" className="nav-link">Favorites</Link>
                  <Link to="/user/profile" className="nav-link">Profile</Link>
                  <Link to="/user/cart" className="nav-link flex items-center gap-1">
                    Cart
                    {cartCount > 0 && (
                      <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>
                </>
              )}

              {user && user.role === 'worker' && (
                <>
                  <Link to="/worker/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/worker/bookings" className="nav-link">Bookings</Link>
                  <Link to="/worker/earnings" className="nav-link">Earnings</Link>
                  <Link to="/worker/profile" className="nav-link">Profile</Link>
                </>
              )}

              {user && user.role === 'admin' && (
                <>
                  <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                  <Link to="/admin/services" className="nav-link">Services</Link>
                  <Link to="/admin/users" className="nav-link">Users</Link>
                  <Link to="/admin/workers" className="nav-link">Workers</Link>
                  <Link to="/admin/bookings" className="nav-link">Bookings</Link>
                  <Link to="/admin/analytics" className="nav-link">Analytics</Link>
                </>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="nav-actions">
              {user ? (
                <>
                  <span className="user-info">
                    <span className="user-name">{user.name}</span>
                    <span className="user-role">({user.role})</span>
                  </span>
                  {(user.role === 'user' || user.role === 'worker') && (
                    <div className="notification-wrapper">
                      <Notifications />
                    </div>
                  )}
                  <button onClick={logout} className="logout-btn">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="login-link">Login</Link>
                  <Link to="/register" className="register-btn">Register</Link>
                </>
              )}

              {/* Mobile Menu Button */}
              <button
                className="menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle menu"
              >
                <span></span>
                <span></span>
                <span></span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="mobile-menu">
            {!user && (
              <>
                <Link to="/services" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Services
                </Link>
                <Link to="/how-it-works" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  How It Works
                </Link>
                <Link to="/contact" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Contact Us
                </Link>
              </>
            )}

            {user && user.role === 'user' && (
              <>
                <Link to="/services" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Services
                </Link>
                <Link to="/user/dashboard" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/user/bookings" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  My Bookings
                </Link>
                <Link to="/user/favorites" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Favorites
                </Link>
                <Link to="/user/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
              </>
            )}

            {user && user.role === 'worker' && (
              <>
                <Link to="/worker/dashboard" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/worker/bookings" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Bookings
                </Link>
                <Link to="/worker/earnings" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Earnings
                </Link>
                <Link to="/worker/profile" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Profile
                </Link>
              </>
            )}

            {user && user.role === 'admin' && (
              <>
                <Link to="/admin/dashboard" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Dashboard
                </Link>
                <Link to="/admin/services" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Services
                </Link>
                <Link to="/admin/users" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Users
                </Link>
                <Link to="/admin/workers" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Workers
                </Link>
                <Link to="/admin/bookings" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Bookings
                </Link>
                <Link to="/admin/analytics" className="mobile-link" onClick={() => setIsMenuOpen(false)}>
                  Analytics
                </Link>
              </>
            )}
          </div>
        )}
      </nav>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,600&family=Lato:wght@300;400;500&display=swap');

        .navbar {
          background: #1a1a1a;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
          position: sticky;
          top: 0;
          z-index: 1000;
          font-family: 'Lato', sans-serif;
        }

        .nav-container {
          max-width: 100%;
          padding: 1.2rem 6rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        /* Right Side Container - Groups nav links and actions */
        .nav-right-container {
          display: flex;
          align-items: center;
          gap: 3rem;
        }

        /* Logo */
        .logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.8rem;
          font-weight: 700;
          font-style: italic;
          color: white;
          text-decoration: none;
          transition: color 0.3s;
        }

        .logo:hover {
          color: #e67e22;
        }

        /* Navigation Links */
        .nav-links {
          display: flex;
          align-items: center;
          gap: 2.5rem;
        }

        .nav-link {
          color: white;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 400;
          transition: all 0.3s;
          position: relative;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: white;
          transition: width 0.3s;
        }

        .nav-link:hover {
          color: #e67e22;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        /* Right Side Actions */
        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: white;
        }

        .user-name {
          font-weight: 500;
          text-transform: capitalize;
        }

        .user-role {
          font-size: 0.9rem;
          color: #e67e22;
          font-weight: 300;
        }

        .notification-wrapper {
          display: flex;
          align-items: center;
        }

        .login-link {
          color: white;
          text-decoration: none;
          font-weight: 400;
          transition: color 0.3s;
        }

        .login-link:hover {
          color: #333;
        }

        .register-btn {
          background: #e67e22;
          color: white;
          border: none;
          padding: 0.7rem 2rem;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 400;
          transition: all 0.3s;
          display: inline-block;
        }

        .register-btn:hover {
          background: #d35400;
          transform: translateY(-1px);
        }

        .logout-btn {
          background: #e74c3c;
          color: white;
          border: none;
          padding: 0.6rem 1.5rem;
          border-radius: 6px;
          font-size: 0.95rem;
          font-weight: 400;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Lato', sans-serif;
        }

        .logout-btn:hover {
          background: #c0392b;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(231, 76, 60, 0.3);
        }

        /* Mobile Menu Button */
        .menu-toggle {
          display: none;
          flex-direction: column;
          gap: 4px;
          background: #2a2a2a;
          border: none;
          width: 45px;
          height: 45px;
          border-radius: 8px;
          cursor: pointer;
          padding: 10px;
          transition: all 0.3s;
        }

        .menu-toggle:hover {
          background: #3a3a3a;
        }

        .menu-toggle span {
          width: 100%;
          height: 3px;
          background: white;
          border-radius: 2px;
          transition: all 0.3s;
        }

        /* Mobile Menu */
        .mobile-menu {
          display: none;
          flex-direction: column;
          padding: 1rem 3rem 2rem;
          gap: 1rem;
          background: #2a2a2a;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .mobile-link {
          color: white;
          text-decoration: none;
          font-size: 1rem;
          font-weight: 400;
          padding: 0.75rem 1rem;
          border-radius: 8px;
          transition: all 0.3s;
        }

        .mobile-link:hover {
          background: rgba(230, 126, 34, 0.1);
          color: #e67e22;
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .nav-container {
            padding: 1.2rem 2rem;
          }

          .nav-links {
            gap: 2rem;
          }
        }

        @media (max-width: 1024px) {
          .nav-link {
            font-size: 0.95rem;
          }

          .nav-links {
            gap: 1.5rem;
          }
        }

        @media (max-width: 900px) {
          .desktop-nav {
            display: none;
          }

          .menu-toggle {
            display: flex;
          }

          .mobile-menu {
            display: flex;
          }

          .nav-container {
            padding: 1rem 1.5rem;
          }

          .user-info {
            display: none;
          }

          .notification-wrapper {
            order: -1;
          }
        }

        @media (max-width: 480px) {
          .nav-container {
            padding: 1rem;
          }

          .logo {
            font-size: 1.5rem;
          }

          .nav-actions {
            gap: 1rem;
          }

          .register-btn,
          .logout-btn {
            padding: 0.5rem 1.2rem;
            font-size: 0.9rem;
          }

          .mobile-menu {
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default Navbar;
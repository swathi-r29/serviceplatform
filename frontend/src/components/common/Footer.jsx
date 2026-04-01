import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <footer className="footer">
        <div className="footer-container">
          {/* Footer Top Section */}
          <div className="footer-top">
            {/* Brand Section */}
            <div className="footer-brand">
              <h2 className="footer-logo">ServiceHub</h2>
              <p className="footer-tagline">
                SO YOU CAN<br />
                GET IT DONE
              </p>
            </div>

            {/* Footer Links Grid */}
            <div className="footer-links-grid">
              {/* Company Column */}
              <div className="footer-column">
                <h3 className="footer-heading">COMPANY</h3>
                <ul className="footer-list">
                  <li><Link to="/about">About ServiceHub</Link></li>
                  <li><Link to="/services">Our Services</Link></li>
                  <li><Link to="/pricing">Pricing Plans</Link></li>
                  <li><Link to="/careers">Careers</Link></li>
                  <li><Link to="/press">Press</Link></li>
                </ul>
              </div>

              {/* Features Column */}
              <div className="footer-column">
                <h3 className="footer-heading">FEATURES</h3>
                <ul className="footer-list">
                  <li><Link to="/services/plumbing">Plumbing</Link></li>
                  <li><Link to="/services/electrical">Electrical</Link></li>
                  <li><Link to="/services/cleaning">Cleaning</Link></li>
                  <li><Link to="/services/carpentry">Carpentry</Link></li>
                  <li><Link to="/worker/register">Become a Provider</Link></li>
                  <li><Link to="/how-it-works">How It Works</Link></li>
                </ul>
              </div>

              {/* Community Column */}
              <div className="footer-column">
                <h3 className="footer-heading">COMMUNITY</h3>
                <ul className="footer-list">
                  <li><Link to="/blog">What's New</Link></li>
                  <li><Link to="/community">Service Community</Link></li>
                  <li><Link to="/testimonials">Customer Stories</Link></li>
                  <li><Link to="/guidelines">Guidelines</Link></li>
                  <li><Link to="/safety">Safety</Link></li>
                  <li><Link to="/support">Support</Link></li>
                </ul>
              </div>

              {/* Resources Column */}
              <div className="footer-column">
                <h3 className="footer-heading">RESOURCES</h3>
                <ul className="footer-list">
                  <li><Link to="/help">Help Center</Link></li>
                  <li><Link to="/guides">Service Guides</Link></li>
                  <li><Link to="/tips">Home Care Tips</Link></li>
                  <li><Link to="/business">Business Solutions</Link></li>
                  <li><Link to="/blog">Blog</Link></li>
                </ul>
              </div>
            </div>
          </div>

          {/* Footer Bottom Section */}
          <div className="footer-bottom">
            <div className="footer-bottom-left">
              <div className="footer-brand-icon">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                  <circle cx="20" cy="20" r="18" stroke="white" strokeWidth="2"/>
                  <path d="M15 20L18 23L25 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="footer-brand-name">ServiceHub</span>
              </div>
              <p className="footer-copyright">
                &copy; {currentYear} ServiceHub. All rights reserved.
              </p>
            </div>

            <div className="footer-bottom-right">
              <Link to="/register" className="footer-btn footer-btn-primary">
                TRY FOR FREE
              </Link>
              <Link to="/login" className="footer-btn footer-btn-secondary">
                SIGN IN
              </Link>
            </div>
          </div>

          {/* Footer Legal Links */}
          <div className="footer-legal">
            <Link to="/privacy">Privacy Policy</Link>
            <span className="separator">•</span>
            <Link to="/terms">Terms of Service</Link>
            <span className="separator">•</span>
            <Link to="/cookies">Cookie Policy</Link>
          </div>
        </div>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;500;600;700&display=swap');

        .footer {
          background: #1a1a1a;
          color: white;
          padding: 4rem 0 2rem;
          margin-top: auto;
          font-family: 'Lato', sans-serif;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 3rem;
        }

        /* Footer Top Section */
        .footer-top {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 4rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Brand Section */
        .footer-brand {
          max-width: 300px;
        }

        .footer-logo {
          font-family: 'Playfair Display', serif;
          font-size: 2rem;
          font-weight: 700;
          font-style: italic;
          color: white;
          margin-bottom: 1.5rem;
        }

        .footer-tagline {
          font-size: 1.8rem;
          font-weight: 700;
          line-height: 1.3;
          letter-spacing: 0.02em;
          color: white;
        }

        /* Footer Links Grid */
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3rem;
        }

        .footer-column {
          display: flex;
          flex-direction: column;
        }

        .footer-heading {
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          color: white;
          margin-bottom: 1.5rem;
        }

        .footer-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .footer-list li a {
          color: rgba(255, 255, 255, 0.7);
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 400;
          transition: color 0.3s;
          display: inline-block;
        }

        .footer-list li a:hover {
          color: white;
        }

        /* Footer Bottom Section */
        .footer-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 2.5rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .footer-bottom-left {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .footer-brand-icon {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-brand-name {
          font-family: 'Playfair Display', serif;
          font-size: 1.2rem;
          font-weight: 700;
          font-style: italic;
        }

        .footer-copyright {
          color: rgba(255, 255, 255, 0.6);
          font-size: 0.9rem;
        }

        .footer-bottom-right {
          display: flex;
          gap: 1rem;
        }

        .footer-btn {
          padding: 0.75rem 2rem;
          border-radius: 25px;
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          transition: all 0.3s;
          display: inline-block;
          text-align: center;
        }

        .footer-btn-primary {
          background: white;
          color: #1a1a1a;
        }

        .footer-btn-primary:hover {
          background: #f0f0f0;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2);
        }

        .footer-btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }

        .footer-btn-secondary:hover {
          background: white;
          color: #1a1a1a;
          transform: translateY(-2px);
        }

        /* Footer Legal */
        .footer-legal {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
          padding: 2rem 0 0;
        }

        .footer-legal a {
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.85rem;
          transition: color 0.3s;
        }

        .footer-legal a:hover {
          color: white;
        }

        .footer-legal .separator {
          color: rgba(255, 255, 255, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }

          .footer-top {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
        }

        @media (max-width: 768px) {
          .footer-container {
            padding: 0 2rem;
          }

          .footer {
            padding: 3rem 0 1.5rem;
          }

          .footer-top {
            gap: 2rem;
          }

          .footer-tagline {
            font-size: 1.5rem;
          }

          .footer-links-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 2rem;
            text-align: center;
          }

          .footer-bottom-left {
            align-items: center;
          }

          .footer-bottom-right {
            flex-direction: column;
            width: 100%;
            max-width: 300px;
          }

          .footer-btn {
            width: 100%;
          }

          .footer-legal {
            flex-wrap: wrap;
            gap: 0.5rem;
          }
        }

        @media (max-width: 480px) {
          .footer-container {
            padding: 0 1.5rem;
          }

          .footer-logo {
            font-size: 1.5rem;
          }

          .footer-tagline {
            font-size: 1.2rem;
          }

          .footer-heading {
            font-size: 0.7rem;
          }

          .footer-list li a {
            font-size: 0.9rem;
          }
        }
      `}</style>
    </>
  );
};

export default Footer;
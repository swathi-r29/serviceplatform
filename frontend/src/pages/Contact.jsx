import { useState } from 'react';
import { Link } from 'react-router-dom';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // Simulate API call - replace with your actual API endpoint
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Success
      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="contact-page">
        {/* Hero Section */}
        <div className="contact-hero">
          <div className="hero-content">
            <h1 className="hero-title">Get in Touch</h1>
            <p className="hero-subtitle">
              We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

        </div>

        {/* Main Content */}
        <div className="contact-container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info-section">
              <h2 className="section-title">Contact Information</h2>
              <p className="section-subtitle">
                Reach out to us through any of these channels
              </p>

              <div className="info-cards">
                <div className="info-card">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>Visit Us</h3>
                    <p>123 Service Street, Madurai</p>
                    <p>Tamil Nadu, India 625001</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>Call Us</h3>
                    <p>+91 98765 43210</p>
                    <p>Mon - Sat: 9:00 AM - 6:00 PM</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>Email Us</h3>
                    <p>support@servicehub.com</p>
                    <p>info@servicehub.com</p>
                  </div>
                </div>

                <div className="info-card">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  </div>
                  <div className="info-content">
                    <h3>Working Hours</h3>
                    <p>Monday - Friday: 9:00 AM - 7:00 PM</p>
                    <p>Saturday: 10:00 AM - 5:00 PM</p>
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="social-section">
                <h3>Follow Us</h3>
                <div className="social-links">
                  <a href="#facebook" className="social-link" aria-label="Facebook">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    </svg>
                  </a>
                  <a href="#twitter" className="social-link" aria-label="Twitter">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                  </a>
                  <a href="#instagram" className="social-link" aria-label="Instagram">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  </a>
                  <a href="#linkedin" className="social-link" aria-label="LinkedIn">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" />
                      <circle cx="4" cy="4" r="2" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-section">
              <h2 className="section-title">Send us a Message</h2>
              <p className="section-subtitle">
                Fill out the form below and we'll get back to you shortly
              </p>

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="name">Your Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="subject">Subject *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message *</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us more about your inquiry..."
                    rows="6"
                    required
                  ></textarea>
                </div>

                {submitStatus === 'success' && (
                  <div className="alert alert-success">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                    Thank you! Your message has been sent successfully.
                  </div>
                )}

                {submitStatus === 'error' && (
                  <div className="alert alert-error">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="15" y1="9" x2="9" y2="15" />
                      <line x1="9" y1="9" x2="15" y2="15" />
                    </svg>
                    Oops! Something went wrong. Please try again.
                  </div>
                )}

                <button type="submit" className="submit-button" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <span className="spinner-small"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Map Section */}
          <div className="map-section">
            <h2 className="section-title">Find Us</h2>
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d126093.81196164954!2d78.06294449726562!3d9.925032999999996!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b00c582b1189633%3A0xdc955b7264f63933!2sMadurai%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1642588897655!5m2!1sen!2sin"
                width="100%"
                height="450"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="ServiceHub Location"
              ></iframe>
            </div>
          </div>

          {/* FAQ Quick Links */}
          <div className="faq-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              Find quick answers to common questions or <Link to="/services">browse our services</Link>
            </p>
            <div className="faq-links">
              <Link to="/services" className="faq-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                Browse Services
              </Link>
              <Link to="/login" className="faq-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
                Login / Register
              </Link>
              <a href="#support" className="faq-link">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                Help Center
              </a>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Lato:wght@300;400;600;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .contact-page {
          min-height: 100vh;
          background: #faf8f5;
          font-family: 'Lato', sans-serif;
        }

        /* Hero Section */
        .contact-hero {
          background: linear-gradient(135deg, #fdf2e9 0%, #fae5d3 50%, #f6cba6 100%);
          padding: 6rem 2rem 4rem;
          position: relative;
          overflow: hidden;
        }

        .hero-content {
          max-width: 800px;
          margin: 0 auto;
          text-align: center;
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-size: 4rem;
          font-weight: 900;
          color: #2c2c2c;
          margin-bottom: 1rem;
          animation: fadeInUp 0.8s ease-out;
        }

        .hero-subtitle {
          font-size: 1.2rem;
          color: #5a5a5a;
          line-height: 1.8;
          animation: fadeInUp 1s ease-out 0.2s both;
        }



        /* Main Container */
        .contact-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        /* Contact Grid */
        .contact-grid {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: #6b7280;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 2rem;
        }

        /* Contact Info Cards */
        .info-cards {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          margin-bottom: 3rem;
        }

        .info-card {
          display: flex;
          gap: 1.5rem;
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .info-card:hover {
          transform: translateX(8px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .info-icon {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
        }

        .info-content h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 0.5rem;
        }

        .info-content p {
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        /* Social Section */
        .social-section {
          padding: 1.5rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        }

        .social-section h3 {
          font-size: 1.1rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 1rem;
        }

        .social-links {
          display: flex;
          gap: 1rem;
        }

        .social-link {
          width: 44px;
          height: 44px;
          background: #f3f4f6;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .social-link:hover {
          background: #e67e22;
          color: white;
          transform: translateY(-4px);
        }

        /* Contact Form */
        .contact-form-section {
          background: white;
          padding: 2.5rem;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 600;
          color: #2c2c2c;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group textarea {
          padding: 0.875rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          font-family: 'Lato', sans-serif;
          transition: all 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #e67e22;
          box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
        }

        .form-group textarea {
          resize: vertical;
          min-height: 120px;
        }

        /* Alerts */
        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-radius: 8px;
          font-size: 0.95rem;
        }

        .alert-success {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #6ee7b7;
        }

        .alert-error {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        /* Submit Button */
        .submit-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          background: #2c2c2c;
          color: white;
          padding: 1rem 2.5rem;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          font-family: 'Lato', sans-serif;
        }

        .submit-button:hover:not(:disabled) {
          background: #1a1a1a;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner-small {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        /* Map Section */
        .map-section {
          margin-bottom: 4rem;
        }

        .map-container {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        /* FAQ Section */
        .faq-section {
          text-align: center;
        }

        .faq-section .section-subtitle {
          margin-bottom: 2rem;
        }

        .faq-section .section-subtitle a {
          color: #e67e22;
          text-decoration: none;
          font-weight: 600;
        }

        .faq-section .section-subtitle a:hover {
          text-decoration: underline;
        }

        .faq-links {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .faq-link {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 2rem;
          background: white;
          color: #2c2c2c;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          transition: all 0.3s ease;
        }

        .faq-link:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
          background: #e67e22;
          color: white;
        }

        .faq-link svg {
          color: #e67e22;
        }

        .faq-link:hover svg {
          color: white;
        }

        /* Animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }



        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive Design */
        @media (max-width: 1024px) {
          .contact-grid {
            grid-template-columns: 1fr;
            gap: 3rem;
          }

          .hero-title {
            font-size: 3rem;
          }
        }

        @media (max-width: 768px) {
          .contact-hero {
            padding: 4rem 1.5rem 3rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .contact-container {
            padding: 3rem 1.5rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .contact-form-section {
            padding: 2rem 1.5rem;
          }

          .form-row {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .faq-links {
            flex-direction: column;
          }

          .faq-link {
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .section-title {
            font-size: 1.75rem;
          }

          .info-card {
            flex-direction: column;
            text-align: center;
          }

          .info-icon {
            margin: 0 auto;
          }

          .submit-button {
            width: 100%;
          }
        }
      `}</style>
    </>
  );
};

export default Contact;
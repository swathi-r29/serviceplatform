import { useState } from 'react';
import { Link } from 'react-router-dom';

const Support = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFAQ, setExpandedFAQ] = useState(null);

  const faqs = [
    {
      id: 1,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'To create an account, click on the "Register" button in the top navigation. Fill in your personal details, choose your role (User, Worker, or Admin), and verify your email address. Once verified, you can start using our services.'
    },
    {
      id: 2,
      category: 'account',
      question: 'I forgot my password. What should I do?',
      answer: 'Click on "Login" and then select "Forgot Password". Enter your registered email address, and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      id: 3,
      category: 'booking',
      question: 'How do I book a service?',
      answer: 'Browse our services page, select the service you need, and click "Book Now". Choose your preferred date and time, provide service details, and complete the payment. You\'ll receive a confirmation email with booking details.'
    },
    {
      id: 4,
      category: 'booking',
      question: 'Can I cancel or reschedule my booking?',
      answer: 'Yes, you can cancel or reschedule bookings from your dashboard up to 24 hours before the scheduled time. Go to "My Bookings" and select the booking you want to modify. Note that cancellation fees may apply for last-minute changes.'
    },
    {
      id: 5,
      category: 'payment',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit/debit cards, UPI, net banking, and digital wallets. All payments are processed securely through encrypted channels. You can view your payment history in your account dashboard.'
    },
    {
      id: 6,
      category: 'payment',
      question: 'When will I be charged for a booking?',
      answer: 'Payment is processed immediately upon booking confirmation. For certain services, a deposit may be required upfront, with the remaining balance due upon completion.'
    },
    {
      id: 7,
      category: 'worker',
      question: 'How do I become a service provider?',
      answer: 'Register as a worker by selecting "Worker" during registration. Complete your profile with your skills, experience, and service areas. Upload necessary certifications and wait for admin approval. Once approved, you can start accepting bookings.'
    },
    {
      id: 8,
      category: 'worker',
      question: 'How do I set my availability?',
      answer: 'In your worker dashboard, go to "Availability" or "Schedule". Set your working hours, days off, and any specific time slots. You can also block out dates for holidays or personal time.'
    },
    {
      id: 9,
      category: 'general',
      question: 'Is my personal information secure?',
      answer: 'Yes, we take data security seriously. All personal information is encrypted and stored securely. We comply with data protection regulations and never share your information with third parties without your consent.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions' },
    { id: 'account', name: 'Account' },
    { id: 'booking', name: 'Booking' },
    { id: 'payment', name: 'Payment' },
    { id: 'worker', name: 'Service Provider' },
    { id: 'general', name: 'General' }
  ];

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFAQ = (id) => {
    setExpandedFAQ(expandedFAQ === id ? null : id);
  };

  return (
    <>
      <div className="support-page">
        {/* Hero Section */}
        <div className="support-hero">
          <div className="hero-content">
            <h1 className="hero-title">Help & Support</h1>
            <p className="hero-subtitle">
              Find answers to common questions or get in touch with our support team
            </p>
          </div>

        </div>

        {/* Main Content */}
        <div className="support-container">
          {/* Search and Filter Section */}
          <div className="search-section">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            <div className="category-filters">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`category-button ${selectedCategory === category.id ? 'active' : ''}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            <p className="section-subtitle">
              {filteredFAQs.length} {filteredFAQs.length === 1 ? 'question' : 'questions'} found
            </p>

            <div className="faq-list">
              {filteredFAQs.map(faq => (
                <div key={faq.id} className="faq-item">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="faq-question"
                  >
                    <span>{faq.question}</span>
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      className={`faq-icon ${expandedFAQ === faq.id ? 'rotated' : ''}`}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {expandedFAQ === faq.id && (
                    <div className="faq-answer">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFAQs.length === 0 && (
              <div className="no-results">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.35-4.35" />
                </svg>
                <h3>No questions found</h3>
                <p>Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Contact Support Section */}
          <div className="contact-support-section">
            <h2 className="section-title">Still need help?</h2>
            <p className="section-subtitle">
              Can't find what you're looking for? Our support team is here to help
            </p>

            <div className="contact-options">
              <div className="contact-option">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="contact-content">
                  <h3>Email Support</h3>
                  <p>Get help via email</p>
                  <a href="mailto:support@servicehub.com" className="contact-link">
                    support@servicehub.com
                  </a>
                </div>
              </div>

              <div className="contact-option">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="contact-content">
                  <h3>Phone Support</h3>
                  <p>Speak with our team</p>
                  <a href="tel:+919876543210" className="contact-link">
                    +91 98765 43210
                  </a>
                </div>
              </div>

              <div className="contact-option">
                <div className="contact-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div className="contact-content">
                  <h3>Live Chat</h3>
                  <p>Chat with us instantly</p>
                  <button className="contact-link chat-button">
                    Start Chat
                  </button>
                </div>
              </div>
            </div>

            <div className="contact-form-section">
              <h3>Send us a message</h3>
              <p>We'll get back to you within 24 hours</p>
              <Link to="/contact" className="contact-form-link">
                Go to Contact Page
              </Link>
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

        .support-page {
          min-height: 100vh;
          background: #faf8f5;
          font-family: 'Lato', sans-serif;
        }

        /* Hero Section */
        .support-hero {
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
        .support-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 2rem;
        }

        /* Search Section */
        .search-section {
          background: white;
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          margin-bottom: 3rem;
        }

        .search-container {
          margin-bottom: 2rem;
        }

        .search-input-wrapper {
          position: relative;
          max-width: 500px;
          margin: 0 auto;
        }

        .search-input-wrapper svg {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #6b7280;
        }

        .search-input {
          width: 100%;
          padding: 1rem 1rem 1rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 8px;
          font-size: 1rem;
          font-family: 'Lato', sans-serif;
          transition: all 0.3s ease;
        }

        .search-input:focus {
          outline: none;
          border-color: #e67e22;
          box-shadow: 0 0 0 3px rgba(230, 126, 34, 0.1);
        }

        .category-filters {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .category-button {
          padding: 0.5rem 1.5rem;
          background: #f3f4f6;
          color: #6b7280;
          border: none;
          border-radius: 20px;
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .category-button:hover {
          background: #e5e7eb;
        }

        .category-button.active {
          background: #e67e22;
          color: white;
        }

        /* FAQ Section */
        .faq-section {
          margin-bottom: 4rem;
        }

        .section-title {
          font-family: 'Playfair Display', serif;
          font-size: 2.5rem;
          font-weight: 700;
          color: #2c2c2c;
          text-align: center;
          margin-bottom: 0.5rem;
        }

        .section-subtitle {
          color: #6b7280;
          font-size: 1rem;
          text-align: center;
          margin-bottom: 2rem;
        }

        .faq-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .faq-item {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
          overflow: hidden;
        }

        .faq-question {
          width: 100%;
          padding: 1.5rem;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 1.1rem;
          font-weight: 600;
          color: #2c2c2c;
          transition: all 0.3s ease;
        }

        .faq-question:hover {
          background: #f9fafb;
        }

        .faq-icon {
          transition: transform 0.3s ease;
          color: #e67e22;
        }

        .faq-icon.rotated {
          transform: rotate(180deg);
        }

        .faq-answer {
          padding: 0 1.5rem 1.5rem;
          border-top: 1px solid #e5e7eb;
        }

        .faq-answer p {
          color: #6b7280;
          line-height: 1.6;
          margin: 0;
        }

        .no-results {
          text-align: center;
          padding: 3rem;
          color: #6b7280;
        }

        .no-results svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .no-results h3 {
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
          color: #2c2c2c;
        }

        /* Contact Support Section */
        .contact-support-section {
          background: white;
          padding: 3rem 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          text-align: center;
        }

        .contact-options {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .contact-option {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          padding: 2rem;
          background: #f9fafb;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .contact-option:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
        }

        .contact-icon {
          width: 64px;
          height: 64px;
          background: linear-gradient(135deg, #e67e22 0%, #d35400 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
        }

        .contact-content h3 {
          font-size: 1.2rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 0.5rem;
        }

        .contact-content p {
          color: #6b7280;
          margin-bottom: 1rem;
        }

        .contact-link {
          color: #e67e22;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .contact-link:hover {
          text-decoration: underline;
        }

        .chat-button {
          background: #e67e22;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          font-weight: 600;
        }

        .chat-button:hover {
          background: #d35400;
        }

        .contact-form-section {
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
        }

        .contact-form-section h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #2c2c2c;
          margin-bottom: 0.5rem;
        }

        .contact-form-section p {
          color: #6b7280;
          margin-bottom: 1.5rem;
        }

        .contact-form-link {
          display: inline-block;
          background: #2c2c2c;
          color: white;
          padding: 1rem 2rem;
          text-decoration: none;
          border-radius: 8px;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .contact-form-link:hover {
          background: #1a1a1a;
          transform: translateY(-2px);
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



        /* Responsive Design */
        @media (max-width: 768px) {
          .support-hero {
            padding: 4rem 1.5rem 3rem;
          }

          .hero-title {
            font-size: 2.5rem;
          }

          .hero-subtitle {
            font-size: 1rem;
          }

          .support-container {
            padding: 3rem 1.5rem;
          }

          .search-section {
            padding: 1.5rem;
          }

          .category-filters {
            gap: 0.5rem;
          }

          .category-button {
            padding: 0.4rem 1rem;
            font-size: 0.8rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .contact-options {
            grid-template-columns: 1fr;
          }

          .contact-option {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .hero-title {
            font-size: 2rem;
          }

          .faq-question {
            font-size: 1rem;
            padding: 1rem;
          }

          .faq-answer {
            padding: 0 1rem 1rem;
          }
        }
      `}</style>
    </>
  );
};

export default Support;

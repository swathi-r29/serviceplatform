import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  FaGlobe, FaSearch, FaCalendarPlus, FaUserShield, FaStar,
  FaFileSignature, FaCheckCircle, FaBell, FaBriefcase, FaChartLine,
  FaShieldAlt, FaBolt, FaCreditCard, FaClock, FaAward, FaComments,
  FaArrowRight
} from 'react-icons/fa';

const HowItWorksPage = () => {
  const [isVisible, setIsVisible] = useState({});
  const sectionRefs = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    sectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  const userSteps = [
    {
      icon: <FaGlobe />,
      title: 'Visit ServiceHub',
      description: 'Open your browser and visit servicehub.com - no app downloads required!',
    },
    {
      icon: <FaSearch />,
      title: 'Choose Service',
      description: 'Browse through our wide range of home services and select what you need',
    },
    {
      icon: <FaCalendarPlus />,
      title: 'Book Appointment',
      description: 'Select your preferred date, time slot, and provide service details online',
    },
    {
      icon: <FaUserShield />,
      title: 'Professional Arrives',
      description: 'Our verified professional arrives at your doorstep at the scheduled time',
    },
    {
      icon: <FaStar />,
      title: 'Rate & Review',
      description: 'Service completed! Rate your experience and help us serve you better',
    },
  ];

  const workerSteps = [
    {
      icon: <FaFileSignature />,
      title: 'Register Online',
      description: 'Sign up on our platform with your skills, experience, and certifications',
    },
    {
      icon: <FaCheckCircle />,
      title: 'Get Verified',
      description: 'Complete background check and skill verification process',
    },
    {
      icon: <FaBell />,
      title: 'Receive Bookings',
      description: 'Get notified of service requests in your area through our platform',
    },
    {
      icon: <FaBriefcase />,
      title: 'Complete Jobs',
      description: 'Deliver quality service and build your reputation online',
    },
    {
      icon: <FaChartLine />,
      title: 'Earn & Grow',
      description: 'Get paid instantly and grow your business with ServiceHub',
    },
  ];

  const features = [
    {
      icon: <FaShieldAlt />,
      title: 'Safe & Secure',
      description: 'All professionals are background verified and trained. Your safety is our priority.',
    },
    {
      icon: <FaBolt />,
      title: 'Instant Booking',
      description: 'Book services in under 60 seconds directly from your browser - no app needed.',
    },
    {
      icon: <FaCreditCard />,
      title: 'Flexible Payment',
      description: 'Multiple payment options including cash, card, UPI, and digital wallets.',
    },
    {
      icon: <FaClock />,
      title: 'On-Time Service',
      description: 'Professionals arrive on time or we compensate you with credits.',
    },
    {
      icon: <FaAward />,
      title: 'Quality Guaranteed',
      description: '100% satisfaction guarantee or we redo the service for free.',
    },
    {
      icon: <FaComments />,
      title: '24/7 Support',
      description: 'Round-the-clock customer support available via chat, email, and phone.',
    },
  ];

  return (
    <div className="hiw-container">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;0,800;1,600&family=DM+Sans:wght@300;400;500;600&display=swap');
        
        .hiw-container {
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
          
          
          position: relative;
          overflow-x: hidden;
        }

        .hiw-hero {
          height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 0 1.5rem;
          position: relative;
          overflow: hidden;
          background: #f0e8d8;
        }

        .hiw-bg {
          position: absolute; inset: 0;
          background-image: url('/cleaning_hero_bg.png');
          background-size: cover;
          background-position: center;
          opacity: 1;
          z-index: 0;
        }

        .hiw-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(240, 232, 216, 0.9) 0%, rgba(240, 232, 216, 0.8) 100%);
          z-index: 1;
        }

        .hero-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-30%, -30%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(196, 151, 93, 0.15) 0%, transparent 70%);
          pointer-events: none;
          z-index: 1;
        }

        @keyframes float {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(30px, 40px) scale(1.1); }
        }

        .hiw-title {
          font-family: 'Playfair Display', serif;
          font-size: 6.5rem;
          font-weight: 800;
          margin-bottom: 2rem;
          line-height: 1;
          color: #1a2b4b;
          position: relative;
          z-index: 2;
        }

        .hiw-title em { color: #c4975d; font-style: italic; }

        .hiw-subtitle {
          font-size: 1.35rem;
          color: #555;
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.8;
          position: relative;
          z-index: 2;
        }

        .glass-box {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.8);
          border-radius: 32px;
          padding: 3.5rem 2.5rem;
          height: 100%;
          transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.03);
          position: relative;
          display: flex;
          flex-direction: column;
        }

        .glass-box:hover {
          transform: translateY(-12px);
          background: white;
          border-color: #c4975d;
          box-shadow: 0 30px 60px rgba(196, 151, 93, 0.12);
        }

        .section-tag {
          display: inline-block;
          color: #c4975d;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          font-size: 0.8rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .step-num {
          font-family: 'Playfair Display', serif;
          font-size: 4rem;
          font-weight: 800;
          color: rgba(196, 151, 93, 0.05);
          position: absolute;
          top: 1rem;
          right: 2rem;
          transition: 0.3s;
        }

        .glass-box:hover .step-num {
          color: rgba(196, 151, 93, 0.15);
          transform: scale(1.1);
        }

        .feature-icon {
          width: 70px;
          height: 70px;
          background: #fbf8f2;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-bottom: 2rem;
          border: 1.5px solid rgba(196, 151, 93, 0.15);
          color: #c4975d;
          transition: 0.3s;
        }

        .glass-box:hover .feature-icon {
          background: #c4975d;
          color: white;
          transform: rotate(-5deg);
        }

        .cta-btn {
          padding: 1.25rem 3rem;
          border-radius: 50px;
          font-weight: 700;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
        }

        .cta-primary {
          background: #1a2b4b;
          color: white;
        }

        .cta-primary:hover {
          background: #2a3b5b;
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 20px 40px rgba(26, 43, 75, 0.2);
        }

        .cta-black {
          background: #000000;
          color: white;
        }

        .cta-black:hover {
          background: #111;
          transform: translateY(-5px) scale(1.05);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .cta-outline {
          border: 2px solid #c4975d;
          color: #1a2b4b;
        }

        .cta-outline:hover {
          background: #c4975d;
          color: white;
          transform: translateY(-5px);
        }

        @media (max-width: 1024px) {
          .hiw-title { font-size: 4rem; }
        }

        @media (max-width: 768px) {
          .hiw-title { font-size: 3rem; }
          .hiw-hero { height: auto; padding: 120px 1.5rem; }
        }

        @keyframes reveal {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .reveal { opacity: 0; }
        .is-visible { animation: reveal 1s cubic-bezier(0.2, 0, 0, 1) forwards; }

        .stagger-1 { animation-delay: 0.1s; }
        .stagger-2 { animation-delay: 0.2s; }
        .stagger-3 { animation-delay: 0.3s; }
        .stagger-4 { animation-delay: 0.4s; }
        .stagger-5 { animation-delay: 0.5s; }
      `}</style>

      {/* Hero Section */}
      <section className="hiw-hero">
        <div className="hiw-bg" />
        <div className="hiw-overlay" />
        <div className="hero-glow" />

        <div className="container mx-auto relative z-10 reveal is-visible">
          <span className="section-tag">Simplified Process</span>
          <h1 className="hiw-title">
            Your Premium Home<br />Service <em>Partner</em>
          </h1>
          <p className="hiw-subtitle">
            We've reimagined home services for the modern world. No apps to install,
            no endless searches—just verified professionals at your service with one touch.
          </p>
          <div className="mt-12 flex flex-wrap justify-center gap-6">
            <Link to="/services" className="cta-btn cta-primary shadow-xl">
              Get Started Now <FaArrowRight className="text-sm" />
            </Link>
          </div>
        </div>
      </section>

      {/* Content Wrapper */}
      <div className="relative z-10">
        {/* FOR CUSTOMERS */}
        <section className="py-32" id="users-section" ref={(el) => (sectionRefs.current[0] = el)}>
          <div className="container mx-auto px-6">
            <div className={`text-center mb-20 reveal ${isVisible['users-section'] ? 'is-visible' : ''}`}>
              <span className="section-tag">For Customers</span>
              <h2 className="text-5xl font-playfair font-bold text-[#1a2b4b]">
                Effortless <em>Booking</em> Journey
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {userSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`relative reveal ${isVisible['users-section'] ? 'is-visible' : ''} stagger-${(idx % 3) + 1}`}
                >
                  <div className="glass-box">
                    <span className="step-num">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="feature-icon">{step.icon}</div>
                    <h3 className="text-2xl font-bold mb-4 text-[#1a2b4b]">{step.title}</h3>
                    <p className="text-[#555] leading-relaxed font-medium">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOR PROFESSIONALS */}
        <section className="py-32 bg-[#f9f7f2]" id="workers-section" ref={(el) => (sectionRefs.current[1] = el)}>
          <div className="container mx-auto px-6">
            <div className={`text-center mb-20 reveal ${isVisible['workers-section'] ? 'is-visible' : ''}`}>
              <span className="section-tag">For Professionals</span>
              <h2 className="text-5xl font-playfair font-bold text-[#1a2b4b]">
                Empowering Your <em>Expertise</em>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {workerSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`relative reveal ${isVisible['workers-section'] ? 'is-visible' : ''} stagger-${(idx % 3) + 1}`}
                >
                  <div className="glass-box">
                    <span className="step-num">{String(idx + 1).padStart(2, '0')}</span>
                    <div className="feature-icon">{step.icon}</div>
                    <h3 className="text-2xl font-bold mb-4 text-[#1a2b4b]">{step.title}</h3>
                    <p className="text-[#555] leading-relaxed font-medium">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-32" id="features-section" ref={(el) => (sectionRefs.current[2] = el)}>
          <div className="container mx-auto px-6">
            <div className={`text-center mb-20 reveal ${isVisible['features-section'] ? 'is-visible' : ''}`}>
              <span className="section-tag">The ServiceHub Difference</span>
              <h2 className="text-5xl font-playfair font-bold text-[#1a2b4b]">Built with <em>Care</em></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {features.map((feature, idx) => (
                <div
                  key={idx}
                  className={`reveal ${isVisible['features-section'] ? 'is-visible' : ''} stagger-${(idx % 3) + 1}`}
                >
                  <div className="glass-box !padding-8">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3 className="text-2xl font-bold mb-4 text-[#1a2b4b]">{feature.title}</h3>
                    <p className="text-[#555] leading-relaxed font-medium">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="py-40 text-center relative overflow-hidden">
          <div className="container mx-auto px-6 relative z-10 reveal is-visible stagger-3">
            <h2 className="text-6xl font-playfair font-bold mb-10 text-[#1a2b4b]">
              Redefine Your <em>Living</em> Experience
            </h2>
            <div className="flex flex-wrap justify-center gap-8">
              <Link to="/services" className="cta-btn cta-black shadow-2xl">
                Start Exploring
              </Link>
              <Link to="/worker/register" className="cta-btn cta-outline">
                Join as Professional
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default HowItWorksPage;
